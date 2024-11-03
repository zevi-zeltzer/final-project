import con from "../config/db.js";
import { promisify } from "util";
import nodemailer from "nodemailer";

const query = promisify(con.query).bind(con);

export const getAllCustomers = async () => {
  try {
    const result = await query("SELECT * FROM customers");
    return result;
  } catch (err) {
    throw new Error(`Database query failed: ${err.message}`);
  }
};

const transporter = nodemailer.createTransport({
<<<<<<< HEAD
  service: "gmail", // אפשר להשתמש בספקי שירותי מיילים אחרים
  auth: {
    user: "RZ0548441742@gmail.com", // כתובת המייל שלך
    pass: process.env.EMAIL_PASSWORD, // סיסמת המייל שלך
  },
});
=======
    service: "gmail", // אפשר להשתמש בספקי שירותי מיילים אחרים
    auth: {
      user: "RZ0548441742@gmail.com", // כתובת המייל שלך
    / סיסמת המייל שלך
    },
  });
>>>>>>> 86405f48fbd36ffa9413a60d64b1d686f8a34053

export const sendEmail = async (email) => {
  const formLink = "https://forms.gle/DbWKN4anZCXDCRYm8";
  const mailOptions = {
    from: "RZ0548441742@gmail.com",
    to: email,
    subject: "הרשמת לקוח",
    text: ` ${formLink} :שלום לקוח יקר כדי להרשם יש למלאות את הפרטים בקישור המצורף`,
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