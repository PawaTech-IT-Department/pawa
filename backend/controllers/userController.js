import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

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
      // Generate a JWT token and return it
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, userType: user.is_admin ? 'admin' : 'user', token });
    } catch (err) {
      res.status(500).json({ error: 'Login failed', details: err.message });
    }
  },

  // Get current user profile (requires auth middleware to set req.user)
  getProfile: async (req, res) => {
    try {
      // Assume req.user is set by auth middleware
      const userId = req.user?._id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const user = await User.findById(userId).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
    }
  },

  // Update current user profile
  updateProfile: async (req, res) => {
    try {
      const userId = req.user?._id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { username } = req.body;
      const user = await User.findByIdAndUpdate(userId, { username }, { new: true, select: '-password' });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update profile', details: err.message });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const userId = req.user?._id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(400).json({ error: 'Current password is incorrect' });
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to change password', details: err.message });
    }
  },

  // Forgot password (send reset link or code)
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: 'User not found' });
      // Here you would generate a reset token and send an email
      // For now, just simulate success
      res.json({ success: true, message: 'Password reset link sent (simulated)' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to process forgot password', details: err.message });
    }
  },
};

export default userController;
