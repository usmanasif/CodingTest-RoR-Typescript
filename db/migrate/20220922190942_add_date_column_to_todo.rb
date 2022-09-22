class AddDateColumnToTodo < ActiveRecord::Migration[6.1]
  def up
    add_column :todos, :deadline, :datetime
    Todo.all.each_with_index do |t, i|
      t.update(deadline: Time.now + i.hours)
    end
  end

  def down
    remove_column :todos, :deadline, :datetime
  end
end
