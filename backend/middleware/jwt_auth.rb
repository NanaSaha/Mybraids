require 'jwt'

module Middleware
  module JwtAuth
    SECRET = ENV.fetch('JWT_SECRET', 'dev_secret_change_me')

    def self.encode(payload)
      payload[:exp] = (Time.now + 7 * 24 * 3600).to_i  # 7 days
      JWT.encode(payload, SECRET, 'HS256')
    end

    def self.decode(token)
      JWT.decode(token, SECRET, true, algorithm: 'HS256').first
    rescue JWT::ExpiredSignature
      nil
    rescue JWT::DecodeError
      nil
    end
  end
end

# Sinatra helper: call `authenticate!` in any route to require a valid JWT.
# Sets @current_user with { 'id', 'email', 'role' }.
module AuthHelpers
  def authenticate!
    header = request.env['HTTP_AUTHORIZATION'] || ''
    token  = header.sub(/\ABearer /, '')
    @current_user = Middleware::JwtAuth.decode(token)
    halt 401, { error: 'Unauthorized' }.to_json unless @current_user
  end

  def require_provider!
    authenticate!
    halt 403, { error: 'Forbidden' }.to_json unless @current_user['role'] == 'provider'
  end
end
