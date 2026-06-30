require 'mail'

module BookingMailer
  FROM      = ENV.fetch('FROM_EMAIL',    'noreply@mybraids.com')
  APP_URL   = ENV.fetch('FRONTEND_URL',  'http://localhost:4200')
  ADMIN_EMAIL = ENV.fetch('ADMIN_EMAIL', ENV.fetch('SMTP_USERNAME', ''))

  def self.configure
    Mail.defaults do
      delivery_method :smtp, {
        address:              ENV.fetch('SMTP_HOST',     'smtp.gmail.com'),
        port:                 ENV.fetch('SMTP_PORT',     '587').to_i,
        user_name:            ENV.fetch('SMTP_USERNAME', ''),
        password:             ENV.fetch('SMTP_PASSWORD', ''),
        authentication:       :plain,
        enable_starttls_auto: true,
        open_timeout:         10,
        read_timeout:         10,
      }
    end
  end

  # Call this right after a booking is inserted. Runs in a background thread.
  def self.send_booking_notifications(booking_id:, client_id:, provider_id:, service:, date:, time:, notes:)
    Thread.new do
      begin
        configure

        # Fetch names + emails from DB
        client   = DB[:users].where(id: client_id).first
        prow     = DB[:providers].where(id: provider_id).first
        provider_user = DB[:users].where(id: prow&.dig(:user_id)).first if prow

        client_name    = client&.dig(:display_name)   || 'there'
        client_email   = client&.dig(:email)          || ''
        provider_name  = provider_user&.dig(:display_name) || 'your artist'
        provider_email = provider_user&.dig(:email)         || ''

        booking_url = "#{APP_URL}/dashboard"

        # 1. Client confirmation
        deliver(to: client_email,   subject: "Booking confirmed — #{service[:name]} on #{date}",
                html: client_email_html(client_name, provider_name, service, date, time, notes, booking_url)) if client_email.present?

        # 2. Provider notification
        deliver(to: provider_email, subject: "New booking from #{client_name} — #{service[:name]} on #{date}",
                html: provider_email_html(provider_name, client_name, client_email, service, date, time, notes, booking_url)) if provider_email.present?

        # 3. Admin notification
        deliver(to: ADMIN_EMAIL, subject: "[MyBraids] New booking: #{client_name} → #{service[:name]} with #{provider_name}",
                html: admin_email_html(client_name, client_email, provider_name, provider_email, service, date, time, notes)) if ADMIN_EMAIL.present?

        puts "[BookingMailer] Notifications sent for booking #{booking_id}"
      rescue => e
        puts "[BookingMailer] Error: #{e.message}"
      end
    end
  end

  # Call this when a booking status changes to confirmed or completed.
  def self.send_status_notification(booking_id:, status:, booking:)
    Thread.new do
      begin
        configure
        client        = DB[:users].where(id: booking[:client_id]).first
        prow          = DB[:providers].where(id: booking[:provider_id]).first
        provider_user = DB[:users].where(id: prow&.dig(:user_id)).first if prow

        client_name    = client&.dig(:display_name)           || 'Client'
        client_email   = client&.dig(:email)                  || ''
        provider_name  = provider_user&.dig(:display_name)    || 'Artist'
        provider_email = provider_user&.dig(:email)           || ''

        service_name = DB[:services].where(id: booking[:service_id]).get(:name) || 'Service'
        date_str     = booking[:booking_date].to_s
        time_str     = booking[:booking_time].to_s
        label        = status == 'confirmed' ? 'Confirmed' : 'Completed'

        subject_line = "[MyBraids] Booking #{label}: #{client_name} — #{service_name} on #{date_str}"
        html = status_email_html(label, client_name, client_email, provider_name, provider_email, service_name, date_str, time_str)

        deliver(to: ADMIN_EMAIL, subject: subject_line, html: html) if ADMIN_EMAIL.present?

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
                <p style="margin-top:24px">See you then! 🎉</p>
              </td></tr>
            </table></body></html>
          HTML
          deliver(to: client_email, subject: "Your booking with #{provider_name} is confirmed!", html: client_html) if client_email.present?
        end

        puts "[BookingMailer] Status notification sent (#{status}) for booking #{booking_id}"
      rescue => e
        puts "[BookingMailer] Status notification error: #{e.message}"
      end
    end
  end

  private

  def self.deliver(to:, subject:, html:)
    from_addr = FROM
    Mail.new do
      from    from_addr
      to      to
      subject subject
      html_part { content_type 'text/html; charset=UTF-8'; body html }
      text_part { body html.gsub(/<[^>]+>/, '').gsub(/\n{3,}/, "\n\n").strip }
    end.deliver!
  end

  # ── Email templates ────────────────────────────────────────────────────────

  def self.client_email_html(client_name, provider_name, service, date, time, notes, booking_url)
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
                          #{detail_row('⏱ Duration', "#{service[:duration]} min")}
                          #{detail_row('💰 Price',    price_str)}
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

  def self.provider_email_html(provider_name, client_name, client_email, service, date, time, notes, booking_url)
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
                          #{detail_row('👤 Client',   client_name)}
                          #{detail_row('📧 Email',    client_email)}
                          #{detail_row('✂️ Service',  service[:name])}
                          #{detail_row('📅 Date',     format_date(date))}
                          #{detail_row('🕐 Time',     time.to_s)}
                          #{detail_row('⏱ Duration', "#{service[:duration]} min")}
                          #{detail_row('💰 Price',    price_str)}
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

  def self.admin_email_html(client_name, client_email, provider_name, provider_email, service, date, time, notes)
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
                    #{detail_row('Client',        "#{client_name} &lt;#{client_email}&gt;")}
                    #{detail_row('Provider',      "#{provider_name} &lt;#{provider_email}&gt;")}
                    #{detail_row('Service',       service[:name])}
                    #{detail_row('Date',          format_date(date))}
                    #{detail_row('Time',          time.to_s)}
                    #{detail_row('Duration',      "#{service[:duration]} min")}
                    #{detail_row('Price',         price_str)}
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

  # Shared table row helper
  def self.detail_row(label, value)
    <<~ROW
      <tr>
        <td style="padding:6px 0;width:110px;vertical-align:top;">
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

class String
  def present?; !strip.empty?; end unless method_defined?(:present?)
end
