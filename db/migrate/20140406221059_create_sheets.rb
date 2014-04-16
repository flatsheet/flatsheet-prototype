class CreateSheets < ActiveRecord::Migration
  def change
    create_table :sheets do |t|
      t.string :name
      t.text :description
      t.json :rows

      t.timestamps
    end
  end
end
