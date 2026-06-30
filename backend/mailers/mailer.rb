require 'net/http'
require 'uri'
require 'json'

# Central delivery via Resend HTTP API (HTTPS, no SMTP ports needed).
# Set RESEND_API_KEY in Render environment variables.
# Set FROM_EMAIL to a verified sender address on your Resend account.
module Mailer
  API_URI = URI('https://api.resend.com/emails').freeze

  def self.deliver(to:, subject:, html:)
    api_key = ENV['RESEND_API_KEY'].to_s.strip
    if api_key.empty?
      puts "[Mailer] RESEND_API_KEY not set — skipping email to #{to}"
      return false
    end

    from = ENV.fetch('FROM_EMAIL', 'MyBraids <onboarding@resend.dev>')

    http = Net::HTTP.new(API_URI.host, API_URI.port)
    http.use_ssl      = true
    http.open_timeout = 10
    http.read_timeout = 20

    req         = Net::HTTP::Post.new(API_URI.path)
    req['Authorization'] = "Bearer #{api_key}"
    req['Content-Type']  = 'application/json'
    req.body = { from: from, to: Array(to), subject: subject, html: html }.to_json

    resp = http.request(req)
    if resp.code.to_i.between?(200, 299)
      true
    else
      raise "Resend API #{resp.code}: #{resp.body}"
    end
  rescue => e
    puts "[Mailer] Delivery failed (#{to}): #{e.message}"
    false
  end
end
