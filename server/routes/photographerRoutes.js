import express from "express";
import photographerController from "../controllers/photographerController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/photographer/login", photographerController.login);

router.get(
  "/photographer/getCustomers",
  auth.verifyToken,
  photographerController.getCustomers
);

router.delete(
  "/photographer/deleteCustomer",
  auth.verifyToken,
  photographerController.deleteCustomer
);

router.post(
  "/photographer/send-email",
  auth.verifyToken,
  
  photographerController.sendEmail
);

router.post(
  "/photographer/foldersUpload",
  auth.verifyToken,
  photographerController.foldersUpload
);

router.post(
  "/photographer/imageUpload",
  auth.verifyToken,
  photographerController.imageUpload
);

router.delete(
  "/photographer/deleteFolder",
  auth.verifyToken,
  photographerController.deleteFolder
);

router.post(
  "/photographer/endSelection",
  auth.verifyToken,
  photographerController.endSelection
);

router.delete(
  "/photographer/deleteImage",
  auth.verifyToken,
  photographerController.deleteImage
);

export default router;
