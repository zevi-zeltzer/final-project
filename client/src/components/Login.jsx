import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Modal from "@mui/material/Modal";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import apiPhotographer from "../services/apiPhotographer";
import apiCustomers from "../services/apiCustomers";
import { jwtDecode } from "jwt-decode";

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
      setSnackbar({
        open: true,
        message: "אנא מלא שם משתמש ומייל",
        severity: "warning",
      });
      return;
    }

    try {
      const response = await apiCustomers.forgotPassword(username, email);
      console.log("response", response.userId);

      if (response.success) {
        setUserId(response.userId);
        setSnackbar({
          open: true,
          message: "הסיסמה נשלחה למייל שלך.",
          severity: "success",
        });
        setIsTemporaryPasswordSent(true);
      } else {
        setSnackbar({
          open: true,
          message: "שגיאה באימות פרטים. נסה שוב.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "אירעה שגיאה בעת שליחת הבקשה. נסה שוב מאוחר יותר.",
        severity: "error",
      });
    }
  };

  const handleVerifyTemporaryPassword = async () => {
    console.log("temporaryPassword", temporaryPassword, "userId", userId);

    try {
      const response = await apiCustomers.verifyTempPassword(
        userId,
        temporaryPassword
      );
      console.log("response", response);

      if (response.success) {
        setIsTemporaryPasswordVerified(true);
        setSnackbar({
          open: true,
          message: response.message,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message,
          severity: "error",
        });
      }
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "אירעה שגיאה, אנא נסה שוב מאוחר יותר.",
        severity: "error",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== newPasswordConfirm) {
      setSnackbar({
        open: true,
        message: "הסיסמאות לא תואמות. נסה שוב.",
        severity: "warning",
      });
      return;
    }

    try {
      const response = await apiCustomers.changePassword(userId, newPassword);

      if (response.success) {
        setSnackbar({
          open: true,
          message: "הסיסמה עודכנה בהצלחה.",
          severity: "success",
        });
        setForgotPasswordModalOpen(false);
      } else {
        setSnackbar({
          open: true,
          message: "אירעה שגיאה בעדכון הסיסמה. נסה שוב.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "אירעה שגיאה, אנא נסה שוב מאוחר יותר.",
        severity: "error",
      });
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
        setSnackbar({ open: true, message: "התחברת בהצלחה", severity: "success" });
        const user = jwtDecode(token);
        if (user.role === "admin") {
          showAdminDashboard();
        } else {
          showCustomerDashboard(data.userInfo.fullName);
        }
      } else {
        setSnackbar({ open: true, message: data.message, severity: "error" });
        showLoginPage();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancellation = () => {
    setForgotPasswordModalOpen(false);
    setIsTemporaryPasswordSent(false);
    setTemporaryPassword("");
    setIsTemporaryPasswordVerified(false);
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
          filter: "brightness(0.7)",
          zIndex: -1,
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
                  onClick={handleCancellation}
                >
                  ביטול
                </Button>
              </Box>
            </>
          )}

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
                  onClick={handleCancellation}
                >
                  ביטול
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default Login;
