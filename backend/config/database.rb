require 'sequel'
require 'logger'

DB = Sequel.connect(
  adapter:  'mysql2',
  host:     ENV.fetch('DB_HOST', 'localhost'),
  port:     ENV.fetch('DB_PORT', '3306').to_i,
  database: ENV.fetch('DB_NAME', 'mybraids'),
  user:     ENV.fetch('DB_USER', 'root'),
  password: ENV.fetch('DB_PASSWORD', ''),
  charset:  'utf8mb4',
  encoding: 'utf8mb4'
)

DB.loggers << Logger.new($stdout) if ENV['RACK_ENV'] == 'development'
