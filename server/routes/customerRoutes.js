import express from "express";
const router = express.Router();
import customerController from "../controllers/customerController.js";

router.get("/", customerController.fetchCustomers);

router.post("/send-email", customerController.fetchEmail);

export default router;
