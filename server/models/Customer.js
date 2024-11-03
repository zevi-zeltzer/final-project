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
    service: "gmail", // אפשר להשתמש בספקי שירותי מיילים אחרים
    auth: {
      user: "RZ0548441742@gmail.com", // כתובת המייל שלך
    / סיסמת המייל שלך
    },
  });


export const sendEmail = (email) => {
    const formLink ='https://forms.gle/DbWKN4anZCXDCRYm8';
  const mailOptions = {
    from: "RZ0548441742@gmail.com",
    to: email,
    subject: "Password Reset Request",
    text:` ${formLink} :שלום לקוח יקר כדי להרשם יש למלאות את הפרטים בקישור המצורף`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed to send email" });
    } else {
      res.status(200).json({ message: "Email sent successfully" });
    }
  });
};
