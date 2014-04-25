class ApplicationController < ActionController::Base
  before_filter :redirect_https
  
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  def redirect_https
    if Rails.env.production?   
      redirect_to :protocol => "https://" unless request.ssl?
      return true
    end
  end
end
