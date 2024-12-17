import con from "../config/db.js";
import { promisify } from "util";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
const query = promisify(con.query).bind(con);

const transporter = nodemailer.createTransport({
  service: "gmail", // אפשר להשתמש בספקי שירותי מיילים אחרים
  auth: {
    user: "libiphotographs@gmail.com", // כתובת המייל שלך
    pass: process.env.EMAIL_PASSWORD, // סיסמת המייל שלך
  },
});

const queryRegister = async (
  username,
  hashedPassword,
  email,
  phone,
  fullName
) => {
  try {
    const checkResult = await query(
      "SELECT id FROM customers WHERE username = ?",
      [username]
    );

    if (checkResult.length > 0) {
      return {
        success: false,
        message: "שם המשתמש כבר קיים במערכת. בחר שם משתמש אחר.",
      };
    }

    const result = await query(
      "INSERT INTO customers (username, password, email, phone, fullName) VALUES (?, ?, ?, ?, ?)",
      [username, hashedPassword, email, phone, fullName]
    );

    const mailOptions = {
      from: "libiphotographs@gmail.com",
      to: "libiphotographs@gmail.com",
      subject: "משתמש נרשם למערכת בהצלחה",
      html: `
          <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
            <h1>${fullName} נרשם/ה למערכת בהצלחה</h1>
          </div>
        `,
    };
    await transporter.sendMail(mailOptions);
    return { success: true, result };
  } catch (err) {
    console.error("Database error:", err);
    throw new Error("אירעה שגיאה בעת ביצוע ההרשמה. אנא נסה שוב מאוחר יותר.");
  }
};

const queryGetFolders = async (userId) => {
  console.log("userId", userId);

  try {
    const result = await query("SELECT * FROM folders WHERE userId = ?", [
      userId,
    ]);
    console.log("result", result);

    return { result };
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const queryGetImagesChecked = async (arrIdFolder) => {
  let countChecked = 0;
  try {
    for (let i = 0; i < arrIdFolder.length; i++) {
      const result = await query(
        "SELECT checked FROM images WHERE folderId = ? and checked = 1",
        [arrIdFolder[i]]
      );
      if (result.length > 0) {
        for (let j = 0; j < result.length; j++) {
          if (result[j].checked === 1) {
            countChecked += 1;
          }
        }
      }
    }
    console.log("countChecked", countChecked);

    return { countChecked };
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const queryGetImages = async (folderId) => {
  console.log("folderId 53", folderId);

  try {
    const result = await query("SELECT * FROM images WHERE folderId = ?", [
      folderId,
    ]);
    console.log("result", result);

    return { result };
  } catch (err) {
    console.log("err", err);

    throw new Error(`Database query failed: ${err.message}`);
  }
};

const queryCheckImage = async (imageId, ifChecked) => {
  console.log("imageId", imageId, "ifChecked", ifChecked);

  try {
    const result = await query("UPDATE images SET checked = ? WHERE id = ?", [
      ifChecked === "true" ? 1 : 0,
      imageId,
    ]);
    return { result };
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const queryEditClient = async (userId, username, fullName, phone, email) => {
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

  try {
    const result = await query(
      "UPDATE customers SET username = ?, fullName = ?, phone = ?, email = ? WHERE id = ?",
      [username, fullName, phone, email, userId]
    );
    console.log("result", result);

    return { result };
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const randomPassword = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }
  return password;
};

const queryStoreTemporaryPassword = async (userId) => {
  const password = randomPassword();
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 5); // סיסמה תפוג אחרי 30 דקות

  try {
    // עדכון ה-DB עם הסיסמה הזמנית
    const result = await query(
      "INSERT INTO temporary_passwords (userId, temporaryPassword, expirationTime) VALUES (?, ?, ?)",
      [userId, password, expirationTime]
    );
    if (result.affectedRows === 0) {
      throw new Error("Failed to store temporary password in the database");
    }
    console.log("Temporary password stored in DB successfully");
    return password;
  } catch (err) {
    console.error("Error storing temporary password:", err.message);
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const querySendEmailVerification = async (fullName, userId) => {
  try {
    const result = await query("SELECT email FROM customers WHERE id = ?", [
      userId,
    ]);
    const email = result[0].email;
    console.log("email", email);
    if (email) {
      const password = await queryStoreTemporaryPassword(userId);
      const mailOptions = {
        from: "libiphotographs@gmail.com",
        to: email,
        subject: "אימות סיסמה",
        html: `
          <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
            <h1>שלום ${fullName}</h1>
            <p>
              הופקה עבורך סיסמה חד פעמית לאימות משתמש.<br>
              הסיסמה שלך היא: <strong>${password}</strong><br>
              הסיסמה תפוג אחרי 5 דקות.<br>
            </p>
          </div>
        `,
      };
      await transporter.sendMail(mailOptions);
      return { success: true, message: "האימייל נשלח בהצלחה" };
    }

    return { success: false, message: "Email not found" };
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const queryVerifyTempPassword = async (userId, tempPassword) => {
  console.log("userId", userId, "tempPassword", tempPassword);

  try {
    // קבלת הסיסמה הזמנית וזמן תפוגה מה-DB
    const result = await query(
      "SELECT temporaryPassword, expirationTime FROM temporary_passwords WHERE userId = ?",
      [userId]
    );

    if (result.length === 0) {
      return { success: false, message: "סיסמה זמנית לא נמצאה" };
    }

    const { temporaryPassword, expirationTime } = result[0];

    console.log(
      "temporaryPassword",
      temporaryPassword,
      "expirationTime",
      expirationTime
    );

    // השוואת הסיסמה שהוזנה עם זו ששמרנו ב-DB
    if (tempPassword !== temporaryPassword) {
      return { success: false, message: "סיסמה לא נכונה" };
    }

    // בדיקת אם הסיסמה עדיין בתוקף
    const currentTime = new Date();
    if (new Date(expirationTime) < currentTime) {
      await query("DELETE FROM temporary_passwords WHERE userId = ?", [userId]);
      return { success: false, message: "הסיסמה פגה" };
    }

    // אם הסיסמה נכונה ועדיין בתוקף, מחק את הסיסמה החד-פעמית
    await query("DELETE FROM temporary_passwords WHERE userId = ?", [userId]);

    return { success: true, message: "האימות הצליח" };
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const queryVerifyOldPassword = async (userId, password) => {
  console.log("userId", userId, "password", password);

  try {
    const result = await query("SELECT password FROM customers WHERE id = ?", [
      userId,
    ]);
    const hashedPassword = result[0].password;
    return bcryptjs.compare(password, hashedPassword);
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const queryUpdatePassword = async (userId, password) => {
  try {
    const hashedPassword = await bcryptjs.hash(password, 10);
    const result = await query(
      "UPDATE customers SET password = ? WHERE id = ?",
      [hashedPassword, userId]
    );
    return { success: true, result };
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const queryForgotPassword = async (username, email) => {
  console.log("username", username, "email", email);

  try {
    const result = await query(
      "SELECT fullName, email,id FROM customers WHERE username = ?",
      [username]
    );
    console.log("result", result[0].email);

    if (result.length === 0) {
      return { success: false, message: "שם משתמש לא נמצא" };
    }

    if (result[0].email !== email) {
      return { success: false, message: "אימייל לא תואם" };
    }
    const fullName = result[0].fullName;
    const userId = result[0].id;
    const password = await queryStoreTemporaryPassword(userId);

    const mailOptions = {
      from: "libiphotographs@gmail.com",
      to: email,
      subject: "אימות סיסמה",
      html: `
          <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
            <h1>שלום ${fullName}</h1>
            <p>
              הופקה עבורך סיסמה חד פעמית לאימות משתמש.<br>
              הסיסמה שלך היא: <strong>${password}</strong><br>
              הסיסמה תפוג אחרי 5 דקות.<br>
            </p>
          </div>
        `,
    };
    await transporter.sendMail(mailOptions);
    return { success: true, message: "האימייל נשלח בהצלחה", userId };
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

export default {
  queryRegister,
  queryGetImages,
  queryGetFolders,
  queryGetImagesChecked,
  queryCheckImage,
  queryEditClient,
  querySendEmailVerification,
  queryVerifyTempPassword,
  queryVerifyOldPassword,
  queryUpdatePassword,
  queryForgotPassword,
};
