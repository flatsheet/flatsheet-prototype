class Ability
  include CanCan::Ability

  def initialize(user)

    user ||= User.new

    if !user['admin'] == true
      can :manage, :all
      can :access, :rails_admin
      can :dashboard
    end

    can :manage, Sheet, :user_id => user.id

  end
end
