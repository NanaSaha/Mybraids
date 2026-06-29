require_relative 'app'
require 'rack/cors'
require 'dotenv/load'

# CORS must be the outermost middleware so its headers survive Sinatra's
# ShowExceptions wrapper — even on 500 responses.
use Rack::Cors do
  allow do
    origins ENV.fetch('FRONTEND_URL', 'http://localhost:4200'), 'http://localhost:4200'
    resource '*',
      headers:     :any,
      methods:     %i[get post put patch delete options],
      credentials: false
  end
end

run MyBraidsApp
