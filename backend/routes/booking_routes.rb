require_relative '../middleware/jwt_auth'
require_relative '../mailers/booking_mailer'

module Routes
  module Bookings
    def self.registered(app)

      # ── GET /api/bookings — client sees own bookings ──────────────────
      app.get '/api/bookings' do
        authenticate!

        rows = DB.fetch(<<~SQL, @current_user['id']).all
          SELECT b.*,
                 u.display_name AS provider_name,
                 s.name         AS service_name
          FROM   bookings  b
          JOIN   providers p ON p.id = b.provider_id
          JOIN   users     u ON u.id = p.user_id
          JOIN   services  s ON s.id = b.service_id
          WHERE  b.client_id = ?
          ORDER  BY b.booking_date DESC
        SQL

        rows.map { |r| serialize_booking(r) }.to_json
      end

      # ── GET /api/bookings/provider — provider sees all their bookings ─
      app.get '/api/bookings/provider' do
        require_provider!

        pid = DB[:providers].where(user_id: @current_user['id']).get(:id)
        halt 404, { error: 'Provider not found' }.to_json unless pid

        rows = DB.fetch(<<~SQL, pid).all
          SELECT b.*,
                 u.display_name AS client_name,
                 u.email        AS client_email,
                 u.phone        AS client_phone,
                 s.name         AS service_name
          FROM   bookings b
          JOIN   users    u ON u.id = b.client_id
          JOIN   services s ON s.id = b.service_id
          WHERE  b.provider_id = ?
          ORDER  BY b.booking_date DESC
        SQL

        rows.map { |r| serialize_booking(r) }.to_json
      end

      # ── POST /api/bookings — create a booking ────────────────────────
      app.post '/api/bookings' do
        authenticate!
        body = JSON.parse(request.body.read) rescue {}

        required = %w[providerId serviceId date time]
        missing  = required.select { |k| body[k].to_s.strip.empty? }
        halt 422, { error: "Missing fields: #{missing.join(', ')}" }.to_json if missing.any?

        service = DB[:services].where(id: body['serviceId']).first
        halt 404, { error: 'Service not found' }.to_json unless service

        id = SecureRandom.uuid
        DB[:bookings].insert(
          id:            id,
          client_id:     @current_user['id'],
          provider_id:   body['providerId'],
          service_id:    body['serviceId'],
          booking_date:  body['date'],
          booking_time:  body['time'],
          duration:      service[:duration],
          service_price: service[:price],
          currency:      service[:currency],
          notes:         body['notes'].to_s,
          status:        'pending',
          created_at:    Time.now,
          updated_at:    Time.now
        )

        BookingMailer.send_booking_notifications(
          booking_id:  id,
          client_id:   @current_user['id'],
          provider_id: body['providerId'],
          service:     service,
          date:        body['date'],
          time:        body['time'],
          notes:       body['notes'].to_s
        )

        { id: id }.to_json
      end

      # ── PATCH /api/bookings/:id/status — confirm / cancel / complete ─
      app.patch '/api/bookings/:id/status' do |id|
        authenticate!
        body   = JSON.parse(request.body.read) rescue {}
        status = body['status'].to_s

        allowed = %w[pending confirmed cancelled completed]
        halt 422, { error: "Invalid status. Allowed: #{allowed.join(', ')}" }.to_json unless allowed.include?(status)

        booking = DB[:bookings].where(id: id).first
        halt 404, { error: 'Booking not found' }.to_json unless booking

        # Only the client can cancel their own booking; provider can confirm/complete
        uid = @current_user['id']
        role = @current_user['role']
        pid  = DB[:providers].where(user_id: uid).get(:id)

        authorized = (booking[:client_id] == uid && status == 'cancelled') ||
                     (pid == booking[:provider_id] && %w[confirmed completed cancelled].include?(status))

        halt 403, { error: 'Forbidden' }.to_json unless authorized

        DB[:bookings].where(id: id).update(status: status, updated_at: Time.now)

        BookingMailer.send_status_notification(booking_id: id, status: status, booking: booking) if %w[confirmed completed].include?(status)

        { success: true }.to_json
      end

      # ── DELETE /api/bookings/:id — client cancels ────────────────────
      app.delete '/api/bookings/:id' do |id|
        authenticate!
        booking = DB[:bookings].where(id: id, client_id: @current_user['id']).first
        halt 404, { error: 'Booking not found' }.to_json unless booking
        DB[:bookings].where(id: id).update(status: 'cancelled', updated_at: Time.now)
        { success: true }.to_json
      end

      app.helpers do
        def serialize_booking(r)
          {
            id:            r[:id],
            clientId:      r[:client_id],
            clientName:    r[:client_name]  || '',
            clientEmail:   r[:client_email] || '',
            clientPhone:   r[:client_phone] || '',
            providerId:    r[:provider_id],
            providerName:  r[:provider_name] || '',
            serviceId:     r[:service_id],
            serviceName:   r[:service_name] || '',
            servicePrice:  r[:service_price].to_f,
            currency:      r[:currency],
            date:          r[:booking_date].to_s,
            time:          r[:booking_time].to_s,
            duration:      r[:duration].to_i,
            status:        r[:status],
            notes:         r[:notes] || '',
            createdAt:     r[:created_at],
            updatedAt:     r[:updated_at]
          }
        end
      end
    end
  end
end
