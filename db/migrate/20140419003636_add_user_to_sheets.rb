class AddUserToSheets < ActiveRecord::Migration
  def change
    add_reference :sheets, :user, index: true
  end
end
