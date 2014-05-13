class ApplicationController < ActionController::Base
  before_action :configure_permitted_parameters, if: :devise_controller?
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

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) do |u| 
      u.permit(
        :email,
        :username,
        :password, 
        :password_confirmation, 
        :newsletter
      )
    end

    devise_parameter_sanitizer.for(:account_update) do |u| 
      u.permit(
        :email,
        :username,
        :password, 
        :password_confirmation,
        :current_password,
        :newsletter
      )
    end
  end
end
