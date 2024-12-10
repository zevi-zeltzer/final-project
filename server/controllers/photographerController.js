import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import photographer from "../models/Photographer.js";
import jsonwebtoken from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET_KEY;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);

    const data = await photographer.queryLogin(username, password);
    console.log(data);

    if (!data.success) {
      console.log("data.message", data.message);

      return res.status(401).json({ message: data.message });
    }

    const token = jsonwebtoken.sign(
      {
        userId: data.userId,
        role: data.role,
      },
      secretKey,
      { expiresIn: "12h" }
    );

    const userInfo = {
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
    };

    res.status(200).json({ token, userInfo });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
    console.log(error);
  }
};

const getCustomers = async (req, res) => {
  console.log("getCustomers");

  try {
    const queryCustomers = await photographer.queryGetCustomers();
    console.log(queryCustomers);
    
    res.status(200).json(queryCustomers);
  } catch (error) {
    res
      .status(540)
      .json({ message: "Error retrieving customers", error: error.message });
  }
};


const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.query;
    const data = await photographer.queryDeleteCustomer(id);
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting customer", error: error.message });
  }
}

const sendEmail = async (req, res) => {
  try {
    const email = req.body.email;
    console.log(email);
    const data = await photographer.sendingEmail(email);
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending email", error: error.message });
  }
};

const foldersUpload = async (req, res) => {
  const { fullName, folderName } = req.query;
  console.log(fullName, folderName);

  const DBSaveFolder = await photographer.querySaveFolder(fullName, folderName);

  console.log("DBSaveFolder", DBSaveFolder);

  const userId = DBSaveFolder.userId;

  const folderId = DBSaveFolder.folderId;
  if (DBSaveFolder.success) {
    const BASE_IMAGE_PATH = path.join(__dirname, "../imagesCustomers");

    const userFolder = path.join(BASE_IMAGE_PATH, fullName);

    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }
    let folderPath = path.join(userFolder, folderName);

    folderPath = path.join(userFolder, folderName);

    fs.mkdirSync(folderPath, { recursive: true });
    console.log(folderPath);

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, folderPath);
      },
      filename: (req, file, cb) => {
        const encodedFileName = Buffer.from(
          file.originalname,
          "latin1"
        ).toString("utf8");
        cb(null, encodedFileName);
      },
    });

    const upload = multer({ storage: storage });

    upload.array("images")(req, res, async (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "שגיאה בהעלאת התמונות" });
      } else {
        const images = req.files.map((image) => image.filename);
        console.log(images);

        const DBSaveImages = await photographer.querySaveImages(
          userId,
          folderName,
          images
        );

        console.log(DBSaveImages);

        res.status(200).json({ message: "התמונות הועלו בהצלחה", folderId });
      }
    });
  } else {
    res.status(404).json({ message: "בעיות במסד הנתונים!!" });
  }
};

const imageUpload = async (req, res) => {
  try {
    const { fullName, folderId, folderName } = req.query;
    const folderPath = path.join(
      __dirname,
      "../imagesCustomers",
      fullName,
      folderName
    );

    console.log(
      "fullName",
      fullName,
      "folderId",
      folderId,
      "folderName",
      folderName
    );
    console.log("folderPath", folderPath);

    // הגדרת Multer
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, folderPath);
      },
      filename: (req, file, cb) => {
        const encodedFileName = Buffer.from(
          file.originalname,
          "latin1"
        ).toString("utf8");
        cb(null, encodedFileName);
      },
    });

    const upload = multer({ storage: storage });

    // קריאה ל-upload.single
    upload.single("image")(req, res, async (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "שגיאה בהעלאת התמונה" });
      } else {
        const image = req.file.filename; // שדה filename מהקובץ
        console.log(image);

        // שמירת התמונה במסד הנתונים
        const DBSaveImage = await photographer.querySaveImage(folderId, image);
        console.log(DBSaveImage);

        res.status(200).json({
          message: "התמונה הועלתה בהצלחה",
          folderId,
          image,
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "שגיאה בהעלאת התמונה" });
  }
};


const deleteFolder = async (req, res) => {
  try {
    const { folderId, fullName, folderName } = req.body;
    console.log("fullName:", fullName);
    console.log("folderName:", folderName);
    console.log("folderId:", folderId);

    const DBDeleteFolder = await photographer.queryDeleteFolder(folderId);

    console.log(DBDeleteFolder);

    function isHebrewFolderName(folderName) {
      const hebrewRegex = /[\u0590-\u05FF]/; // טווח התווים של עברית ב- Unicode
      return hebrewRegex.test(folderName);
    }

    let folderPath = path.join(
      __dirname,
      "../imagesCustomers",
      decodeURIComponent(fullName),
      decodeURIComponent(folderName)
    );
    if (isHebrewFolderName(folderName)) {
      folderPath = path.join(
        __dirname,
        "../imagesCustomers",
        decodeURIComponent(fullName),
        decodeURIComponent(folderName)
      );
    }
    console.log("folderPath:", folderPath);

    if (!fs.existsSync(folderPath)) {
      res.status(404).json({ message: "לא נמצאו תמונות עבור הלקוח" });
    } else {
      fs.rmSync(folderPath, { recursive: true, force: true });
      res.status(200).json(DBDeleteFolder);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "שגיאה במחיקת התיקייה", error: error.message });
  }
};

const endSelection = async (req, res) => {
  try {
    const { fullName, folderName, folderId } = req.body;
    console.log("fullName:", fullName);
    console.log("folderName:", folderName);
    console.log("folderId:", folderId);

    // בודק אם תהליך הבחירה הסתיים
    const DBEndSelection = await photographer.queryEndSelection(folderId);
    console.log(DBEndSelection);

    if (DBEndSelection.success) {
      const imagesNames = await photographer.queryGetImagesNames(folderId);
      console.log("imagesNames:", imagesNames);

      // יצירת תיקיית יעד חדשה לאלבום
      const endSelectionPath = path.join(__dirname, "../imagesForAlbums");
      if (!fs.existsSync(endSelectionPath)) {
        fs.mkdirSync(endSelectionPath, { recursive: true });
      }

      const userFolder = path.join(endSelectionPath, fullName);
      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
      }
      const folderPath = path.join(userFolder, folderName);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      console.log("folderPath:", folderPath);

      // מיקום תיקיית המקור (תיקיית התמונות הנוכחיות)
      const sourceFolderPath = path.join(
        __dirname,
        "../imagesCustomers",
        fullName,
        folderName
      );
      console.log("sourceFolderPath:", sourceFolderPath);

      // עבור על כל התמונות ברשימה
      for (let name of imagesNames) {
        console.log("name:", name);

        // בנה את הנתיב של הקובץ המקורי ושל הקובץ בתיקיית היעד
        const sourceFile = path.join(sourceFolderPath, name.imageName);
        const destinationFile = path.join(folderPath, name.imageName);

        // העבר את הקובץ מתיקיית המקור לתיקיית היעד
        fs.copyFileSync(sourceFile, destinationFile); // או השתמש ב- fs.renameSync אם ברצונך להזיז את הקובץ
      }
    }
    res.status(200).json(DBEndSelection);
  } catch (error) {
    res
      .status(500)
      .json({ message: "שגיאה בסיום הבחירה", error: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { imagePath, imageId, folderId } = req.body;
    console.log("imagePath:", imagePath);
    console.log("imageId:", imageId);
    console.log("folderId:", folderId);

    const decodedPath = decodeURIComponent(imagePath);
    console.log("Decoded imagePath:", decodedPath);
    const fullPath = path.join(__dirname, "../", decodedPath);
    console.log(fullPath);

    // מחיקת התמונה מה-DB
    const DBDeleteImage = await photographer.queryDeleteImage(
      imageId,
      folderId
    );

    if (DBDeleteImage.success) {
      // מחיקת התמונה מהקובץ
      fs.unlinkSync(fullPath);
      res.status(200).json(DBDeleteImage);
    } else {
      res.status(401).json(DBDeleteImage);
    }
  } catch (error) {
    console.error("Error deleting image:", error.message);
    res
      .status(500)
      .json({ message: "שגיאה במחיקת התמונה", error: error.message });
  }
};

export default {
  login,
  getCustomers,
  deleteCustomer,
  sendEmail,
  foldersUpload,
  imageUpload,
  deleteFolder,
  endSelection,
  deleteImage,
};
