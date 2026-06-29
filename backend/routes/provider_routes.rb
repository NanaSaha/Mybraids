require_relative '../middleware/jwt_auth'

module Routes
  module Providers
    def self.registered(app)

      # ── Helpers ──────────────────────────────────────────────────────
      app.helpers do
        def build_provider(row)
          return nil unless row

          pid = row[:id]
          {
            id:              pid,
            userId:          row[:user_id],
            name:            row[:display_name] || '',
            bio:             row[:bio] || '',
            tagline:         row[:tagline] || '',
            category:        row[:category] || 'hair',
            profileImage:    row[:profile_image] || '',
            rating:          row[:rating].to_f,
            reviewCount:     row[:review_count].to_i,
            startingPrice:   row[:starting_price].to_f,
            currency:        row[:currency] || 'USD',
            verified:        [true, 1].include?(row[:verified]),
            featured:        [true, 1].include?(row[:featured]),
            yearsExperience: row[:years_experience].to_i,
            instagram:       row[:instagram] || '',
            createdAt:       row[:created_at],
            location: {
              city:    row[:city]    || '',
              state:   row[:state]   || '',
              country: row[:country] || '',
              address: row[:address] || '',
              lat:     row[:lat].to_f,
              lng:     row[:lng].to_f
            },
            specialties:   DB[:provider_specialties].where(provider_id: pid).map { |s| s[:specialty] },
            galleryImages: DB[:gallery_images].where(provider_id: pid).order(:position).map { |g| g[:url] },
            services:      DB[:services].where(provider_id: pid, active: 1).map { |s|
              {
                id:          s[:id],
                name:        s[:name],
                description: s[:description] || '',
                duration:    s[:duration].to_i,
                price:       s[:price].to_f,
                currency:    s[:currency]
              }
            },
            availability: begin
              fmt = ->(t) {
                return '' if t.nil? || t.to_s.empty?
                t.respond_to?(:strftime) ? t.strftime('%H:%M') : t.to_s[0, 5]
              }
              rows = DB[:availability].where(provider_id: pid).all
              if rows.empty?
                default = { open: '09:00', close: '18:00', available: true }
                closed  = { open: '',      close: '',       available: false }
                {
                  'monday'    => default, 'tuesday'  => default, 'wednesday' => default,
                  'thursday'  => default, 'friday'   => default, 'saturday'  => default,
                  'sunday'    => closed
                }
              else
                rows.each_with_object({}) { |a, h|
                  h[a[:day_of_week]] = {
                    open:      fmt.call(a[:open_time]),
                    close:     fmt.call(a[:close_time]),
                    available: [true, 1].include?(a[:available])
                  }
                }
              end
            end
          }
        end
      end

      # ── GET /api/providers — search / list ───────────────────────────
      app.get '/api/providers' do
        ds = DB[:providers]
               .join(:users, id: :user_id)
               .select(
                 Sequel[:providers].*,
                 Sequel[:users][:display_name],
                 Sequel[:users][:email]
               )

        if params[:location]&.length&.> 0
          loc = "%#{params[:location]}%"
          ds = ds.where(
            Sequel.ilike(Sequel[:providers][:city], loc) |
            Sequel[:providers][:country].ilike(loc)
          )
        end
        ds = ds.where(Sequel[:providers][:category] => params[:category])                  if params[:category]&.length&.> 0
        ds = ds.where { Sequel[:providers][:rating] >= params[:minRating].to_f }           if params[:minRating]
        ds = ds.where { Sequel[:providers][:starting_price] <= params[:maxPrice].to_f }    if params[:maxPrice]

        ds = case params[:sortBy]
             when 'rating'     then ds.order(Sequel.desc(:rating))
             when 'price_asc'  then ds.order(:starting_price)
             when 'price_desc' then ds.order(Sequel.desc(:starting_price))
             when 'newest'     then ds.order(Sequel.desc(Sequel[:providers][:created_at]))
             else                   ds.order(Sequel.desc(:featured), Sequel.desc(:rating))
             end

        rows = ds.all
        rows.map { |r| build_provider(r) }.to_json
      end

      # ── GET /api/providers/locations ─────────────────────────────────
      # Returns real cities/countries with provider counts for homepage browsing.
      # Falls back gracefully when providers haven't set location yet.
      app.get '/api/providers/locations' do
        rows = DB[:providers]
          .where(approved: 1)
          .exclude(city: nil).exclude(city: '')
          .select(
            :city, :country, :category,
            Sequel.function(:COUNT, :id).as(:count)
          )
          .group(:city, :country, :category)
          .order(Sequel.desc(:count))
          .all

        # Group by city+country, aggregate per-category counts
        grouped = {}
        rows.each do |r|
          key = "#{r[:city]}||#{r[:country]}"
          grouped[key] ||= {
            city: r[:city], country: r[:country] || '',
            count: 0, categories: []
          }
          grouped[key][:count]      += r[:count].to_i
          grouped[key][:categories] << r[:category] if r[:category]
        end

        result = grouped.values
          .sort_by { |g| -g[:count] }
          .first(16)
          .map { |g| g.merge(categories: g[:categories].uniq.compact) }

        result.to_json
      end

      # ── GET /api/providers/featured ──────────────────────────────────
      # Shows all approved providers ordered by: featured first, then rating.
      # Admin can promote a provider to the top by toggling "featured" in the admin panel.
      app.get '/api/providers/featured' do
        rows = DB[:providers]
                 .join(:users, id: :user_id)
                 .select(Sequel[:providers].*, Sequel[:users][:display_name])
                 .where(Sequel[:providers][:approved] => 1)
                 .order(Sequel.desc(Sequel[:providers][:featured]), Sequel.desc(:rating))
                 .limit(8)
                 .all
        rows.map { |r| build_provider(r) }.to_json
      end

      # ── GET /api/providers/me — fetch own profile (MUST be before /:id) ─
      app.get '/api/providers/me' do
        require_provider!
        row = DB[:providers]
                .join(:users, id: :user_id)
                .select(Sequel[:providers].*, Sequel[:users][:display_name])
                .where(Sequel[:providers][:user_id] => @current_user['id'])
                .first
        halt 404, { error: 'Provider profile not found' }.to_json unless row
        build_provider(row).to_json
      end

      # ── GET /api/providers/:id ────────────────────────────────────────
      app.get '/api/providers/:id' do |id|
        row = DB[:providers]
                .join(:users, id: :user_id)
                .select(Sequel[:providers].*, Sequel[:users][:display_name])
                .where(Sequel[:providers][:id] => id)
                .first
        halt 404, { error: 'Provider not found' }.to_json unless row
        build_provider(row).to_json
      end

      # ── GET /api/providers/:id/reviews ───────────────────────────────
      app.get '/api/providers/:id/reviews' do |id|
        rows = DB[:reviews]
                 .join(:users, id: :client_id)
                 .select(
                   Sequel[:reviews].*,
                   Sequel[:users][:display_name].as(:client_name),
                   Sequel[:users][:photo_url].as(:client_photo)
                 )
                 .where(Sequel[:reviews][:provider_id] => id)
                 .order(Sequel.desc(Sequel[:reviews][:created_at]))
                 .all

        rows.map { |r|
          {
            id:              r[:id],
            providerId:      r[:provider_id],
            clientId:        r[:client_id],
            clientName:      r[:client_name],
            clientPhoto:     r[:client_photo] || '',
            rating:          r[:rating].to_i,
            comment:         r[:comment] || '',
            serviceProvided: r[:service_provided] || '',
            createdAt:       r[:created_at]
          }
        }.to_json
      end

      # ── PUT /api/providers/me — update own profile ───────────────────
      app.put '/api/providers/me' do
        require_provider!
        body = JSON.parse(request.body.read) rescue {}

        pid = DB[:providers].where(user_id: @current_user['id']).get(:id)
        halt 404, { error: 'Provider profile not found' }.to_json unless pid

        to_camel = ->(s) { s.gsub(/_([a-z])/) { $1.upcase } }

        provider_fields = {}
        %w[bio tagline category instagram years_experience city state country address lat lng].each do |f|
          key       = f.to_sym
          camel_key = to_camel.call(f)
          provider_fields[key] = body[camel_key] if body.key?(camel_key)
          provider_fields[key] = body[f]         if body.key?(f)
        end
        provider_fields[:updated_at] = Time.now
        DB[:providers].where(id: pid).update(provider_fields)

        # Upsert specialties
        if body['specialties'].is_a?(Array)
          DB[:provider_specialties].where(provider_id: pid).delete
          body['specialties'].each { |s| DB[:provider_specialties].insert(provider_id: pid, specialty: s) }
        end

        # Upsert availability
        if body['availability'].is_a?(Hash)
          body['availability'].each do |day, slot|
            existing = DB[:availability].where(provider_id: pid, day_of_week: day).first
            data = {
              open_time:  slot['open'],
              close_time: slot['close'],
              available:  slot['available'] ? 1 : 0
            }
            if existing
              DB[:availability].where(provider_id: pid, day_of_week: day).update(data)
            else
              DB[:availability].insert(data.merge(provider_id: pid, day_of_week: day))
            end
          end
        end

        { success: true }.to_json
      end

      # ── POST /api/providers/:id/reviews ──────────────────────────────
      app.post '/api/providers/:id/reviews' do |provider_id|
        authenticate!
        body = JSON.parse(request.body.read) rescue {}

        rating = body['rating'].to_i
        halt 422, { error: 'Rating must be 1-5' }.to_json unless (1..5).include?(rating)

        DB[:reviews].insert(
          id:               SecureRandom.uuid,
          provider_id:      provider_id,
          client_id:        @current_user['id'],
          booking_id:       body['bookingId'],
          rating:           rating,
          comment:          body['comment'].to_s,
          service_provided: body['serviceProvided'].to_s,
          created_at:       Time.now
        )
        { success: true }.to_json
      end

      # ── Services CRUD ─────────────────────────────────────────────────

      # Recalculates starting_price on the provider row from their cheapest active service.
      # Called after every service create / update / delete.
      def sync_starting_price(pid)
        min = DB[:services].where(provider_id: pid, active: 1).min(:price).to_f
        currency = DB[:services].where(provider_id: pid, active: 1).order(:price).first&.dig(:currency) || 'USD'
        DB[:providers].where(id: pid).update(starting_price: min, currency: currency, updated_at: Time.now)
      end

      app.get '/api/providers/me/services' do
        require_provider!
        pid = DB[:providers].where(user_id: @current_user['id']).get(:id)
        halt 404, { error: 'Provider profile not found' }.to_json unless pid
        rows = DB[:services].where(provider_id: pid, active: 1).order(:created_at).all
        rows.map { |s|
          {
            id:          s[:id],
            name:        s[:name],
            description: s[:description] || '',
            duration:    s[:duration].to_i,
            price:       s[:price].to_f,
            currency:    s[:currency] || 'USD'
          }
        }.to_json
      end

      app.post '/api/providers/me/services' do
        require_provider!
        body = JSON.parse(request.body.read) rescue {}

        pid = DB[:providers].where(user_id: @current_user['id']).get(:id)
        halt 404, { error: 'Provider profile not found' }.to_json unless pid

        id = SecureRandom.uuid
        DB[:services].insert(
          id:          id,
          provider_id: pid,
          name:        body['name'].to_s,
          description: body['description'].to_s,
          duration:    body['duration'].to_i,
          price:       body['price'].to_f,
          currency:    body['currency'] || 'USD',
          active:      1,
          created_at:  Time.now
        )
        sync_starting_price(pid)
        { id: id }.to_json
      end

      app.put '/api/providers/me/services/:service_id' do |service_id|
        require_provider!
        body = JSON.parse(request.body.read) rescue {}

        pid = DB[:providers].where(user_id: @current_user['id']).get(:id)
        service = DB[:services].where(id: service_id, provider_id: pid).first
        halt 404, { error: 'Service not found' }.to_json unless service

        DB[:services].where(id: service_id).update(
          name:        body['name']        || service[:name],
          description: body['description'] || service[:description],
          duration:    body['duration']    || service[:duration],
          price:       body['price']       || service[:price],
          currency:    body['currency']    || service[:currency]
        )
        sync_starting_price(pid)
        { success: true }.to_json
      end

      app.delete '/api/providers/me/services/:service_id' do |service_id|
        require_provider!
        pid = DB[:providers].where(user_id: @current_user['id']).get(:id)
        DB[:services].where(id: service_id, provider_id: pid).update(active: 0)
        sync_starting_price(pid)
        { success: true }.to_json
      end
    end
  end
end
