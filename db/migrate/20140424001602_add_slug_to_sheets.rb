class AddSlugToSheets < ActiveRecord::Migration
  def change
    add_column :sheets, :slug, :string
  end
end
