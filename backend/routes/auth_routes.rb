require 'bcrypt'
require 'net/http'
require_relative '../middleware/jwt_auth'
require_relative '../mailers/welcome_mailer'

module Routes
  module Auth
    def self.registered(app)
      # POST /api/auth/register
      app.post '/api/auth/register' do
        body = JSON.parse(request.body.read) rescue {}

        email    = body['email'].to_s.strip.downcase
        password = body['password'].to_s
        name     = body['displayName'].to_s.strip
        role     = %w[client provider].include?(body['role']) ? body['role'] : 'client'

        return halt 422, { error: 'Email and password required' }.to_json if email.empty? || password.length < 8
        return halt 409, { error: 'Email already registered' }.to_json   if DB[:users].where(email: email).first

        hash = BCrypt::Password.create(password)
        id   = SecureRandom.uuid

        DB[:users].insert(
          id:            id,
          email:         email,
          password_hash: hash,
          display_name:  name,
          role:          role,
          created_at:    Time.now,
          updated_at:    Time.now
        )

        if role == 'provider'
          DB[:providers].insert(
            id:         SecureRandom.uuid,
            user_id:    id,
            created_at: Time.now,
            updated_at: Time.now
          )
        end

        WelcomeMailer.send_welcome(email: email, name: name, role: role)

        token = Middleware::JwtAuth.encode({ 'id' => id, 'email' => email, 'role' => role })
        { token: token, user: { id: id, email: email, displayName: name, role: role } }.to_json
      end

      # POST /api/auth/login
      app.post '/api/auth/login' do
        body  = JSON.parse(request.body.read) rescue {}
        email = body['email'].to_s.strip.downcase
        pass  = body['password'].to_s

        user = DB[:users].where(email: email).first
        return halt 401, { error: 'Invalid credentials' }.to_json unless user

        stored = BCrypt::Password.new(user[:password_hash])
        return halt 401, { error: 'Invalid credentials' }.to_json unless stored == pass

        token = Middleware::JwtAuth.encode({ 'id' => user[:id], 'email' => user[:email], 'role' => user[:role] })
        {
          token: token,
          user: {
            id:          user[:id],
            email:       user[:email],
            displayName: user[:display_name],
            photoURL:    user[:photo_url],
            role:        user[:role],
            phone:       user[:phone],
            location:    user[:location]
          }
        }.to_json
      end

      # GET /api/auth/me — return current user from token
      app.get '/api/auth/me' do
        authenticate!
        user = DB[:users].where(id: @current_user['id']).first
        halt 404, { error: 'User not found' }.to_json unless user

        {
          id:          user[:id],
          email:       user[:email],
          displayName: user[:display_name],
          photoURL:    user[:photo_url],
          role:        user[:role],
          phone:       user[:phone],
          location:    user[:location]
        }.to_json
      end

      # POST /api/auth/google — verify Google ID token, return app JWT
      app.post '/api/auth/google' do
        body     = JSON.parse(request.body.read) rescue {}
        id_token = body['idToken'].to_s.strip
        halt 422, { error: 'idToken required' }.to_json if id_token.empty?

        # Verify with Google's tokeninfo endpoint
        uri  = URI("https://oauth2.googleapis.com/tokeninfo?id_token=#{URI.encode_www_form_component(id_token)}")
        resp = Net::HTTP.get_response(uri)
        halt 401, { error: 'Invalid Google token' }.to_json unless resp.code == '200'

        g = JSON.parse(resp.body)
        halt 401, { error: 'Google account email not verified' }.to_json unless g['email_verified'] == 'true'

        email   = g['email'].to_s.downcase
        name    = g['name']    || email.split('@').first
        picture = g['picture'] || ''
        role    = %w[client provider].include?(body['role']) ? body['role'] : 'client'

        user = DB[:users].where(email: email).first
        if user
          DB[:users].where(id: user[:id]).update(photo_url: picture, updated_at: Time.now)
          user = DB[:users].where(id: user[:id]).first
        else
          uid = SecureRandom.uuid
          DB[:users].insert(
            id:            uid,
            email:         email,
            display_name:  name,
            photo_url:     picture,
            role:          role,
            password_hash: BCrypt::Password.create(SecureRandom.hex(32)),
            created_at:    Time.now,
            updated_at:    Time.now
          )
          if role == 'provider'
            DB[:providers].insert(id: SecureRandom.uuid, user_id: uid, created_at: Time.now, updated_at: Time.now)
          end
          user = DB[:users].where(id: uid).first
          WelcomeMailer.send_welcome(email: email, name: name, role: role)
        end

        token = Middleware::JwtAuth.encode({ 'id' => user[:id], 'email' => user[:email], 'role' => user[:role] })
        {
          token: token,
          user:  {
            id:          user[:id],
            email:       user[:email],
            displayName: user[:display_name],
            photoURL:    user[:photo_url],
            role:        user[:role],
            phone:       user[:phone],
            location:    user[:location]
          }
        }.to_json
      end

      # PUT /api/auth/profile — update name / phone / location
      app.put '/api/auth/profile' do
        authenticate!
        body = JSON.parse(request.body.read) rescue {}

        updates = {}
        updates[:display_name] = body['displayName'].to_s.strip if body['displayName']
        updates[:phone]        = body['phone'].to_s             if body['phone']
        updates[:location]     = body['location'].to_s          if body['location']
        updates[:updated_at]   = Time.now

        DB[:users].where(id: @current_user['id']).update(updates)
        { success: true }.to_json
      end
    end
  end
end
