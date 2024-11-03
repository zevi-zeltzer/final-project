
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
    const result = await response.json();
    if (response.status === 200 && result.success) {
      alert("האימייל נשלח בהצלחה");
    } else {
      alert("שגיאה בשליחת האימייל"); 
      throw new Error("שגיאה בשליחת האימייל");
    }
    return result;
  } catch (error) {
      console.error(error);
      }
  };



  module.exports = { getCustomers, sendEmail };