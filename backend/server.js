import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productRoutes from "./routes/product.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);

app.get("/", (_, res) => {
  res.send("Neszi E-Commerce Backend Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
