import Task from '../models/Task.js';

const taskController = {
  // List all tasks
  getTasks: async (req, res) => {
    try {
      const tasks = await Task.find();
      res.json({ tasks });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
    }
  },

  // Add new task
  createTask: async (req, res) => {
    try {
      const { description, assigned_to, due_date, status } = req.body;
      if (!description) {
        return res.status(400).json({ error: 'Description is required' });
      }
      // For demo, use description as title, assigned_to as string
      const task = new Task({
        title: description,
        description,
        assigned_to,
        due_date,
        status
      });
      await task.save();
      res.status(201).json({ task });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add task', details: err.message });
    }
  },
};

export default taskController;
