import { getAllCustomers, sendEmail } from "../models/Customer.js";

const fetchCustomers = async (req, res) => {
  try {
    const queryCustomers = await getAllCustomers();
    res.status(200).json(queryCustomers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving customers", error: error.message });
  }
};

const fetchEmail = async (req, res) => {
  try {
    const email = req.body.email;
    console.log(email);
    const data = await sendEmail(email);//לבדוק למה לא חוזר כלום
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending email", error: error.message });
  }
};

export default { fetchCustomers, fetchEmail };
