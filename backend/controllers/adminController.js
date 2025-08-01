import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";

const adminController = {
  // List all admins
  getAdmins: async (req, res) => {
    try {
      const admins = await Admin.find();
      res.json({ admins });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to fetch admins", details: err.message });
    }
  },

  // Grant admin privileges to a user
  grantAdmin: async (req, res) => {
    try {
      const { user_id } = req.body;
      // Only super admin can grant privileges (simple check, expand as needed)
      if (!req.user || !req.user.is_super_admin) {
        return res
          .status(403)
          .json({ error: "Forbidden: Only super admin can grant privileges" });
      }
      const updated = await Admin.findByIdAndUpdate(
        user_id,
        { is_admin: true },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ error: "Admin not found" });
      }
      res.json({ message: "Admin privileges granted", admin: updated });
    } catch (err) {
      res
        .status(500)
        .json({
          error: "Failed to grant admin privileges",
          details: err.message,
        });
    }
  },

  // Admin signup
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const existing = await Admin.findOne({ $or: [{ email }, { username }] });
      if (existing)
        return res.status(400).json({ error: "Admin already exists" });
      const hashed = await bcrypt.hash(password, 10);
      const admin = await Admin.create({ username, email, password: hashed });
      res.json({ success: true, userType: "admin", user: { username, email } });
    } catch (err) {
      res.status(500).json({ error: "Signup failed", details: err.message });
    }
  },

  // Admin login
  login: async (req, res) => {
    try {
      const { emailUsername, password } = req.body;
      const admin = await Admin.findOne({
        $or: [{ email: emailUsername }, { username: emailUsername }],
      });
      if (!admin) return res.status(400).json({ error: "Invalid credentials" });
      const match = await bcrypt.compare(password, admin.password);
      if (!match) return res.status(400).json({ error: "Invalid credentials" });
      res.json({
        success: true,
        userType: "admin",
        user: { username: admin.username, email: admin.email },
      });
    } catch (err) {
      res.status(500).json({ error: "Login failed", details: err.message });
    }
  },
  // Admin profile
  profile: async (req, res) => {
    try {
      // Assuming req.user is set by authentication middleware
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      res.json({
        success: true,
        userType: "admin",
        user: {
          username: req.user.username,
          email: req.user.email,
          id: req.user._id,
        },
      });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to fetch profile", details: err.message });
    }
  },

  // Admin logout
  logout: async (req, res) => {
    try {
      // If using sessions:
      if (req.session) {
        req.session.destroy(() => {
          res.json({ success: true, message: "Logged out successfully" });
        });
      } else {
        // If using JWT or no session
        res.json({ success: true, message: "Logged out successfully" });
      }
    } catch (err) {
      res.status(500).json({ error: "Logout failed", details: err.message });
    }
  },
};

export default adminController;
