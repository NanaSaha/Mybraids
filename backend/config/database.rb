require 'sequel'
require 'logger'

DB = Sequel.connect(
  adapter:          'mysql2',
  host:             ENV.fetch('DB_HOST', 'localhost'),
  port:             ENV.fetch('DB_PORT', '3306').to_i,
  database:         ENV.fetch('DB_NAME', 'mybraids'),
  user:             ENV.fetch('DB_USER', 'root'),
  password:         ENV.fetch('DB_PASSWORD', ''),
  charset:          'utf8mb4',
  encoding:         'utf8mb4',
  max_connections:  ENV.fetch('DB_POOL', '3').to_i,  # Clever Cloud free plan: 5 max
  pool_timeout:     10
)

DB.loggers << Logger.new($stdout) if ENV['RACK_ENV'] == 'development'

# Auto-migrate: add password reset columns if they don't exist
begin
  existing = DB[:information_schema__columns]
    .where(table_schema: DB.opts[:database], table_name: 'users')
    .select_map(:column_name).map(&:to_s)
  DB.run("ALTER TABLE users ADD COLUMN reset_token VARCHAR(64) NULL")           unless existing.include?('reset_token')
  DB.run("ALTER TABLE users ADD COLUMN reset_token_expires_at DATETIME NULL")   unless existing.include?('reset_token_expires_at')
rescue => e
  puts "[DB] Migration warning: #{e.message}"
end
