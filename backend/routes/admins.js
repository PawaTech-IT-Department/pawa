import express from "express";
import adminController from "../controllers/adminController.js";

const router = express.Router();

// GET all admins
router.get("/", adminController.getAdmins);
// Admin signup
router.post("/register", adminController.register);
//Admin profile
router.get("/profile", adminController.profile);
// Admin login
router.post("/login", adminController.login);
// POST grant admin privileges
router.post("/grant", adminController.grantAdmin);
//Admin logout
router.post("/logout", adminController.logout);

export default router;
