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

# Auto-migrate: each statement in its own rescue so one failure doesn't block others.
[
  "ALTER TABLE users ADD COLUMN reset_token VARCHAR(64) NULL",
  "ALTER TABLE users ADD COLUMN reset_token_expires_at DATETIME NULL",
  %|CREATE TABLE IF NOT EXISTS service_types (
      id         VARCHAR(36)  NOT NULL PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      category   VARCHAR(50)  NOT NULL DEFAULT 'other',
      created_at DATETIME     NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4|,
  "ALTER TABLE users     ADD COLUMN date_of_birth DATE NULL",
  "ALTER TABLE providers ADD COLUMN postcode      VARCHAR(20) NULL",
  "ALTER TABLE providers ADD COLUMN account_type  ENUM('individual','company') NOT NULL DEFAULT 'individual'",
  "ALTER TABLE providers ADD COLUMN company_name  VARCHAR(255) NULL",
  "ALTER TABLE providers ADD COLUMN tax_id        VARCHAR(100) NULL",
  "ALTER TABLE providers ADD COLUMN date_of_birth DATE NULL",
  "ALTER TABLE providers MODIFY COLUMN category VARCHAR(100) NOT NULL DEFAULT ''",
  "ALTER TABLE bookings ADD COLUMN provider_note VARCHAR(1000) NULL",
  "ALTER TABLE bookings ADD COLUMN client_location VARCHAR(500) NULL",
  "ALTER TABLE bookings ADD COLUMN hair_type VARCHAR(50) NULL",
  "ALTER TABLE bookings ADD COLUMN payment_method VARCHAR(100) NULL",
].each do |sql|
  begin
    DB.run(sql)
    label = sql.strip.start_with?('ALTER') ? sql.split('ADD COLUMN').last.strip : sql.strip.split.first(4).join(' ')
    puts "[DB] Migration applied: #{label}"
  rescue Sequel::DatabaseError => e
    raise unless e.message.include?('Duplicate column') || e.message.include?('already exists')
  end
end
