import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  TextField,
} from "@mui/material";
import apiCustomers from "../services/apiCustomers";

function Profile({ client, closeProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState(client);
  const [userInfo, setUserInfo] = useState(client);
  const [tempPassword, setTempPassword] = useState(""); // שמירת הסיסמה הזמנית שהמשתמש מזין
  const [verifiedTempPassword, setVerifiedTempPassword] = useState(false); // בדיקת אימות של הסיסמה הזמנית
  const [newPassword, setNewPassword] = useState(""); // שמירת הסיסמה החדשה
  const [oldPassword, setOldPassword] = useState(""); // שמירת הסיסמה הישנה
  const [ifSendedEmail, setIfSendedEmail] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("");
  const token = sessionStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;
  const user = JSON.parse(localStorage.getItem("userInfo"));
  

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    const edit = await apiCustomers.saveClientEditing(editedClient); // שמירה של הפרטים החדשים
    console.log(edit);
    if (edit) {
      localStorage.setItem("userInfo", JSON.stringify(editedClient));
      setUserInfo(editedClient);
    }
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = async () => {
    const emailVerification = await apiCustomers.fetchEmailVerification(
      client.fullName,
      userId
    ); // שליחת האימייל לאימות
    console.log(emailVerification.success);
    if (emailVerification?.success) {
      setIfSendedEmail(true);
    } else {
      alert("שגיאה בשליחת האימייל");
    }
  };

  const handleVerifyTempPassword = async () => {
    const tempPasswordVerification = await apiCustomers.verifyTempPassword(
      userId,
      tempPassword
    )
    console.log(tempPasswordVerification);
    
    if(tempPasswordVerification.success){
      setVerifiedTempPassword(true);
      alert("סיסמה זמנית אומתה בהצלחה!");
    }
     else {
      alert("הסיסמה הזמנית שגויה, נסה שנית.");
    }
  };

  const handlePasswordSubmit = async () => {
    
    if (newPassword !== confirmPassword) {
      alert("הסיסמות לא תואמות.");
      return;
    }

    const updateResponse = await apiCustomers.updatePassword(userId,oldPassword, newPassword);
    console.log(updateResponse);
    
    if (updateResponse.success) {
      alert("הסיסמה שונתה בהצלחה!");
      setNewPassword("");
      setOldPassword("");
      setTempPassword("");
      setVerifiedTempPassword(false);
      setIfSendedEmail(false);
    } else {
      alert("שגיאה בעדכון הסיסמה");
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedClient(client);
    setTempPassword("");
    setVerifiedTempPassword(false);
    setIfSendedEmail(false);

  };

  return (
    <Paper
      sx={{
        padding: 3,
        width: "400px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRadius: 2,
        boxShadow: 3,
      }}
      elevation={6}
    >
      {!ifSendedEmail && !verifiedTempPassword && <Typography variant="h6" sx={{ textAlign: "center", fontWeight: "bold" }}>
        פרטי הלקוח
      </Typography>}
      {ifSendedEmail  && <Typography variant="h6" sx={{ textAlign: "center", fontWeight: "bold" }}>
      עדכון סיסמה
      </Typography>}

      {ifSendedEmail && !verifiedTempPassword && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: 2,
            backgroundColor: "#f0f0f0",
            borderRadius: 2,
          }}
        >
          <Typography variant="body1" color="textSecondary">
            אנא הזן את הסיסמה שקיבלת במייל:
          </Typography>
          <TextField
            label="סיסמה זמנית"
            type="password"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleVerifyTempPassword}
          >
            אמת סיסמה זמנית
          </Button>
        </Box>
      )}

      {verifiedTempPassword && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: 2,
            backgroundColor: "#f0f0f0",
            borderRadius: 2,
          }}
        >
          <Typography variant="body1" color="textSecondary">
            הזן את הסיסמה הישנה שלך:
          </Typography>
          <TextField
            label="סיסמה ישנה"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            fullWidth
          />
          <Typography variant="body1" color="textSecondary">
            הזן סיסמה חדשה:
          </Typography>
          <TextField
            label="סיסמה חדשה"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
          />
          <Typography variant="body1" color="textSecondary">
            הזן שוב את הסיסמה החדשה:
          </Typography>
          <TextField
            label="אימות סיסמה חדשה"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handlePasswordSubmit}
          >
            שמור סיסמה חדשה
          </Button>
        </Box>
      )}

      {isEditing && !ifSendedEmail && (
        <Button
          variant="contained"
          color="primary"
          sx={{
            alignSelf: "flex-end",
            marginBottom: 2,
          }}
          onClick={handleChangePassword}
        >
          שינוי סיסמה
        </Button>
      )}

      {!verifiedTempPassword && !ifSendedEmail && <Card sx={{ padding: 2, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          {isEditing ? (
            <>
              <TextField
                label="שם משתמש"
                name="username"
                value={editedClient.username}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="שם מלא"
                name="fullName"
                value={editedClient.fullName}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="אימייל"
                name="email"
                value={editedClient.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="מספר טלפון"
                name="phone"
                value={editedClient.phone}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </>
          ) : (
            <>
              <Typography variant="subtitle1" color="textSecondary">
                <strong>שם משתמש:</strong> {userInfo.username}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                <strong>שם מלא:</strong> {userInfo.fullName}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                <strong>אימייל:</strong> {userInfo.email}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                <strong>מספר טלפון:</strong> {userInfo.phone}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>}

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        {isEditing ? (
          <>
           {!ifSendedEmail && <Button variant="contained" color="primary" onClick={handleSaveClick}>
              שמור
            </Button>}
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancelClick}
            >
              ביטול
            </Button>
          </>
        ) : (
          <>
            {user.username === userInfo.username && (
              <Button variant="contained" color="primary" onClick={handleEditClick}>
                ערוך פרופיל
              </Button>
            )}
            <Button variant="outlined" color="secondary" onClick={() => closeProfile()}>
              סגור
            </Button>
          </>
        )}
      </Box>
    </Paper>
  );
}

export default Profile;
