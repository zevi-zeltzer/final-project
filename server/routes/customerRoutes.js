import express from "express";
const router = express.Router();
import customerController from "../controllers/customerController.js";
import auth from "../middleware/auth.js";



router.post("/customers/register", customerController.register);

router.get("/customers/getFolders/:fullName" , auth.verifyToken, customerController.getFolders);

router.post("/customers/getImagesChecked", auth.verifyToken, customerController.getImagesChecked);

router.post("/customers/getImages", auth.verifyToken, customerController.getImages);

router.post("/customers/checkImage", auth.verifyToken, customerController.checkImage);

router.post("/customers/editClient", auth.verifyToken, customerController.editClient);

router.post("/customers/sendEmailVerification", auth.verifyToken, customerController.sendEmailVerification);

router.post("/customers/verifyTempPassword", customerController.verifyTempPassword);

router.post("/customers/updatePassword", auth.verifyToken, customerController.updatePassword);

router.post("/customers/forgotPassword", customerController.forgotPassword);

router.post("/customers/changePassword", customerController.changePassword);


export default router;
