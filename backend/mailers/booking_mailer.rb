require_relative 'mailer'

module BookingMailer
  APP_URL     = ENV.fetch('FRONTEND_URL', 'http://localhost:4200')
  ADMIN_EMAIL = ENV.fetch('ADMIN_EMAIL', '')

  # Call this right after a booking is inserted. Runs in a background thread.
  def self.send_booking_notifications(booking_id:, client_id:, provider_id:, service:, date:, time:, notes:, client_phone: '', client_location: '', payment_method: '')
    Thread.new do
      begin
        # Fetch names + emails from DB
        client   = DB[:users].where(id: client_id).first
        prow     = DB[:providers].where(id: provider_id).first
        provider_user = DB[:users].where(id: prow&.dig(:user_id)).first if prow

        client_name    = client&.dig(:display_name)   || 'there'
        client_email   = client&.dig(:email)          || ''
        provider_name  = provider_user&.dig(:display_name) || 'your artist'
        provider_email = provider_user&.dig(:email)         || ''

        # Provider contact details
        provider_phone    = prow&.dig(:phone).to_s
        provider_location = parse_location(prow&.dig(:location))

        booking_url = "#{APP_URL}/dashboard"

        # 1. Client confirmation (includes provider phone + location)
        Mailer.deliver(
          to:      client_email,
          subject: "Booking confirmed — #{service[:name]} on #{date}",
          html:    client_email_html(client_name, provider_name, provider_phone, provider_location, service, date, time, notes, booking_url)
        ) unless client_email.empty?

        # 2. Provider notification (includes client phone + location)
        Mailer.deliver(
          to:      provider_email,
          subject: "New booking from #{client_name} — #{service[:name]} on #{date}",
          html:    provider_email_html(provider_name, client_name, client_email, client_phone, client_location, payment_method, service, date, time, notes, booking_url)
        ) unless provider_email.empty?

        # 3. Admin notification
        Mailer.deliver(
          to:      ADMIN_EMAIL,
          subject: "[MyBraids] New booking: #{client_name} → #{service[:name]} with #{provider_name}",
          html:    admin_email_html(client_name, client_email, client_phone, client_location, payment_method, provider_name, provider_email, provider_phone, provider_location, service, date, time, notes)
        ) unless ADMIN_EMAIL.empty?

        puts "[BookingMailer] Notifications sent for booking #{booking_id}"
      rescue => e
        puts "[BookingMailer] Error: #{e.message}"
      end
    end
  end

  # Call this when a booking is cancelled (by client or provider).
  def self.send_cancellation_notifications(booking_id:, booking:, cancelled_by: 'client')
    Thread.new do
      begin
        client        = DB[:users].where(id: booking[:client_id]).first
        prow          = DB[:providers].where(id: booking[:provider_id]).first
        provider_user = DB[:users].where(id: prow&.dig(:user_id)).first if prow

        client_name    = client&.dig(:display_name)        || 'Client'
        client_email   = client&.dig(:email)               || ''
        provider_name  = provider_user&.dig(:display_name) || 'Artist'
        provider_email = provider_user&.dig(:email)        || ''

        service_name = DB[:services].where(id: booking[:service_id]).get(:name) || 'Service'
        date_str     = booking[:booking_date].to_s
        time_str     = booking[:booking_time].respond_to?(:strftime) ? booking[:booking_time].strftime('%H:%M') : booking[:booking_time].to_s
        who          = cancelled_by == 'provider' ? provider_name : client_name

        # 1. Client
        unless client_email.empty?
          Mailer.deliver(
            to:      client_email,
            subject: "Booking cancelled — #{service_name} on #{date_str}",
            html:    cancellation_email_html('client', client_name, provider_name, service_name, date_str, time_str, who)
          )
        end

        # 2. Provider
        unless provider_email.empty?
          Mailer.deliver(
            to:      provider_email,
            subject: "Booking cancelled — #{client_name} on #{date_str}",
            html:    cancellation_email_html('provider', client_name, provider_name, service_name, date_str, time_str, who)
          )
        end

        # 3. Admin
        unless ADMIN_EMAIL.empty?
          Mailer.deliver(
            to:      ADMIN_EMAIL,
            subject: "[MyBraids] Booking cancelled: #{client_name} → #{service_name} with #{provider_name}",
            html:    cancellation_email_html('admin', client_name, provider_name, service_name, date_str, time_str, who)
          )
        end

        puts "[BookingMailer] Cancellation notifications sent for booking #{booking_id}"
      rescue => e
        puts "[BookingMailer] Cancellation error: #{e.message}"
      end
    end
  end

  # Call this when a booking status changes to confirmed or completed.
  def self.send_status_notification(booking_id:, status:, booking:)
    Thread.new do
      begin
        client        = DB[:users].where(id: booking[:client_id]).first
        prow          = DB[:providers].where(id: booking[:provider_id]).first
        provider_user = DB[:users].where(id: prow&.dig(:user_id)).first if prow

        client_name    = client&.dig(:display_name)           || 'Client'
        client_email   = client&.dig(:email)                  || ''
        provider_name  = provider_user&.dig(:display_name)    || 'Artist'
        provider_email = provider_user&.dig(:email)           || ''

        provider_phone    = prow&.dig(:phone).to_s
        provider_location = parse_location(prow&.dig(:location))

        service_name = DB[:services].where(id: booking[:service_id]).get(:name) || 'Service'
        date_str     = booking[:booking_date].to_s
        time_str     = booking[:booking_time].to_s
        label        = status == 'confirmed' ? 'Confirmed' : 'Completed'

        subject_line = "[MyBraids] Booking #{label}: #{client_name} — #{service_name} on #{date_str}"
        html = status_email_html(label, client_name, client_email, provider_name, provider_email, service_name, date_str, time_str)

        Mailer.deliver(to: ADMIN_EMAIL, subject: subject_line, html: html) unless ADMIN_EMAIL.empty?

        if status == 'confirmed'
          client_html = <<~HTML
            <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f5f0eb;padding:40px 0">
            <table width="560" style="margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
              <tr><td style="background:#4A7C59;padding:28px 40px;text-align:center">
                <p style="margin:0;font-size:22px;font-weight:800;color:#fff">✅ Booking Confirmed</p>
              </td></tr>
              <tr><td style="padding:32px 40px">
                <p>Hi #{client_name.split(' ').first},</p>
                <p>Your appointment with <strong>#{provider_name}</strong> has been <strong>confirmed</strong>.</p>
                #{detail_row('Service', service_name)}
                #{detail_row('Date',    format_date(date_str))}
                #{detail_row('Time',    time_str)}
                #{provider_phone.empty? ? '' : detail_row('📞 Artist Phone', provider_phone)}
                #{provider_location.empty? ? '' : detail_row('📍 Artist Location', provider_location)}
                <p style="margin-top:24px">See you then! 🎉</p>
              </td></tr>
            </table></body></html>
          HTML
          Mailer.deliver(to: client_email, subject: "Your booking with #{provider_name} is confirmed!", html: client_html) unless client_email.empty?
        end

        puts "[BookingMailer] Status notification sent (#{status}) for booking #{booking_id}"
      rescue => e
        puts "[BookingMailer] Status notification error: #{e.message}"
      end
    end
  end

  private

  # ── Email templates ────────────────────────────────────────────────────────

  def self.client_email_html(client_name, provider_name, provider_phone, provider_location, service, date, time, notes, booking_url)
    first = client_name.to_s.split(' ').first
    price_str = "#{service[:currency]} #{sprintf('%.2f', service[:price].to_f)}"
    <<~HTML
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#f5f0eb;font-family:'DM Sans',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

              <!-- Header -->
              <tr>
                <td style="background:#C85A2E;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
                  <p style="margin:0;font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.5px;">✂️ MyBraids</p>
                  <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.8);">Booking Confirmation</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="background:#ffffff;padding:40px;border-radius:0 0 16px 16px;">
                  <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1C0A00;">
                    You're all set, #{first}! 🎉
                  </h1>
                  <p style="margin:0 0 28px;font-size:15px;color:#4a3728;line-height:1.6;">
                    Your appointment has been booked. Here are your details:
                  </p>

                  <!-- Booking card -->
                  <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
                    <tr>
                      <td style="background:#fff8f5;border-radius:12px;border:1.5px solid #f0e0d8;padding:24px;">
                        <table cellpadding="0" cellspacing="0" width="100%">
                          #{detail_row('🧑‍🎨 Artist',  provider_name)}
                          #{detail_row('✂️ Service',  service[:name])}
                          #{detail_row('📅 Date',     format_date(date))}
                          #{detail_row('🕐 Time',     time.to_s)}
                          #{detail_row('💰 Price',    price_str)}
                          #{provider_phone.to_s.empty? ? '' : detail_row('📞 Artist Phone', provider_phone)}
                          #{provider_location.to_s.empty? ? '' : detail_row('📍 Artist Location', provider_location)}
                          #{notes.to_s.strip.empty? ? '' : detail_row('📝 Notes', notes)}
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Reminder box -->
                  <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
                    <tr>
                      <td style="background:#fffbf0;border-left:4px solid #E8A030;border-radius:0 8px 8px 0;padding:16px 20px;">
                        <p style="margin:0;font-weight:700;color:#9a6300;font-size:14px;">📌 Reminder</p>
                        <p style="margin:6px 0 0;font-size:13px;color:#4a3728;line-height:1.5;">
                          Please arrive a few minutes early. If you need to cancel or reschedule, do so at least 24 hours in advance via your dashboard.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
                    <a href="#{booking_url}"
                       style="display:inline-block;background:#C85A2E;color:#fff;font-weight:700;font-size:15px;
                              text-decoration:none;padding:13px 32px;border-radius:50px;">
                      View My Bookings
                    </a>
                  </td></tr></table>

                  <p style="margin:32px 0 0;font-size:12px;color:#9e8878;text-align:center;">
                    © #{Time.now.year} MyBraids · All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    HTML
  end

  def self.provider_email_html(provider_name, client_name, client_email, client_phone, client_location, payment_method, service, date, time, notes, booking_url)
    first = provider_name.to_s.split(' ').first
    price_str = "#{service[:currency]} #{sprintf('%.2f', service[:price].to_f)}"
    <<~HTML
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#f5f0eb;font-family:'DM Sans',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

              <!-- Header -->
              <tr>
                <td style="background:#1C0A00;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
                  <p style="margin:0;font-size:26px;font-weight:800;color:#E8A030;letter-spacing:-0.5px;">✂️ MyBraids for Artists</p>
                  <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.6);">New Booking Alert</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="background:#ffffff;padding:40px;border-radius:0 0 16px 16px;">
                  <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1C0A00;">
                    New booking, #{first}! 📅
                  </h1>
                  <p style="margin:0 0 28px;font-size:15px;color:#4a3728;line-height:1.6;">
                    A client has booked you on MyBraids. Here are the details:
                  </p>

                  <!-- Booking card -->
                  <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
                    <tr>
                      <td style="background:#f5f0eb;border-radius:12px;border:1.5px solid #e8ddd5;padding:24px;">
                        <table cellpadding="0" cellspacing="0" width="100%">
                          #{detail_row('👤 Client',      client_name)}
                          #{detail_row('📧 Email',       client_email)}
                          #{client_phone.to_s.empty? ? '' : detail_row('📞 Phone', client_phone)}
                          #{client_location.to_s.empty? ? '' : detail_row('📍 Location', client_location)}
                          #{payment_method.to_s.empty? ? '' : detail_row('💳 Payment', payment_method)}
                          #{detail_row('✂️ Service',     service[:name])}
                          #{detail_row('📅 Date',        format_date(date))}
                          #{detail_row('🕐 Time',        time.to_s)}
                          #{detail_row('💰 Price',       price_str)}
                          #{notes.to_s.strip.empty? ? '' : detail_row('📝 Notes', notes)}
                        </table>
                      </td>
                    </tr>
                  </table>

                  <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
                    <a href="#{booking_url}/provider"
                       style="display:inline-block;background:#C85A2E;color:#fff;font-weight:700;font-size:15px;
                              text-decoration:none;padding:13px 32px;border-radius:50px;">
                      Manage My Bookings
                    </a>
                  </td></tr></table>

                  <p style="margin:32px 0 0;font-size:12px;color:#9e8878;text-align:center;">
                    © #{Time.now.year} MyBraids · All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    HTML
  end

  def self.admin_email_html(client_name, client_email, client_phone, client_location, payment_method, provider_name, provider_email, provider_phone, provider_location, service, date, time, notes)
    price_str = "#{service[:currency]} #{sprintf('%.2f', service[:price].to_f)}"
    <<~HTML
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#f5f0eb;font-family:'DM Sans',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

              <!-- Header -->
              <tr>
                <td style="background:#2c2c2c;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
                  <p style="margin:0;font-size:20px;font-weight:800;color:#fff;">✂️ MyBraids Admin</p>
                  <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.55);">New booking notification</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="background:#ffffff;padding:36px 40px;border-radius:0 0 16px 16px;">
                  <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#1C0A00;">Booking Summary</h2>
                  <table cellpadding="0" cellspacing="0" width="100%">
                    #{detail_row('Client',           "#{client_name} &lt;#{client_email}&gt;")}
                    #{client_phone.to_s.empty? ? '' : detail_row('Client Phone', client_phone)}
                    #{client_location.to_s.empty? ? '' : detail_row('Client Location', client_location)}
                    #{payment_method.to_s.empty? ? '' : detail_row('Payment Method', payment_method)}
                    #{detail_row('Provider',         "#{provider_name} &lt;#{provider_email}&gt;")}
                    #{provider_phone.to_s.empty? ? '' : detail_row('Provider Phone', provider_phone)}
                    #{provider_location.to_s.empty? ? '' : detail_row('Provider Location', provider_location)}
                    #{detail_row('Service',          service[:name])}
                    #{detail_row('Date',             format_date(date))}
                    #{detail_row('Time',             time.to_s)}
                    #{detail_row('Price',            price_str)}
                    #{notes.to_s.strip.empty? ? '' : detail_row('Notes', notes)}
                  </table>
                  <p style="margin:28px 0 0;font-size:12px;color:#9e8878;text-align:center;">
                    © #{Time.now.year} MyBraids
                  </p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    HTML
  end

  def self.status_email_html(label, client_name, client_email, provider_name, provider_email, service_name, date_str, time_str)
    color = label == 'Confirmed' ? '#4A7C59' : '#C85A2E'
    <<~HTML
      <!DOCTYPE html>
      <html><head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#f5f0eb;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden">
              <tr><td style="background:#{color};padding:28px 40px;text-align:center">
                <p style="margin:0;font-size:20px;font-weight:800;color:#fff">✂️ MyBraids — Booking #{label}</p>
              </td></tr>
              <tr><td style="padding:36px 40px">
                <h2 style="margin:0 0 20px;font-size:18px;color:#1C0A00">Booking Status Update</h2>
                <table cellpadding="0" cellspacing="0" width="100%">
                  #{detail_row('Status',   label)}
                  #{detail_row('Client',   "#{client_name} &lt;#{client_email}&gt;")}
                  #{detail_row('Provider', "#{provider_name} &lt;#{provider_email}&gt;")}
                  #{detail_row('Service',  service_name)}
                  #{detail_row('Date',     format_date(date_str))}
                  #{detail_row('Time',     time_str)}
                </table>
                <p style="margin:28px 0 0;font-size:12px;color:#9e8878;text-align:center">© #{Time.now.year} MyBraids</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    HTML
  end

  def self.cancellation_email_html(recipient, client_name, provider_name, service_name, date_str, time_str, cancelled_by_name)
    case recipient
    when 'client'
      greeting = "Hi #{client_name.split(' ').first},"
      body_line = "Your appointment with <strong>#{provider_name}</strong> has been cancelled."
    when 'provider'
      greeting = "Hi #{provider_name.split(' ').first},"
      body_line = "The booking from <strong>#{client_name}</strong> has been cancelled."
    else
      greeting  = 'Admin notification'
      body_line = "A booking was cancelled by <strong>#{cancelled_by_name}</strong>."
    end

    <<~HTML
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#f5f0eb;font-family:'DM Sans',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
              <tr>
                <td style="background:#c0392b;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
                  <p style="margin:0;font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.5px;">✂️ MyBraids</p>
                  <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.8);">Booking Cancelled</p>
                </td>
              </tr>
              <tr>
                <td style="background:#ffffff;padding:40px;border-radius:0 0 16px 16px;">
                  <p style="font-size:15px;color:#1C0A00;">#{greeting}</p>
                  <p style="font-size:15px;color:#4a3728;line-height:1.6;margin-bottom:28px;">#{body_line}</p>
                  <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
                    <tr>
                      <td style="background:#fff5f5;border-radius:12px;border:1.5px solid #f5c6c6;padding:24px;">
                        <table cellpadding="0" cellspacing="0" width="100%">
                          #{detail_row('Client',   client_name)}
                          #{detail_row('Artist',   provider_name)}
                          #{detail_row('Service',  service_name)}
                          #{detail_row('Date',     format_date(date_str))}
                          #{detail_row('Time',     time_str)}
                        </table>
                      </td>
                    </tr>
                  </table>
                  <p style="font-size:13px;color:#9e8878;">If you have any questions, please contact us through the MyBraids platform.</p>
                  <p style="margin:32px 0 0;font-size:12px;color:#9e8878;text-align:center;">© #{Time.now.year} MyBraids</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    HTML
  end

  # Parse provider location JSON into a readable string
  def self.parse_location(location_raw)
    return '' if location_raw.nil?
    parsed = location_raw.is_a?(String) ? (JSON.parse(location_raw) rescue {}) : location_raw
    parts = [
      parsed['address'] || parsed[:address],
      parsed['city']    || parsed[:city],
      parsed['country'] || parsed[:country]
    ].compact.reject(&:empty?)
    parts.join(', ')
  rescue
    ''
  end

  # Called when a provider posts a reply note to a client's booking note.
  def self.send_provider_note_notification(booking:)
    Thread.new do
      begin
        client        = DB[:users].where(id: booking[:client_id]).first
        prow          = DB[:providers].where(id: booking[:provider_id]).first
        provider_user = DB[:users].where(id: prow&.dig(:user_id)).first if prow

        client_name    = client&.dig(:display_name)        || 'Client'
        client_email   = client&.dig(:email)               || ''
        provider_name  = provider_user&.dig(:display_name) || 'Artist'
        service_name   = DB[:services].where(id: booking[:service_id]).get(:name) || 'Service'
        date_str       = booking[:booking_date].to_s
        time_str       = booking[:booking_time].respond_to?(:strftime) ?
                           booking[:booking_time].strftime('%H:%M') :
                           booking[:booking_time].to_s
        provider_note  = booking[:provider_note].to_s

        html = <<~HTML
          <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #f0e8e0;">
            <div style="background:linear-gradient(135deg,#1C0A00,#3D1A08);padding:32px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;">Message from Your Artist</h1>
              <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">MyBraids</p>
            </div>
            <div style="padding:32px;">
              <p style="font-size:15px;color:#1C0A00;">Hi <strong>#{client_name}</strong>,</p>
              <p style="font-size:14px;color:#5a3e2b;line-height:1.6;">
                <strong>#{provider_name}</strong> has replied to your booking request for
                <strong>#{service_name}</strong> on <strong>#{format_date(date_str)} at #{time_str}</strong>.
              </p>
              <div style="background:#fdf6f0;border-left:4px solid #C85A2E;border-radius:6px;padding:16px 20px;margin:20px 0;">
                <p style="margin:0;font-size:14px;color:#1C0A00;line-height:1.7;">#{provider_note}</p>
              </div>
              <p style="font-size:14px;color:#5a3e2b;line-height:1.6;">
                You can view your booking details in your dashboard.
              </p>
              <div style="text-align:center;margin:28px 0;">
                <a href="#{ENV.fetch('APP_URL','https://mybraids.com')}/dashboard/client"
                   style="background:#C85A2E;color:#fff;padding:13px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">
                  View My Dashboard
                </a>
              </div>
              <p style="font-size:13px;color:#9a7a6a;">The MyBraids Team</p>
            </div>
          </div>
        HTML

        unless client_email.empty?
          Mailer.deliver(
            to:      client_email,
            subject: "#{provider_name} sent you a message about your booking",
            html:    html
          )
        end

        puts "[BookingMailer] Provider note notification sent for booking #{booking[:id]}"
      rescue => e
        puts "[BookingMailer] Provider note error: #{e.message}"
      end
    end
  end

  # Called when a client replies to a provider's note.
  def self.send_client_reply_notification(booking:)
    Thread.new do
      begin
        client        = DB[:users].where(id: booking[:client_id]).first
        prow          = DB[:providers].where(id: booking[:provider_id]).first
        provider_user = DB[:users].where(id: prow&.dig(:user_id)).first if prow

        client_name    = client&.dig(:display_name)        || 'Client'
        provider_name  = provider_user&.dig(:display_name) || 'Artist'
        provider_email = provider_user&.dig(:email)        || ''
        service_name   = DB[:services].where(id: booking[:service_id]).get(:name) || 'Service'
        date_str       = booking[:booking_date].to_s
        time_str       = booking[:booking_time].respond_to?(:strftime) ?
                           booking[:booking_time].strftime('%H:%M') :
                           booking[:booking_time].to_s
        client_reply   = booking[:client_reply].to_s

        html = <<~HTML
          <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #f0e8e0;">
            <div style="background:linear-gradient(135deg,#1C0A00,#3D1A08);padding:32px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;">Reply from Your Client</h1>
              <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">MyBraids</p>
            </div>
            <div style="padding:32px;">
              <p style="font-size:15px;color:#1C0A00;">Hi <strong>#{provider_name}</strong>,</p>
              <p style="font-size:14px;color:#5a3e2b;line-height:1.6;">
                <strong>#{client_name}</strong> has replied to your message about
                <strong>#{service_name}</strong> on <strong>#{format_date(date_str)} at #{time_str}</strong>.
              </p>
              <div style="background:#fdf6f0;border-left:4px solid #4A7C59;border-radius:6px;padding:16px 20px;margin:20px 0;">
                <p style="margin:0;font-size:14px;color:#1C0A00;line-height:1.7;">#{client_reply}</p>
              </div>
              <div style="text-align:center;margin:28px 0;">
                <a href="#{ENV.fetch('APP_URL','https://mybraids.com')}/dashboard/provider"
                   style="background:#C85A2E;color:#fff;padding:13px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">
                  View Booking
                </a>
              </div>
              <p style="font-size:13px;color:#9a7a6a;">The MyBraids Team</p>
            </div>
          </div>
        HTML

        unless provider_email.empty?
          Mailer.deliver(
            to:      provider_email,
            subject: "#{client_name} replied to your message",
            html:    html
          )
        end

        puts "[BookingMailer] Client reply notification sent for booking #{booking[:id]}"
      rescue => e
        puts "[BookingMailer] Client reply error: #{e.message}"
      end
    end
  end

  # Auto-cancellation: called by the cron job when a pending booking expires.
  # Sends an email to the client only (provider missed their window).
  def self.send_auto_cancellation(booking:)
    Thread.new do
      begin
        client        = DB[:users].where(id: booking[:client_id]).first
        prow          = DB[:providers].where(id: booking[:provider_id]).first
        provider_user = DB[:users].where(id: prow&.dig(:user_id)).first if prow

        client_name    = client&.dig(:display_name)        || 'Client'
        client_email   = client&.dig(:email)               || ''
        provider_name  = provider_user&.dig(:display_name) || 'Artist'
        service_name   = DB[:services].where(id: booking[:service_id]).get(:name) || 'Service'
        date_str       = booking[:booking_date].to_s
        time_str       = booking[:booking_time].respond_to?(:strftime) ?
                           booking[:booking_time].strftime('%H:%M') :
                           booking[:booking_time].to_s

        html = <<~HTML
          <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #f0e8e0;">
            <div style="background:linear-gradient(135deg,#1C0A00,#3D1A08);padding:32px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;">Booking Auto-Cancelled</h1>
              <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">MyBraids</p>
            </div>
            <div style="padding:32px;">
              <p style="font-size:15px;color:#1C0A00;">Hi <strong>#{client_name}</strong>,</p>
              <p style="font-size:14px;color:#5a3e2b;line-height:1.6;">
                Unfortunately your booking with <strong>#{provider_name}</strong> for
                <strong>#{service_name}</strong> on <strong>#{format_date(date_str)} at #{time_str}</strong>
                was <strong>automatically cancelled</strong> because it was not confirmed within 24 hours
                of the appointment time.
              </p>
              <p style="font-size:14px;color:#5a3e2b;line-height:1.6;">
                We're sorry for the inconvenience. You can browse and book with another artist at any time.
              </p>
              <div style="text-align:center;margin:28px 0;">
                <a href="#{ENV.fetch('APP_URL','https://mybraids.com')}/search"
                   style="background:#C85A2E;color:#fff;padding:13px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">
                  Find Another Artist
                </a>
              </div>
              <p style="font-size:13px;color:#9a7a6a;">The MyBraids Team</p>
            </div>
          </div>
        HTML

        unless client_email.empty?
          Mailer.deliver(
            to:      client_email,
            subject: "Your booking was auto-cancelled — #{service_name} on #{date_str}",
            html:    html
          )
        end

        unless ADMIN_EMAIL.empty?
          Mailer.deliver(
            to:      ADMIN_EMAIL,
            subject: "[MyBraids] Auto-cancelled: #{client_name} → #{service_name} with #{provider_name} on #{date_str}",
            html:    html
          )
        end

        puts "[BookingMailer] Auto-cancellation sent for booking #{booking[:id]}"
      rescue => e
        puts "[BookingMailer] Auto-cancellation error: #{e.message}"
      end
    end
  end

  # Shared table row helper
  def self.detail_row(label, value)
    <<~ROW
      <tr>
        <td style="padding:6px 0;width:130px;vertical-align:top;">
          <span style="font-size:13px;font-weight:700;color:#7a5c4a;">#{label}</span>
        </td>
        <td style="padding:6px 0;vertical-align:top;">
          <span style="font-size:13px;color:#1C0A00;">#{value}</span>
        </td>
      </tr>
    ROW
  end

  def self.format_date(date_str)
    Date.parse(date_str.to_s).strftime('%A, %d %B %Y') rescue date_str.to_s
  end
end
