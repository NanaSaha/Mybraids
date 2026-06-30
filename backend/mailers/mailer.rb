require 'mail'

# Central SMTP delivery module.
# Works with any SMTP provider — Gmail, Brevo, Mailjet, SMTP2GO, etc.
# Set these in Render environment variables:
#   SMTP_HOST      e.g. smtp-relay.brevo.com
#   SMTP_PORT      587
#   SMTP_USERNAME  your SMTP login
#   SMTP_PASSWORD  your SMTP password / API key
#   FROM_EMAIL     e.g. MyBraids <noreply@mybraids.com>
#   ADMIN_EMAIL    admin@example.com
module Mailer
  def self.smtp_settings
    {
      address:              ENV.fetch('SMTP_HOST',     'smtp-relay.brevo.com'),
      port:                 ENV.fetch('SMTP_PORT',     '587').to_i,
      user_name:            ENV.fetch('SMTP_USERNAME', ''),
      password:             ENV.fetch('SMTP_PASSWORD', ''),
      authentication:       :plain,
      enable_starttls_auto: true,
      open_timeout:         30,
      read_timeout:         60,
    }
  end

  def self.deliver(to:, subject:, html:)
    from = ENV.fetch('FROM_EMAIL', 'MyBraids <noreply@mybraids.com>')

    settings = smtp_settings
    if settings[:user_name].empty?
      puts "[Mailer] SMTP_USERNAME not configured — skipping email to #{to}"
      return false
    end

    mail = Mail.new do
      from     from
      to       to
      subject  subject
      html_part { content_type 'text/html; charset=UTF-8'; body html }
      text_part { body html.gsub(/<[^>]+>/, '').gsub(/\n{3,}/, "\n\n").strip }
    end
    mail.delivery_method :smtp, settings
    mail.deliver!
    true
  rescue => e
    puts "[Mailer] Delivery failed (#{to}): #{e.message}"
    false
  end
end
