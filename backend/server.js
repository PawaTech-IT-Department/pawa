import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import mpesaRoutes from "./routes/mpesa.js"; // Import the new M-Pesa routes
import adminRoutes from "./routes/admins.js";
import userRoutes from "./routes/users.js";
import inventoryRoutes from "./routes/inventories.js";
import taskRoutes from "./routes/tasks.js";
import reportRoutes from "./routes/reports.js";
import mongoose from "mongoose";
// Request middleware imports
import requestLogger from "./middleware/request/requestLogger.js";
import rateLimiter from "./middleware/request/rateLimiter.js";
// Config imports
import apiConfig from "./config/apiConfig.js";
import middlewareConfig from "./config/middlewareConfig.js";
import dbConfig from "./config/dbConfig.js";
import corsConfig from "./config/corsConfig.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(dbConfig.uri, dbConfig.options);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Static file serving for img, images, scripts, styles and admin-pages
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../")));
//app.use("/img", express.static(path.join(__dirname, "../img")));
//app.use("/images", express.static(path.join(__dirname, "../images")));
//app.use("/scripts", express.static(path.join(__dirname, "../scripts")));
//app.use("/pages", express.static(path.join(__dirname, "../pages")));
//app.use("/styles", express.static(path.join(__dirname, "../styles")));
//app.use("/admin-pages", express.static(path.join(__dirname, "../admin-pages")));
//app.use("/js-components", express.static(path.join(__dirname, "../js-components")));

app.use(
  cors(corsConfig)
);
app.use(express.json());
// Register request middleware globally for all API routes
if (middlewareConfig.requestLogger) app.use(requestLogger);
if (middlewareConfig.rateLimiter) app.use(rateLimiter);

// Middleware to handle JSON requests
//app.use(express.urlencoded({ extended: true }));
// Middleware for session management (if needed)
// app.use(express.session({
//   secret: process.env.SESSION_SECRET || "default_secret",
//   resave: false,
//   saveUninitialized: true,
// }));
// Middleware to serve static files for the admin dashboard
//app.use("/admin", express.static(path.join(__dirname, "../admin")));
// Middleware to serve static files for the main website
//app.use("/", express.static(path.join(__dirname, "../"))); // Serve the main website at root

// Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/mpesa", mpesaRoutes); // Use the new M-Pesa routes
app.use("/api/admins", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inventories", inventoryRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);

// Serve main website at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html")); //"localhost:5000"
});

// Serve admin dashboard at /admin
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../admin.html")); //"localhost:5000/admin"
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
