require 'net/http'
require 'uri'
require 'json'

# Delivery via Brevo HTTP API (HTTPS port 443 — never blocked by any host).
# Unlike SMTP, Brevo's API works from Render/AWS/any cloud IP without issue.
# Unlike Resend, no domain verification is needed — send to any recipient.
#
# Required env vars:
#   BREVO_API_KEY  — from Brevo → Account → SMTP & API → API Keys tab
#   FROM_EMAIL     — must be a verified sender in Brevo (your account email works)
#   ADMIN_EMAIL    — where admin notifications go
module Mailer
  API_URI = URI('https://api.brevo.com/v3/smtp/email').freeze

  def self.deliver(to:, subject:, html:)
    api_key = ENV['BREVO_API_KEY'].to_s.strip
    if api_key.empty?
      puts "[Mailer] BREVO_API_KEY not set — skipping email to #{to}"
      return false
    end

    # Parse "MyBraids <noreply@mybraids.com>" into name + email
    raw_from = ENV.fetch('FROM_EMAIL', 'nanabosompem93@gmail.com')
    if raw_from =~ /\A(.+?)\s*<(.+?)>\z/
      sender = { name: $1.strip, email: $2.strip }
    else
      sender = { email: raw_from.strip }
    end

    http              = Net::HTTP.new(API_URI.host, API_URI.port)
    http.use_ssl      = true
    http.open_timeout = 15
    http.read_timeout = 30

    req                  = Net::HTTP::Post.new(API_URI.path)
    req['api-key']       = api_key
    req['Content-Type']  = 'application/json'
    req['Accept']        = 'application/json'
    req.body = {
      sender:      sender,
      to:          [{ email: to }],
      subject:     subject,
      htmlContent: html,
      textContent: html.gsub(/<[^>]+>/, '').gsub(/\n{3,}/, "\n\n").strip
    }.to_json

    resp = http.request(req)
    if resp.code.to_i.between?(200, 299)
      puts "[Mailer] Sent to #{to}"
      true
    else
      raise "Brevo API #{resp.code}: #{resp.body}"
    end
  rescue => e
    puts "[Mailer] Delivery failed (#{to}): #{e.message}"
    false
  end
end
