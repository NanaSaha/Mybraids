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

# Auto-migrate: add password reset columns — each in its own rescue so one
# "Duplicate column" error doesn't prevent the other column from being added.
[
  "ALTER TABLE users ADD COLUMN reset_token VARCHAR(64) NULL",
  "ALTER TABLE users ADD COLUMN reset_token_expires_at DATETIME NULL",
].each do |sql|
  begin
    DB.run(sql)
    puts "[DB] Migration applied: #{sql.split('ADD COLUMN').last.strip}"
  rescue Sequel::DatabaseError => e
    raise unless e.message.include?('Duplicate column')
  end
end
