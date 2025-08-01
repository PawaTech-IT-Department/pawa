import User from '../models/User.js';
import bcrypt from 'bcrypt';

const userController = {
  // List all users/customers
  getUsers: async (req, res) => {
    try {
      const users = await User.find();
      res.json({ users });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch users', details: err.message });
    }
  },

  // User signup
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const existing = await User.findOne({ $or: [{ email }, { username }] });
      if (existing) return res.status(400).json({ error: 'User already exists' });
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashed });
      res.json({ success: true, userType: 'user', user: { username, email } });
    } catch (err) {
      res.status(500).json({ error: 'Signup failed', details: err.message });
    }
  },

  // User login
  login: async (req, res) => {
    try {
      const { emailUsername, password } = req.body;
      const user = await User.findOne({ $or: [{ email: emailUsername }, { username: emailUsername }] });
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ error: 'Invalid credentials' });
      res.json({ success: true, userType: user.is_admin ? 'admin' : 'user', user: { username: user.username, email: user.email } });
    } catch (err) {
      res.status(500).json({ error: 'Login failed', details: err.message });
    }
  },
};

export default userController;
