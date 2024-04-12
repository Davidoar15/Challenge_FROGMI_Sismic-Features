class AddFeatureToComments < ActiveRecord::Migration[7.1]
  def change
    add_reference :comments, :feature, null: false, foreign_key: true
  end
end
