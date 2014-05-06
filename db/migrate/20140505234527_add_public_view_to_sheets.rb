class AddPublicViewToSheets < ActiveRecord::Migration
  def change
    add_column :sheets, :public_view, :boolean
  end
end
