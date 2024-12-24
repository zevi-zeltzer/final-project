import React, { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import apiCustomers from "../services/apiCustomers";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");

    if (
      password.length < 6 ||
      password.length > 20 ||
      password.search(/[a-z]/i) < 0
    ) {
      setSnackbar({
        open: true,
        message: "Password must be between 6 and 20 characters and contain at least one letter",
        severity: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "Passwords do not match",
        severity: "error",
      });
      return;
    }

    try {
      const data = await apiCustomers.fetchRegister(
        username,
        password,
        email,
        phone,
        fullName
      );

      if (data.status === 200) {
        setSnackbar({
          open: true,
          message: "ההרשמה בוצעה בהצלחה!",
          severity: "success",
        });
        navigate("/login");
      } else if (data.status === 409) {
        setSnackbar({
          open: true,
          message: "שם המשתמש כבר קיים",
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "שגיאה בהרשמה: שם המשתמש כבר קיים או שיש בעיה בשרת",
          severity: "error",
        });
      }
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "אירעה שגיאה בביצוע ההרשמה. אנא נסה שוב מאוחר יותר.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box className="register" dir="rtl" sx={{ maxWidth: 400, margin: "auto", padding: 3 }}>
      <Box sx={{ textAlign: "center", marginBottom: 2 }}>
        <img src="/images/logo.jpg" alt="Logo" style={{ maxWidth: "100%", height: "auto" }} />
      </Box>

      <Typography variant="h4" component="h2" gutterBottom align="center">
        רישום לאתר הצילומים של ליבי
      </Typography>
      <form onSubmit={handleRegister}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: 2,
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: "#fff",
          }}
        >
          <TextField
            id="fullName"
            label="שם מלא"
            variant="outlined"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <TextField
            id="username"
            label="שם משתמש"
            variant="outlined"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            id="email"
            label="אימייל"
            type="email"
            variant="outlined"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            id="phone"
            label="טלפון"
            variant="outlined"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            id="password"
            label="סיסמה"
            variant="outlined"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            id="confirmPassword"
            label="אימות סיסמה"
            variant="outlined"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            variant="contained"
            color="primary"
            type="submit"
            sx={{ marginTop: 2 }}
          >
            הירשם
          </Button>
        </Box>
      </form>

      {error && (
        <Typography variant="body2" color="error" align="center" sx={{ marginTop: 2 }}>
          {error}
        </Typography>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Register;
