
const getCustomers = async () => {
try {
    const response = await fetch("http://localhost:5000/api/customers");
    if (!response.ok) {
      throw new Error("שגיאה בשליפת הלקוחות");
    }
    return response.json();
  } catch (error) {
    console.error(error);
  }
};


const sendEmail = async (email) => {
  try {
    const response = await fetch("http://localhost:5000/api/customers/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error("שגיאה בשליחת דואר אלקטרוני");
    }
    return response.json();
  } catch (error) {
      console.error(error);
      }
  };



  module.exports = { getCustomers, sendEmail };