class Comment < ActiveRecord::Base
    belongs_to :feature
    validates :body, presence: true
end
