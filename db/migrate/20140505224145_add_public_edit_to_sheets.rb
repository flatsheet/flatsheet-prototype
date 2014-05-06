class AddPublicEditToSheets < ActiveRecord::Migration
  def change
    add_column :sheets, :public_edit, :boolean
  end
end
