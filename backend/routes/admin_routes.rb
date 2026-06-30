require_relative '../middleware/jwt_auth'

module Routes
  module Admin
    def self.registered(app)

      app.helpers do
        def require_admin!
          authenticate!
          halt 403, { error: 'Admin access required' }.to_json unless @current_user['role'] == 'admin'
        end

        def paginate(dataset, params)
          page     = [params[:page].to_i, 1].max
          per_page = params[:per_page].to_i
          per_page = 20 if per_page <= 0
          per_page = [per_page, 100].min
          { data: dataset.limit(per_page, (page - 1) * per_page).all,
            total: dataset.count, page: page, per_page: per_page }
        end
      end

      # ── Stats ────────────────────────────────────────────────────────────
      app.get '/api/admin/stats' do
        require_admin!

        total_users     = DB[:users].count
        total_clients   = DB[:users].where(role: 'client').count
        total_providers = DB[:users].where(role: 'provider').count
        pending_approvals = DB[:providers].where(approved: 0).count
        total_bookings  = DB[:bookings].count
        revenue         = DB[:bookings].where(status: 'completed').sum(:service_price).to_f
        active_users    = DB[:users].where(status: 'active').count
        suspended_users = DB[:users].where(status: 'suspended').count

        bookings_by_status = DB[:bookings]
          .group_and_count(:status)
          .all
          .each_with_object({}) { |r, h| h[r[:status]] = r[:count] }

        new_users_this_month = DB[:users]
          .where { created_at >= Date.today.prev_month.to_time }
          .count

        {
          users: {
            total: total_users, clients: total_clients,
            providers: total_providers, active: active_users,
            suspended: suspended_users, newThisMonth: new_users_this_month
          },
          providers: { pendingApprovals: pending_approvals },
          bookings: {
            total: total_bookings, byStatus: bookings_by_status
          },
          revenue: revenue
        }.to_json
      end

      # ── Users ────────────────────────────────────────────────────────────
      app.get '/api/admin/users' do
        require_admin!

        ds = DB[:users].order(Sequel.desc(:created_at))
        ds = ds.where(Sequel.ilike(:email, "%#{params[:search]}%") |
                      Sequel.ilike(:display_name, "%#{params[:search]}%")) if params[:search].to_s.length > 0
        ds = ds.where(role: params[:role])     if params[:role].to_s.length > 0
        ds = ds.where(status: params[:status]) if params[:status].to_s.length > 0

        result = paginate(ds, params)
        result[:data] = result[:data].map { |u|
          { id: u[:id], email: u[:email], displayName: u[:display_name],
            photoURL: u[:photo_url], role: u[:role], status: u[:status] || 'active',
            phone: u[:phone], createdAt: u[:created_at] }
        }
        result.to_json
      end

      app.post '/api/admin/users' do
        require_admin!
        body = JSON.parse(request.body.read) rescue {}

        email    = body['email'].to_s.strip.downcase
        name     = body['displayName'].to_s.strip
        password = body['password'].to_s
        role     = %w[client provider admin].include?(body['role'].to_s) ? body['role'] : 'admin'

        halt 422, { error: 'Email, name and password (min 8 chars) required' }.to_json if
          email.empty? || name.empty? || password.length < 8
        halt 409, { error: 'Email already in use' }.to_json if
          DB[:users].where(email: email).first

        require 'bcrypt'
        id = SecureRandom.uuid
        DB[:users].insert(
          id:            id,
          email:         email,
          display_name:  name,
          password_hash: BCrypt::Password.create(password),
          role:          role,
          status:        'active',
          created_at:    Time.now,
          updated_at:    Time.now
        )

        if role == 'provider'
          DB[:providers].insert(id: SecureRandom.uuid, user_id: id, created_at: Time.now, updated_at: Time.now)
        end

        { id: id, email: email, displayName: name, role: role, status: 'active' }.to_json
      end

      app.patch '/api/admin/users/:id' do |id|
        require_admin!
        body = JSON.parse(request.body.read) rescue {}

        halt 400, { error: 'Cannot modify another admin' }.to_json if
          DB[:users].where(id: id, role: 'admin').first && id != @current_user['id']

        updates = { updated_at: Time.now }
        updates[:role]   = body['role']   if %w[client provider admin].include?(body['role'].to_s)
        updates[:status] = body['status'] if %w[active suspended banned].include?(body['status'].to_s)

        DB[:users].where(id: id).update(updates)
        { success: true }.to_json
      end

      app.get '/api/admin/users/:id' do |id|
        require_admin!
        u = DB[:users].where(id: id).first
        halt 404, { error: 'User not found' }.to_json unless u
        provider = DB[:providers].where(user_id: id).first
        bookings_count = DB[:bookings].where(client_id: id).count
        {
          id: u[:id], email: u[:email], displayName: u[:display_name],
          photoURL: u[:photo_url], role: u[:role], status: u[:status] || 'active',
          phone: u[:phone], location: u[:location], createdAt: u[:created_at],
          providerProfile: provider ? {
            id: provider[:id], city: provider[:city], country: provider[:country],
            address: provider[:address], category: provider[:category],
            rating: provider[:rating].to_f, reviewCount: provider[:review_count].to_i
          } : nil,
          bookingsCount: bookings_count
        }.to_json
      end

      app.delete '/api/admin/users/:id' do |id|
        require_admin!
        halt 400, { error: 'Cannot delete an admin account' }.to_json if
          DB[:users].where(id: id, role: 'admin').first
        DB[:users].where(id: id).delete
        { success: true }.to_json
      end

      # ── Providers ────────────────────────────────────────────────────────
      app.get '/api/admin/providers' do
        require_admin!

        ds = DB[:providers]
          .join(:users, id: :user_id)
          .select(
            Sequel[:providers].*,
            Sequel[:users][:display_name],
            Sequel[:users][:email],
            Sequel[:users][:photo_url],
            Sequel[:users][:phone],
            Sequel[:users][:status].as(:user_status),
            Sequel[:users][:created_at].as(:user_created_at)
          )
          .order(Sequel.desc(Sequel[:providers][:created_at]))

        ds = ds.where(Sequel[:providers][:approved] => 0) if params[:pending] == 'true'
        ds = ds.where(Sequel[:providers][:category] => params[:category]) if params[:category].to_s.length > 0

        result = paginate(ds, params)
        result[:data] = result[:data].map { |p|
          { id: p[:id], userId: p[:user_id],
            name: p[:display_name], email: p[:email],
            phone: p[:phone],
            photoURL: p[:profile_image] || p[:photo_url],
            category: p[:category],
            address: p[:address], city: p[:city], country: p[:country],
            rating: p[:rating].to_f, reviewCount: p[:review_count].to_i,
            verified: [true,1].include?(p[:verified]),
            featured: [true,1].include?(p[:featured]),
            approved: [true,1].include?(p[:approved]),
            userStatus: p[:user_status] || 'active',
            startingPrice: p[:starting_price].to_f, currency: p[:currency],
            createdAt: p[:user_created_at] }
        }
        result.to_json
      end

      app.patch '/api/admin/providers/:id' do |id|
        require_admin!
        body = JSON.parse(request.body.read) rescue {}

        provider_updates = { updated_at: Time.now }
        provider_updates[:approved] = body['approved'] ? 1 : 0 if body.key?('approved')
        provider_updates[:verified] = body['verified'] ? 1 : 0 if body.key?('verified')
        provider_updates[:featured] = body['featured'] ? 1 : 0 if body.key?('featured')

        DB[:providers].where(id: id).update(provider_updates)
        { success: true }.to_json
      end

      # ── Bookings ─────────────────────────────────────────────────────────
      app.get '/api/admin/bookings' do
        require_admin!

        ds = DB.fetch(<<~SQL)
          SELECT b.*,
                 cu.display_name AS client_name,  cu.email AS client_email,
                 pu.display_name AS provider_name,
                 s.name          AS service_name
          FROM   bookings  b
          JOIN   users     cu ON cu.id = b.client_id
          JOIN   providers p  ON p.id  = b.provider_id
          JOIN   users     pu ON pu.id = p.user_id
          JOIN   services  s  ON s.id  = b.service_id
          ORDER  BY b.booking_date DESC
        SQL

        rows = ds.all
        rows = rows.select { |r| r[:status] == params[:status] }           if params[:status].to_s.length > 0
        rows = rows.select { |r| r[:client_name].to_s.downcase.include?(params[:search].downcase) ||
                                 r[:provider_name].to_s.downcase.include?(params[:search].downcase) } if params[:search].to_s.length > 0

        rows.map { |r|
          { id: r[:id], clientName: r[:client_name], clientEmail: r[:client_email],
            providerName: r[:provider_name], serviceName: r[:service_name],
            servicePrice: r[:service_price].to_f, currency: r[:currency],
            date: r[:booking_date].to_s, time: r[:booking_time].to_s,
            status: r[:status], notes: r[:notes],
            createdAt: r[:created_at] }
        }.to_json
      end

      app.patch '/api/admin/bookings/:id' do |id|
        require_admin!
        body   = JSON.parse(request.body.read) rescue {}
        status = body['status'].to_s
        halt 422, { error: 'Invalid status' }.to_json unless %w[pending confirmed cancelled completed].include?(status)
        DB[:bookings].where(id: id).update(status: status, updated_at: Time.now)
        { success: true }.to_json
      end

      # ── Reviews ──────────────────────────────────────────────────────────
      app.get '/api/admin/reviews' do
        require_admin!

        rows = DB.fetch(<<~SQL).all
          SELECT r.*,
                 cu.display_name AS client_name,
                 pu.display_name AS provider_name
          FROM   reviews   r
          JOIN   users     cu ON cu.id = r.client_id
          JOIN   providers p  ON p.id  = r.provider_id
          JOIN   users     pu ON pu.id = p.user_id
          ORDER  BY r.created_at DESC
        SQL

        rows.map { |r|
          { id: r[:id], rating: r[:rating].to_i, comment: r[:comment],
            serviceProvided: r[:service_provided], clientName: r[:client_name],
            providerName: r[:provider_name], createdAt: r[:created_at] }
        }.to_json
      end

      app.delete '/api/admin/reviews/:id' do |id|
        require_admin!
        DB[:reviews].where(id: id).delete

        # Recalculate provider rating after deletion
        provider_id = DB[:reviews].where(id: id).get(:provider_id)
        if provider_id
          avg = DB[:reviews].where(provider_id: provider_id).avg(:rating).to_f.round(2)
          cnt = DB[:reviews].where(provider_id: provider_id).count
          DB[:providers].where(id: provider_id).update(rating: avg, review_count: cnt)
        end
        { success: true }.to_json
      end

    end
  end
end
