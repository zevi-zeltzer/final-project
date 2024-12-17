import express from "express";
import photographerController from "../controllers/photographerController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/photographer/login", photographerController.login);

router.get(
  "/photographer/getCustomers",
  auth.verifyToken,
  auth.verifyAdmin,
  photographerController.getCustomers
);

router.delete(
  "/photographer/deleteCustomer",
  auth.verifyToken,
  auth.verifyAdmin,
  photographerController.deleteCustomer
);

router.post(
  "/photographer/send-email",
  auth.verifyToken,
  auth.verifyAdmin,
  photographerController.sendEmail
);

router.post(
  "/photographer/foldersUpload",
  auth.verifyToken,
  auth.verifyAdmin,
  photographerController.foldersUpload
);

router.post(
  "/photographer/imageUpload",
  auth.verifyToken,
  auth.verifyAdmin,
  photographerController.imageUpload
);

router.delete(
  "/photographer/deleteFolder",
  auth.verifyToken,
  auth.verifyAdmin,
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
  auth.verifyAdmin,
  photographerController.deleteImage
);

export default router;
