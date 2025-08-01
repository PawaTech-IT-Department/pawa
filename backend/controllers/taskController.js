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
};

export default taskController;
