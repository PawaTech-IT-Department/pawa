import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import mpesaRoutes from "./routes/mpesa.js"; // Import the new M-Pesa routes

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Static file serving for /img and /images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/img", express.static(path.join(__dirname, "../img")));
app.use("/images", express.static(path.join(__dirname, "../images")));

app.use(
  cors({
    origin: ["http://localhost:5502", "http://127.0.0.1:5502"], // Allow frontend server
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/mpesa", mpesaRoutes); // Use the new M-Pesa routes

app.get("/", (req, res) => {
  res.send("Neszi Server is running!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
