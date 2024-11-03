import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import customerRoute from "./routes/customerRoutes.js";
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/customers", customerRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
