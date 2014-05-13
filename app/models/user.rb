class User < ActiveRecord::Base
  before_create :set_api_key

  extend FriendlyId
  friendly_id :username, use: :slugged

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  has_many :sheets

  def is_admin?
    self['admin']
  end

  def should_generate_new_friendly_id?
    true
  end

  private
    def set_api_key
      return if self.api_key.present?

      begin
        self.api_key = SecureRandom.hex
      end while self.class.exists?(api_key: self.api_key)
    end
end
