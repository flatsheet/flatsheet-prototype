class Ability
  include CanCan::Ability

  def initialize(user)

    user ||= User.new

    if user['admin'] = true
      can :manage, :all
      can :access, :rails_admin
      can :dashboard
    else
      can :manage, Sheet do |sheet|
        sheet.try(:user) == user
      end
    end

  end
end
