
const fetchRegister = async (username, password, email, phone, fullName) => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/customers/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          email,
          phone,
          fullName,
        }),
      }
    );
    console.log(response.status);
    const data = await response.json();

   
    if (response.ok) {
      alert("ההרשמה בוצעה בהצלחה!");
    } else {
      // הצגת הודעת שגיאה מהשרת אם קיימת, אחרת הצגת הודעה כללית
      alert(
       "שגיאה בהרשמה: שם המשתמש כבר קיים או שיש בעיה בשרת"
      );
    }
    return response;
  } catch (error) {
    console.error(error);
    alert("אירעה שגיאה בביצוע ההרשמה. אנא נסה שוב מאוחר יותר.");
  }
};

const fetchShowFolders = async (fullName, userId) => {
  const token = sessionStorage.getItem("token");

  console.log("fullName", fullName);
  try {
    const response = await fetch(
      `http://localhost:5000/api/customers/getFolders/${fullName}/?userId=${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("שגיאה בשליפת התיקיות");
    }
    const data = await response.json();
    console.log("data", data.arrNamesFolders);

    return data;
  } catch (error) {
    console.error(error);
  }
};

const fetchImagesChecked = async (arrIdFolder) => {
  const token = sessionStorage.getItem("token");

  console.log("arrIdFolder", arrIdFolder);
  try {
    const response = await fetch(
      `http://localhost:5000/api/customers/getImagesChecked`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ arrIdFolder }),
      }
    );
    if (!response.ok) {
      throw new Error("שגיאה בשליפת המסומנים");
    }
    const data = await response.json();
    console.log("dataImagesChecked", data);

    return data;
  } catch (error) {
    console.error(error);
  }
};

const fetchShowImages = async (fullName, folderName, folderId) => {
  const token = sessionStorage.getItem("token");

  console.log("fullName", fullName, "folderId11", folderId);
  try {
    const response = await fetch(
      `http://localhost:5000/api/customers/getImages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, folderName, folderId }),
      }
    );
    if (!response.ok) {
      throw new Error("שגיאה בשליפת התמונות");
    }
    const data = await response.json();
    console.log("dataImages", data);

    return data;
  } catch (error) {
    console.error(error);
  }
};

const fetchCheckImage = async (imageId, ifChecked) => {
  
  const token = sessionStorage.getItem("token");
  console.log(token);
  try {
    const response = await fetch(
      `http://localhost:5000/api/customers/checkImage?imageId=${imageId}&ifChecked=${ifChecked}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("שגיאה בסימון התמונות");
    }
    return response.json();
  } catch (error) {
    console.error(error);
  }
};

const saveClientEditing = async (editedClient) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:5000/api/customers/editClient`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedClient),
      }
    );
    if (!response.ok) {
      throw new Error("שגיאה בעריכת הלקוח");
    }
    const data = await response.json();
    console.log(data);

    return data;
  } catch (error) {
    console.error(error);
  }
};

const fetchEmailVerification = async (fullName,  userId) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:5000/api/customers/sendEmailVerification?fullName=${fullName}&userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("שגיאה בשליחת האימייל");
    }
    const data = await response.json();
    console.log(data.message);

    return data;
  } catch (error) {
    console.error(error);
  }
};


const verifyTempPassword = async (userId, tempPassword) => {
  console.log("userId", userId, "tempPassword", tempPassword);
  
  try {
    const response = await fetch(
      `http://localhost:5000/api/customers/verifyTempPassword?userId=${userId}&tempPassword=${tempPassword}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("שגיאה באימות הסיסמה");
    }
    const data = await response.json();
    console.log(data.message);

    return data;
  } catch (error) {
    console.error(error);
  }
};


const updatePassword = async (userId,oldPassword, newPassword) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:5000/api/customers/updatePassword?userId=${userId}&newPassword=${newPassword}&oldPassword=${oldPassword}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if(response.status === 401){
      alert("הסיסמה הישנה שגויה.");
      return;
    }
    if (!response.ok) {
      throw new Error("שגיאה בעדכון הסיסמה");
    }
    const data = await response.json();
    console.log(data.message);

    return data;
  } catch (error) {
    console.error(error);
  }
};

const forgotPassword = async (username, email) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/customers/forgotPassword?username=${username}&email=${email}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("שגיאה בשליחת הבקשה");
    }
    const data = await response.json();
    console.log(data.message);

    return data;
  } catch (error) {
    console.error(error);
  }
};


const changePassword = async (userId, newPassword) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/customers/changePassword?userId=${userId}&newPassword=${newPassword}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
         
        },
      }
    );
    if (!response.ok) {
      throw new Error("שגיאה בעדכון הסיסמה");
    }
    const data = await response.json();
    console.log(data.message);

    return data;
  } catch (error) {
    console.error(error);
  }
};


export default {
  fetchRegister,
  fetchShowFolders,
  fetchImagesChecked,
  fetchShowImages,
  fetchCheckImage,
  saveClientEditing,
  fetchEmailVerification,
  verifyTempPassword,
  updatePassword,
  forgotPassword,
  changePassword
};