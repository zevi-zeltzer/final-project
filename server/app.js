import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import customerRoute from "./routes/customerRoutes.js";
import photographerRoute from "./routes/photographerRoutes.js";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(
  "/imagesCustomers",
  express.static(path.join(__dirname, "./imagesCustomers"))
);
app.use("/api", photographerRoute, customerRoute);



app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
