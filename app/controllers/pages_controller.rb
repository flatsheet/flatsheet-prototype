class PagesController < ApplicationController
  def home
    if user_signed_in?
      render 'pages/dashboard'
    else
      render 'pages/home'
    end
  end
end
