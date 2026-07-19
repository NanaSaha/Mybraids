require 'bcrypt'
require 'net/http'
require_relative '../middleware/jwt_auth'
require_relative '../mailers/welcome_mailer'
require_relative '../mailers/mailer'

module Routes
  module Auth
    def self.registered(app)
      # POST /api/auth/register
      app.post '/api/auth/register' do
        body = JSON.parse(request.body.read) rescue {}

        email    = body['email'].to_s.strip.downcase
        password = body['password'].to_s
        name     = body['displayName'].to_s.strip
        phone    = body['phone'].to_s.strip
        role     = %w[client provider].include?(body['role']) ? body['role'] : 'client'

        return halt 422, { error: 'Email and password required' }.to_json if email.empty? || password.length < 8
        return halt 422, { error: 'Phone number is required' }.to_json    if phone.empty?
        return halt 409, { error: 'Email already registered' }.to_json    if DB[:users].where(email: email).first

        hash = BCrypt::Password.create(password)
        id   = SecureRandom.uuid

        DB[:users].insert(
          id:            id,
          email:         email,
          password_hash: hash,
          display_name:  name,
          phone:         phone,
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
            phone:        user[:phone],
            location:     user[:location],
            dateOfBirth:  user[:date_of_birth]&.to_s || ''
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
            phone:        user[:phone],
            location:     user[:location],
            dateOfBirth:  user[:date_of_birth]&.to_s || ''
          }
        }.to_json
      end

      # POST /api/auth/forgot-password
      app.post '/api/auth/forgot-password' do
        body  = JSON.parse(request.body.read) rescue {}
        email = body['email'].to_s.strip.downcase
        halt 422, { error: 'Email required' }.to_json if email.empty?

        user = DB[:users].where(email: email).first
        if user
          token      = SecureRandom.hex(32)
          expires_at = Time.now + 3600
          DB[:users].where(id: user[:id]).update(
            reset_token:            token,
            reset_token_expires_at: expires_at,
            updated_at:             Time.now
          )
          reset_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:4200')}/auth/reset-password?token=#{token}"
          Thread.new do
            Mailer.deliver(
              to:      email,
              subject: 'Reset your MyBraids password',
              html:    password_reset_html(user[:display_name] || 'there', reset_url)
            )
          end
        end
        # Always return success to prevent email enumeration
        { message: 'If an account with that email exists, a password reset link has been sent.' }.to_json
      end

      # POST /api/auth/reset-password
      app.post '/api/auth/reset-password' do
        body     = JSON.parse(request.body.read) rescue {}
        token    = body['token'].to_s.strip
        password = body['password'].to_s
        halt 422, { error: 'Token and password are required' }.to_json if token.empty? || password.length < 8

        user = DB[:users].where(reset_token: token).first
        halt 400, { error: 'Invalid or expired reset link. Please request a new one.' }.to_json unless user

        if user[:reset_token_expires_at].nil? || Time.now > user[:reset_token_expires_at]
          halt 400, { error: 'Reset link has expired. Please request a new one.' }.to_json
        end

        DB[:users].where(id: user[:id]).update(
          password_hash:          BCrypt::Password.create(password),
          reset_token:            nil,
          reset_token_expires_at: nil,
          updated_at:             Time.now
        )
        { message: 'Password updated successfully. You can now sign in.' }.to_json
      end

      # PUT /api/auth/profile — update name / phone / location
      app.put '/api/auth/profile' do
        authenticate!
        body = JSON.parse(request.body.read) rescue {}

        updates = {}
        updates[:display_name]  = body['displayName'].to_s.strip if body['displayName'].to_s.strip.length > 0
        updates[:phone]         = body['phone'].to_s.strip       if body['phone'].to_s.strip.length > 0
        updates[:location]      = body['location'].to_s          if body['location'].to_s.strip.length > 0
        updates[:photo_url]     = body['photoURL'].to_s          if body['photoURL'].to_s.start_with?('http')
        dob = body['dateOfBirth'].to_s.strip
        updates[:date_of_birth] = dob.empty? ? nil : dob        if body.key?('dateOfBirth')
        updates[:updated_at]    = Time.now

        DB[:users].where(id: @current_user['id']).update(updates)
        { success: true }.to_json
      end
      app.helpers do
        def password_reset_html(name, reset_url)
          first = name.to_s.split(' ').first
          <<~HTML
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="margin:0;padding:0;background:#f5f0eb;font-family:'DM Sans',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 0;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
                    <tr>
                      <td style="background:#C85A2E;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
                        <p style="margin:0;font-size:26px;font-weight:800;color:#fff;">✂️ MyBraids</p>
                        <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">Password Reset</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#fff;padding:40px;border-radius:0 0 16px 16px;">
                        <h2 style="margin:0 0 12px;font-size:20px;color:#1C0A00;">Hi #{first},</h2>
                        <p style="font-size:15px;color:#4a3728;line-height:1.6;margin:0 0 28px;">
                          We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.
                        </p>
                        <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding-bottom:28px;">
                          <a href="#{reset_url}"
                             style="display:inline-block;background:#C85A2E;color:#fff;font-weight:700;font-size:15px;
                                    text-decoration:none;padding:14px 36px;border-radius:50px;">
                            Reset My Password
                          </a>
                        </td></tr></table>
                        <p style="font-size:13px;color:#9e8878;margin:0;">
                          If you didn't request this, you can safely ignore this email — your password won't change.
                        </p>
                        <p style="margin:28px 0 0;font-size:12px;color:#bbb;text-align:center;">© #{Time.now.year} MyBraids</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
          HTML
        end
      end
    end
  end
end
