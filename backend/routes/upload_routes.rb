require 'cloudinary'
require_relative '../middleware/jwt_auth'

module Routes
  module Uploads
    def self.registered(app)

      Cloudinary.config do |c|
        c.cloud_name = ENV['CLOUDINARY_CLOUD_NAME']
        c.api_key    = ENV['CLOUDINARY_API_KEY']
        c.api_secret = ENV['CLOUDINARY_API_SECRET']
        c.secure     = true
      end

      # POST /api/uploads/profile — upload provider profile image
      app.post '/api/uploads/profile' do
        require_provider!

        file = params[:file]
        halt 422, { error: 'No file provided' }.to_json unless file

        pid    = DB[:providers].where(user_id: @current_user['id']).get(:id)
        folder = "mybraids/providers/#{pid}/profile"

        result = Cloudinary::Uploader.upload(
          file[:tempfile].path,
          folder:         folder,
          resource_type:  'image',
          transformation: [{ width: 800, height: 800, crop: 'fill', quality: 'auto' }]
        )

        url = result['secure_url']
        DB[:providers].where(id: pid).update(profile_image: url, updated_at: Time.now)
        { url: url }.to_json
      end

      # POST /api/uploads/gallery — add image to provider gallery
      app.post '/api/uploads/gallery' do
        require_provider!

        file = params[:file]
        halt 422, { error: 'No file provided' }.to_json unless file

        pid     = DB[:providers].where(user_id: @current_user['id']).get(:id)
        count   = DB[:gallery_images].where(provider_id: pid).count
        halt 422, { error: 'Maximum 12 gallery images allowed' }.to_json if count >= 12

        folder = "mybraids/providers/#{pid}/gallery"
        result = Cloudinary::Uploader.upload(
          file[:tempfile].path,
          folder:         folder,
          resource_type:  'image',
          transformation: [{ width: 1200, height: 900, crop: 'fill', quality: 'auto' }]
        )

        url = result['secure_url']
        DB[:gallery_images].insert(
          provider_id: pid,
          url:         url,
          position:    count,
          created_at:  Time.now
        )
        { url: url }.to_json
      end

      # DELETE /api/uploads/gallery — remove a gallery image
      app.delete '/api/uploads/gallery' do
        require_provider!
        body = JSON.parse(request.body.read) rescue {}

        pid = DB[:providers].where(user_id: @current_user['id']).get(:id)
        img = DB[:gallery_images].where(provider_id: pid, url: body['url']).first
        halt 404, { error: 'Image not found' }.to_json unless img

        # extract public_id from URL for Cloudinary deletion
        public_id = body['url'].split('/').last(3).join('/').sub(/\.[^.]+$/, '')
        Cloudinary::Uploader.destroy(public_id) rescue nil

        DB[:gallery_images].where(id: img[:id]).delete
        { success: true }.to_json
      end
    end
  end
end
