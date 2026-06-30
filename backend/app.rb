require 'sinatra/base'
require 'sinatra/json'
require 'rack/cors'
require 'dotenv/load'
require 'json'
require 'securerandom'

require_relative 'config/database'
require_relative 'middleware/jwt_auth'
require_relative 'routes/auth_routes'
require_relative 'routes/provider_routes'
require_relative 'routes/booking_routes'
require_relative 'routes/upload_routes'
require_relative 'routes/admin_routes'

class MyBraidsApp < Sinatra::Base
  # ── Settings ───────────────────────────────────────────────────────────
  set :show_exceptions, :after_handler


  # ── Helpers ────────────────────────────────────────────────────────────
  helpers AuthHelpers

  before do
    content_type :json
    # Allow multipart form data for file uploads
    unless request.content_type&.include?('multipart')
      # body already read lazily by routes
    end
  end

  # ── Mount routes ───────────────────────────────────────────────────────
  register Routes::Auth
  register Routes::Providers
  register Routes::Bookings
  register Routes::Uploads
  register Routes::Admin

  # ── Health check ───────────────────────────────────────────────────────
  get '/health' do
    { status: 'ok', time: Time.now, version: '2026-06-30-v2' }.to_json
  end

  # ── 404 handler ────────────────────────────────────────────────────────
  not_found do
    { error: 'Not found' }.to_json
  end

  # ── Error handler ──────────────────────────────────────────────────────
  error do
    e = env['sinatra.error']
    $stderr.puts e.message
    $stderr.puts e.backtrace.first(5).join("\n")
    { error: 'Internal server error' }.to_json
  end
end
