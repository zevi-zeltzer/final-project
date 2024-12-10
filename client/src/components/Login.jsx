import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Modal from "@mui/material/Modal";
import apiPhotographer from "../services/apiPhotographer";
import apiCustomers from "../services/apiCustomers";

function Login() {
  const usernameRef = useRef();
  const passwordRef = useRef();
  const forgotUsernameRef = useRef();
  const forgotEmailRef = useRef();

  const navigate = useNavigate();

  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [isTemporaryPasswordSent, setIsTemporaryPasswordSent] = useState(false);
  const [isTemporaryPasswordVerified, setIsTemporaryPasswordVerified] =
    useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [userId, setUserId] = useState(null);

  const showLoginPage = () => {
    navigate("/login");
  };

  const showAdminDashboard = () => {
    navigate("/photographer/home");
  };

  const showCustomerDashboard = (user) => {
    navigate(`/Customer/home/${user}`);
  };

  const handleForgotPassword = async () => {
    const username = forgotUsernameRef.current.value;
    const email = forgotEmailRef.current.value;

    if (!username || !email) {
      alert("אנא מלא שם משתמש ומייל");
      return;
    }

    try {
      const response = await apiCustomers.forgotPassword(username, email);
      console.log("response", response.userId);

      if (response.success) {
        setUserId(response.userId);
        alert("הסיסמה נשלחה למייל שלך.");
        setIsTemporaryPasswordSent(true); // עדכון ה-state שהסיסמה נשלחה
      } else {
        alert("שגיאה באימות פרטים. נסה שוב.");
      }
    } catch (error) {
      console.error(error);
      alert("אירעה שגיאה בעת שליחת הבקשה. נסה שוב מאוחר יותר.");
    }
  };

  const handleVerifyTemporaryPassword = async () => {
    console.log("temporaryPassword", temporaryPassword,"userId", userId);
    
    try {
      const response = await apiCustomers.verifyTempPassword(userId, temporaryPassword);
      console.log("response", response);
      

      if (response.success) {
        setIsTemporaryPasswordVerified(true);
        alert("הסיסמה הזמנית אומתה בהצלחה.");
      } else {
        alert("הסיסמה הזמנית לא נכונה. נסה שוב.");
      }
    } catch (error) {
      console.error(error);
      alert("אירעה שגיאה, אנא נסה שוב מאוחר יותר.");
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== newPasswordConfirm) {
      alert("הסיסמאות לא תואמות. נסה שוב.");
      return;
    }

    try {
      const response = await apiCustomers.changePassword( userId, newPassword);

      if (response.success) {
        alert("הסיסמה עודכנה בהצלחה.");
        setForgotPasswordModalOpen(false); // סוגרים את המודל
      } else {
        alert("אירעה שגיאה בעדכון הסיסמה. נסה שוב.");
      }
    } catch (error) {
      console.error(error);
      alert("אירעה שגיאה, אנא נסה שוב מאוחר יותר.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;
    try {
      const data = await apiPhotographer.fetchLogin(username, password);
      const token = data.token;
      if (token) {
        const user = JSON.parse(atob(token.split(".")[1])); // פענוח המידע מה-token
        if (user.role === "admin") {
          showAdminDashboard();
        } else {
          showCustomerDashboard(data.userInfo.fullName);
        }
      } else {
        showLoginPage();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* רקע התמונה */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('/images/קולז.jpg')",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "brightness(0.7)", // עמעום התמונה
          zIndex: -1, // להציב את התמונה מתחת לתוכן
        }}
      />

      {/* תוכן הכניסה */}
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          width: 350,
          textAlign: "center",
        }}
      >
        {/* תמונת לוגו */}
        <img
          src="/images/logo.jpg"
          alt="Logo"
          style={{ width: "200px", height: "100px", marginBottom: "20px" }}
        />
        <Typography variant="h4" component="h1" gutterBottom>
          דף כניסה
        </Typography>
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          onSubmit={handleSubmit}
        >
          <TextField
            id="username"
            label="שם משתמש"
            variant="outlined"
            inputRef={usernameRef}
            fullWidth
          />
          <TextField
            id="password"
            label="סיסמה"
            type="password"
            autoComplete="current-password"
            variant="outlined"
            inputRef={passwordRef}
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
          >
            כניסה
          </Button>
        </Box>
        {/* קישור לשחזור סיסמה */}
        <Button
          variant="text"
          color="secondary"
          size="small"
          sx={{ marginTop: 2 }}
          onClick={() => setForgotPasswordModalOpen(true)}
        >
          שכחתי סיסמה
        </Button>
      </Paper>

      {/* מודל שחזור סיסמה */}
      <Modal
        open={forgotPasswordModalOpen}
        onClose={() => setForgotPasswordModalOpen(false)}
        aria-labelledby="forgot-password-title"
        aria-describedby="forgot-password-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {/* שלב שליחת מייל */}
          {!isTemporaryPasswordSent && (
            <>
              <Typography
                id="forgot-password-title"
                variant="h6"
                component="h2"
                gutterBottom
              >
                שחזור סיסמה
              </Typography>
              <TextField
                id="forgot-username"
                label="שם משתמש"
                variant="outlined"
                inputRef={forgotUsernameRef}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                id="forgot-email"
                label="אימייל"
                type="email"
                variant="outlined"
                inputRef={forgotEmailRef}
                fullWidth
              />
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleForgotPassword}
                >
                  שלח
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setForgotPasswordModalOpen(false)}
                >
                  ביטול
                </Button>
              </Box>
            </>
          )}

          {/* שלב הכנסת סיסמה זמנית */}
          {isTemporaryPasswordSent && !isTemporaryPasswordVerified && (
            <>
              <Typography
                id="temporary-password-title"
                variant="h6"
                component="h2"
                gutterBottom
              >
                הכנס סיסמה זמנית
              </Typography>
              <TextField
                id="temporary-password"
                label="סיסמה זמנית"
                variant="outlined"
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleVerifyTemporaryPassword}
                >
                  אימות סיסמה זמנית
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setForgotPasswordModalOpen(false)}
                >
                  ביטול
                </Button>
              </Box>
            </>
          )}

          {/* שלב הכנסת סיסמה חדשה */}
          {isTemporaryPasswordVerified && (
            <>
              <Typography
                id="new-password-title"
                variant="h6"
                component="h2"
                gutterBottom
              >
                הכנס סיסמה חדשה
              </Typography>
              <TextField
                id="new-password"
                label="סיסמה חדשה"
                type="password"
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                id="confirm-new-password"
                label="אימות סיסמה חדשה"
                type="password"
                variant="outlined"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                fullWidth
              />
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdatePassword}
                >
                  עדכון סיסמה
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setForgotPasswordModalOpen(false)}
                >
                  ביטול
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}

export default Login;
