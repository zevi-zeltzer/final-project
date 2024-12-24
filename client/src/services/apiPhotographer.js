
const fetchLogin = async (username, password) => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/photographer/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      }
    );
    console.log(response.status);

    

    const data = await response.json();
    sessionStorage.setItem("token", data.token);
    localStorage.setItem("userInfo", JSON.stringify(data.userInfo));
    return data;
  } catch (error) {
    console.error(error);
  }
};



const fetchGetCustomers = async () => {
  const token = sessionStorage.getItem("token");
  
  if (token) {
  try {
    const response = await fetch(
      "http://localhost:5000/api/photographer/getCustomers",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      console.log(response.ok);

      throw new Error("שגיאה בשליפת הלקוחות");
    }
    return response.json();
  } catch (error) {
    console.error(error);
  }}
};

const fetchDeleteCustomer = async (id) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:5000/api/photographer/deleteCustomer/?id=${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("שגיאה במחיקת הלקוח");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

const fetchSendEmail = async (email) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(
      "http://localhost:5000/api/photographer/send-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      }
    );
    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error(error);
  }
};

const fetchFoldersUpload = async (formData, client, folderName) => {
  const token = sessionStorage.getItem("token");

  console.log("formData", formData);
  console.log("client", client);

  try {
    const response = await fetch(
      `http://localhost:5000/api/photographer/foldersUpload/?fullName=${client.fullName}&folderName=${folderName}`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const result = await response.json();
    

    return result;
  } catch (error) {
    console.error(error);
  }
};

const fetchImageUpload = async (formData, client, folderId, folderName) => {
  const token = sessionStorage.getItem("token");

  console.log("formData", formData);
  console.log("client", client);

  try {
    const response = await fetch(
      `http://localhost:5000/api/photographer/imageUpload/?fullName=${client.fullName}&folderId=${folderId}&folderName=${folderName}`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
  }
};


const fetchDeleteFolder = async (fullName, folderName, folderId) => {
  const token = sessionStorage.getItem("token");

  console.log("folderId-----", folderId);

  try {
    const response = await fetch(
      `http://localhost:5000/api/photographer/deleteFolder?fullName=${encodeURIComponent(
        fullName
      )}&folderName=${encodeURIComponent(folderName)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ folderId, fullName, folderName }),
      }
    );
    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error("שגיאה במחיקת התיקייה");
    }
    return data;
  } catch (error) {
    console.error(error);
  }
};


const fetchEndSelection = async (fullName, folderName, folderId) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:5000/api/photographer/endSelection`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, folderName, folderId }),
      }
    );
    if (!response.ok) {
      throw new Error("שגיאה בסיום הבחירה");
    }
    const data = await response.json();
    console.log(data);

    return data;
  } catch (error) {
    console.error(error);
  }
};

const fetchImageDelete = async (imagePath, imageId, folderId) => {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:5000/api/photographer/deleteImage`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imagePath, imageId, folderId }),
      }
    );
    if (!response.ok) {
      throw new Error("שגיאה במחיקת התמונה");
    }
    const data = await response.json();
    console.log(data);

    return data;
  } catch (error) {
    console.error(error);
  }
};



export default {
  fetchLogin,
  fetchGetCustomers,
  fetchDeleteCustomer,
  fetchSendEmail,
  fetchFoldersUpload,
  fetchImageUpload,
  fetchDeleteFolder,
  fetchEndSelection,
  fetchImageDelete,
};
