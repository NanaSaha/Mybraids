require 'mail'

module WelcomeMailer
  FROM    = ENV.fetch('FROM_EMAIL',    'noreply@mybraids.com')
  APP_URL = ENV.fetch('FRONTEND_URL',  'http://localhost:4200')

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

  # Fire-and-forget — runs in a background thread so it never blocks the response
  def self.send_welcome(email:, name:, role:)
    Thread.new do
      begin
        configure
        mail = build_mail(email: email, name: name, role: role)
        mail.deliver!
        puts "[Mailer] Welcome email sent to #{email} (#{role})"
      rescue => e
        puts "[Mailer] Failed to send welcome email to #{email}: #{e.message}"
      end
    end
  end

  private

  def self.build_mail(email:, name:, role:)
    subject, html = role == 'provider' ? provider_email(name) : client_email(name)

    Mail.new do
      from    FROM
      to      email
      subject subject

      html_part do
        content_type 'text/html; charset=UTF-8'
        body html
      end

      text_part do
        body html.gsub(/<[^>]+>/, '').gsub(/\n{3,}/, "\n\n").strip
      end
    end
  end

  def self.client_email(name)
    first = name.to_s.split(' ').first || 'there'
    subject = "Welcome to MyBraids, #{first}! ✂️"
    html = <<~HTML
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
                  <p style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
                    ✂️ MyBraids
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="background:#ffffff;padding:40px;border-radius:0 0 16px 16px;">
                  <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1C0A00;">
                    Welcome, #{first}! 🎉
                  </h1>
                  <p style="margin:0 0 24px;font-size:16px;color:#4a3728;line-height:1.6;">
                    Your MyBraids account is ready. You can now discover and book talented
                    hair artists, makeup artists, lash technicians, and more — right from
                    wherever you are in the world.
                  </p>

                  <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;width:100%;">
                    <tr>
                      <td style="background:#fff8f5;border-left:4px solid #C85A2E;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:12px;">
                        <p style="margin:0;font-weight:700;color:#C85A2E;">🔍 Discover Artists</p>
                        <p style="margin:4px 0 0;font-size:14px;color:#4a3728;">Browse verified artists by specialty, location, and price.</p>
                      </td>
                    </tr>
                    <tr><td style="height:12px;"></td></tr>
                    <tr>
                      <td style="background:#fff8f5;border-left:4px solid #C85A2E;border-radius:0 8px 8px 0;padding:16px 20px;">
                        <p style="margin:0;font-weight:700;color:#C85A2E;">📅 Book Instantly</p>
                        <p style="margin:4px 0 0;font-size:14px;color:#4a3728;">Pick your date, time, and service — confirmation in seconds.</p>
                      </td>
                    </tr>
                  </table>

                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <a href="#{APP_URL}/search"
                           style="display:inline-block;background:#C85A2E;color:#fff;font-weight:700;font-size:16px;
                                  text-decoration:none;padding:14px 36px;border-radius:50px;">
                          Browse Artists
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:32px 0 0;font-size:13px;color:#9e8878;text-align:center;">
                    You received this because you created a MyBraids account.<br>
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
    [subject, html]
  end

  def self.provider_email(name)
    first = name.to_s.split(' ').first || 'there'
    subject = "Welcome to MyBraids, #{first} — your artist profile is ready ✂️"
    html = <<~HTML
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
                  <p style="margin:0;font-size:28px;font-weight:800;color:#E8A030;letter-spacing:-0.5px;">
                    ✂️ MyBraids for Artists
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="background:#ffffff;padding:40px;border-radius:0 0 16px 16px;">
                  <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1C0A00;">
                    You're in, #{first}! 🎊
                  </h1>
                  <p style="margin:0 0 24px;font-size:16px;color:#4a3728;line-height:1.6;">
                    Your MyBraids artist account is live. Clients can now find and book you.
                    Here's how to get your first bookings fast:
                  </p>

                  <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 32px;">
                    <tr>
                      <td style="background:#f5f0eb;border-radius:10px;padding:18px 20px;margin-bottom:10px;">
                        <p style="margin:0;font-weight:700;color:#1C0A00;">① Complete your profile</p>
                        <p style="margin:4px 0 0;font-size:14px;color:#4a3728;">Add your bio, category, location, and a profile photo so clients trust you.</p>
                      </td>
                    </tr>
                    <tr><td style="height:10px;"></td></tr>
                    <tr>
                      <td style="background:#f5f0eb;border-radius:10px;padding:18px 20px;">
                        <p style="margin:0;font-weight:700;color:#1C0A00;">② Add your services &amp; prices</p>
                        <p style="margin:4px 0 0;font-size:14px;color:#4a3728;">Go to Dashboard → Services tab and list everything you offer with clear pricing.</p>
                      </td>
                    </tr>
                    <tr><td style="height:10px;"></td></tr>
                    <tr>
                      <td style="background:#f5f0eb;border-radius:10px;padding:18px 20px;">
                        <p style="margin:0;font-weight:700;color:#1C0A00;">③ Upload portfolio photos</p>
                        <p style="margin:4px 0 0;font-size:14px;color:#4a3728;">Showcase your best work in the Portfolio tab — providers with photos get 3× more bookings.</p>
                      </td>
                    </tr>
                    <tr><td style="height:10px;"></td></tr>
                    <tr>
                      <td style="background:#f5f0eb;border-radius:10px;padding:18px 20px;">
                        <p style="margin:0;font-weight:700;color:#1C0A00;">④ Set your availability</p>
                        <p style="margin:4px 0 0;font-size:14px;color:#4a3728;">Update your working hours in Settings so clients know when to book you.</p>
                      </td>
                    </tr>
                  </table>

                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <a href="#{APP_URL}/dashboard/provider"
                           style="display:inline-block;background:#C85A2E;color:#fff;font-weight:700;font-size:16px;
                                  text-decoration:none;padding:14px 36px;border-radius:50px;">
                          Go to My Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:32px 0 0;font-size:13px;color:#9e8878;text-align:center;">
                    You received this because you joined MyBraids as an artist.<br>
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
    [subject, html]
  end
end
