import con from "../config/db.js";
import { promisify } from "util";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
const query = promisify(con.query).bind(con);

const queryLogin = async (username, password) => {
  try {
    const user = await query("SELECT * FROM customers WHERE username = ? ", [
      username,
    ]);

    if (!user || user.length === 0) {
      return {
        success: false,
        status: 401,
        message: "שם המשתמש או הסיסמה שגויים. אנא נסה שוב.",
      };
    }

    const hashedPassword = user[0].password;

    const isMatch = await bcryptjs.compare(password, hashedPassword);

    if (!isMatch) {
      return {
        success: false,
        status: 401,
        message: "שם המשתמש או הסיסמה שגויים. אנא נסה שוב.",
      };
    }

    return {
      success: true,
      message: "התחברת בהצלחה",
      userId: user[0].id,
      username: user[0].userName,
      fullName: user[0].fullName,
      email: user[0].email,
      phone: user[0].phone,
      role: user[0].role,
    };
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const queryGetCustomers = async () => {
  try {
    const result = await query(
      "SELECT username, fullName, email, phone, id FROM customers where role = 'customer'"
    );
    console.log("result", result);

    return result;
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};


const queryDeleteCustomer = async (id) => {
  try {
    const result1 = await query(
      "SELECT * FROM folders WHERE userId = ?",
      [id]
    )
    const result2 = await query(
      "SELECT fullName FROM customers WHERE id = ?",
      [id]
    )
    const fullName = result2[0].fullName
    const foldersId = result1.map(folder => folder.id)
    console.log("foldersId", foldersId);

    for (const folderId of foldersId) {
      await query("DELETE FROM images WHERE folderId = ?", [folderId]);
      await query("DELETE FROM folders WHERE id = ?", [folderId]);
    }
    
    
    const result = await query("DELETE FROM customers WHERE id = ?", [id]);
    console.log("result", result);

    return {success: true, message: "Customer deleted successfully", fullName };
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail", // אפשר להשתמש בספקי שירותי מיילים אחרים
  auth: {
    user: "libiphotographs@gmail.com", // כתובת המייל שלך
    pass: process.env.EMAIL_PASSWORD, // סיסמת המייל שלך
  },
});

const sendingEmail = async (email) => {
  const formLink = "http://localhost:3000/register";
  const mailOptions = {
    from: "libiphotographs@gmail.com",
    to: email,
    subject: "הרשמת לקוח",
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <!-- תמונה במרכז -->
          <div style="margin-bottom: 20px;">
            <img src="cid:logo" alt="Logo" width="200" height="auto" />
          </div>

          <!-- טקסט תחת הלוגו -->
          <h2 style="color: #333;">שלום לקוח יקר,</h2>
          <p style="font-size: 16px; color: #555;">כדי להרשם לאתר הצילומים שלנו יש למלא את הפרטים בקישור המצורף:</p>
          <a href="${formLink}" style="font-size: 16px; color: #007BFF; text-decoration: none;">${formLink}</a>
          <p style="font-size: 16px; color: #555;">בברכה,<br> צוות האתר</p>
        </body>
      </html>
    `, // כאן ניתן להוסיף תוכן HTML כמו קישורים, תמונות וכו'
    attachments: [
      {
        filename: "logo.png", // שם הקובץ שיהיה במייל
        path: "../client/public/images/logo.jpg", // נתיב לתמונה במחשב או בשרת
        cid: "logo", // המזהה של התמונה בתוך המייל
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return { success: true, response: info.response };
  } catch (error) {
    console.log("Error sending email:", error);
    throw error;
  }
};

const querySaveFolder = async (fullName, folderName) => {
  try {
    // שליפת מזהה המשתמש על פי שם מלא
    const userIdResult = await query(
      "SELECT id FROM customers WHERE fullName = ?", 
      [fullName]
    );
    const userId = userIdResult[0].id;

    // בדיקה אם התיקיה קיימת
    const existentFolder = await query(
      "SELECT id FROM folders WHERE userId = ? AND folderName = ?", 
      [userId, folderName]
    );

    // אם התיקיה קיימת, נחזור עם שגיאה
    if (existentFolder.length > 0) {
      return { 
        success: false, 
        message: "תיקיה בשם זה כבר קיימת עבור משתמש זה." 
      };
    }

    // הוספת תיקיה חדשה לבסיס הנתונים
    await query(
      "INSERT INTO folders (userId, folderName, end_selection) VALUES (?, ?, ?)", 
      [userId, folderName, 0]
    );

    // שליפת מזהה התיקיה החדשה
    const folderIdResult = await query(
      "SELECT id FROM folders WHERE userId = ? AND folderName = ?", 
      [userId, folderName]
    );

    // החזרת תוצאה עם הצלחה
    return { 
      success: true, 
      message: "תיקיה נשמרה בהצלחה", 
      folderId: folderIdResult[0].id, 
      userId, 
    };
  } catch (err) {
    // טיפול בשגיאות
    return { 
      success: false, 
      message: `Database query failed: ${err.message}` 
    };
  }
};

const querySaveImages = async (userId, folderName, images) => {
  try {
    const result = await query(
      "SELECT id FROM folders WHERE userId = ? AND folderName = ?",
      [userId, folderName]
    );

    const folderId = result[0].id;
    console.log("folderId", folderId);

    // מעבר על כל התמונה במערך
    for (const image of images) {
      const checked = 0; // הגדרת ערך ברירת מחדל ל-checked
      await query(
        "INSERT INTO images (folderId, imageName, checked) VALUES (?, ?, ?)",
        [folderId, image, checked]
      );
    }
    return { success: true, message: "Images saved successfully" };
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const querySaveImage = async (folderId, imageName) => {
  try {
    const checked = 0; // הגדרת ערך ברירת מחדל ל-checked
    await query(
      "INSERT INTO images (folderId, imageName, checked) VALUES (?, ?, ?)",
      [folderId, imageName, checked]
    );
    return { success: true, message: "Image saved successfully" };
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const queryGetImagesNames = async (folderId) => {
  try {
    const result = await query(
      "SELECT imageName FROM images WHERE folderId = ? and checked = 1",
      [folderId]
    );
    return result;
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const queryDeleteFolder = async (folderId) => {
  console.log("folderId", folderId);
  try {
    await query("DELETE FROM images WHERE folderId = ?", [folderId]);
    await query("DELETE FROM folders WHERE id = ?", [folderId]);
    return { success: true, message: "Folder deleted successfully" };
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const queryEndSelection = async (folderId) => {
  try {
    await query("UPDATE folders SET end_selection = 1 WHERE id = ?", [
      folderId,
    ]);
    return { success: true, message: "Folder updated successfully" };
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const queryDeleteImage = async (imageId, folderId) => {
  console.log("imageId", imageId, "folderId", folderId);

  try {
    await query("DELETE FROM images WHERE id = ? AND folderId = ?", [
      imageId,
      folderId,
    ]);
    return { success: true, message: "Image deleted successfully" };
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

export default {
  queryGetCustomers,
  queryDeleteCustomer,
  sendingEmail,
  queryLogin,
  querySaveFolder,
  querySaveImages,
  querySaveImage,
  queryDeleteFolder,
  queryEndSelection,
  queryGetImagesNames,
  queryDeleteImage,
};
