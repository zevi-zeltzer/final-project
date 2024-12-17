import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcryptjs from "bcryptjs";
import Customer from "../models/Customer.js";
import { log } from "console";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const register = async (req, res) => {
  try {
    const { username, password, email, phone, fullName } = req.body;
    console.log(username, password, email, phone, fullName);

    const hashedPassword = await bcryptjs.hash(password, 10);

    const result = await Customer.queryRegister(
      username,
      hashedPassword,
      email,
      phone,
      fullName
    );
    console.log("result", result);

    if (result.success) {
      // נתיב התיקיה שבו התיקיה האישית של הלקוח תיווצר
      const userDir = path.join("imagesCustomers", fullName);

      // בדיקה אם התיקיה כבר קיימת; אם לא, ניצור אותה
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
        console.log(`תיקייה נוצרה עבור ${fullName}`);
      }
      res.status(200).json({ message: "ההרשמה בוצעה בהצלחה" });
    } else {
      res.status(409).json({ message: result.message });
    }
  } catch (error) {
    res.status(500).json({ message: "שגיאה בהרשמה", error: error.message });
  }
};

const getFolders = async (req, res) => {
  try {
    const fullName = req.params.fullName;
    const userId = req.query.userId;
    console.log(fullName, userId);

    const arrResult = await Customer.queryGetFolders(userId);
    const arrIdFolders = arrResult.result.map((folder) => folder.id);
    const arrNamesFolders = arrResult.result.map((folder) => folder.folderName);
    const arrEndFolders = arrResult.result.map(
      (folder) => folder.end_selection
    );
    console.log(
      "arrIdFolders111",
      arrIdFolders,
      "arrNamesFolders",
      arrNamesFolders,
      "arrEndFolders",
      arrEndFolders
    );

    const folderPath = path.join(__dirname, "../imagesCustomers", fullName);

    if (!fs.existsSync(folderPath)) {
      res.status(404).json({ message: "לא נמצאו תמונות עבור הלקוח" });
    } else {
      const files = fs.readdirSync(folderPath);
      console.log(arrIdFolders);

      res
        .status(200)
        .json({ files, arrIdFolders, arrNamesFolders, arrEndFolders });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "שגיאה בקבלת תמונות", error: error.message });
  }
};

const getImagesChecked = async (req, res) => {
  try {
    const { arrIdFolder } = req.body;
    console.log("arrIdFolder", arrIdFolder);

    const queryGetImagesChecked = await Customer.queryGetImagesChecked(
      arrIdFolder
    );
    console.log("queryGetImagesChecked", queryGetImagesChecked);

    res.status(200).json(queryGetImagesChecked.countChecked);
  } catch (error) {
    res
      .status(500)
      .json({ message: "שגיאה בקבלת תמונות", error: error.message });
  }
};

const getImages = async (req, res) => {
  try {
    const { fullName, folderId, folderName } = req.body;
    const userId = req.userId;
    console.log("userId", userId);

    console.log(
      "fullName",
      fullName,
      "folderId",
      folderId,
      "folderName",
      folderName
    );

    const queryGetImages = await Customer.queryGetImages(folderId);
    const arrIdImages = queryGetImages.result.map((image) => image.id);
    const arrChecked = queryGetImages.result.map((image) => image.checked);
    console.log("arrIdImages", arrIdImages);

    const folderPath = path.join(
      __dirname,
      "../imagesCustomers",
      fullName,
      folderName
    );
    console.log("folderPath", folderPath);

    if (!fs.existsSync(folderPath)) {
      console.log("לא נמצאו תמונות עבור הלקוח");

      res.status(404).json({ message: "לא נמצאו תמונות עבור הלקוח" });
    } else {
      const imagesName = fs.readdirSync(folderPath);

      const imagesPath = imagesName.map(
        (image) =>
          `/imagesCustomers/${encodeURIComponent(
            fullName
          )}/${encodeURIComponent(folderName)}/${encodeURIComponent(image)}`
      );

      res.status(200).json({ imagesName, imagesPath, arrIdImages, arrChecked });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "שגיאה בקבלת תמונות", error: error.message });
  }
};

const checkImage = async (req, res) => {
  try {
    const { imageId, ifChecked } = req.query;
    console.log("imageId", imageId, ifChecked);
    const result = await Customer.queryCheckImage(imageId, ifChecked);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "שגיאה בסימון התמונות", error: error.message });
  }
};

const editClient = async (req, res) => {
  try {
    const { username, fullName, phone, email } = req.body;
    const userId = req.userId;
    console.log(
      "userId",
      userId,
      "username",
      username,
      "fullName",
      fullName,
      "phone",
      phone,
      "email",
      email
    );

    const result = await Customer.queryEditClient(
      userId,
      username,
      fullName,
      phone,
      email
    );
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "שגיאה בעריכת הלקוח", error: error.message });
  }
};

const sendEmailVerification = async (req, res) => {
  try {
    const { fullName, userId } = req.query;
    console.log("fullName", fullName, "userId", userId);
    const result = await Customer.querySendEmailVerification(fullName, userId);
    console.log("result", result);

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "שגיאה בשליחת מייל", error: error.message });
  }
};

const verifyTempPassword = async (req, res) => {
  try {
    const { userId, tempPassword } = req.query;
    console.log("userId", userId, "tempPassword", tempPassword);
    const result = await Customer.queryVerifyTempPassword(userId, tempPassword);
    console.log("result", result);

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "שגיאה באימות הסיסמה", error: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { userId, newPassword, oldPassword } = req.query;
    console.log(
      "userId",
      userId,
      "newPassword",
      newPassword,
      "oldPassword",
      oldPassword
    );
    const ifVerified = await Customer.queryVerifyOldPassword(
      userId,
      oldPassword
    );
    console.log("ifVerified", ifVerified);

    if (!ifVerified) {
      return res.status(401).json({ message: "הסיסמה הישנה שגויה." });
    }
    const result = await Customer.queryUpdatePassword(userId, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "שגיאה בעדכון הסיסמה", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { username, email } = req.query;
    console.log("username", username, "email", email);
    const result = await Customer.queryForgotPassword(username, email);
    console.log("result", result);

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "שגיאה בשליחת הבקשה", error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.query;
    console.log("userId", userId, "newPassword", newPassword);
    const result = await Customer.queryUpdatePassword(userId, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "שגיאה בעדכון הסיסמה", error: error.message });
  }
};

export default {
  register,
  getFolders,
  getImagesChecked,
  getImages,
  checkImage,
  editClient,
  sendEmailVerification,
  verifyTempPassword,
  updatePassword,
  forgotPassword,
  changePassword,
};
