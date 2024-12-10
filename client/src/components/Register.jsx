import React, { useState } from "react";
import "../styles/register.css";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
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

  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");

    if (
      password.length < 6 ||
      password.length > 20 ||
      password.search(/[a-z]/i) < 0
    ) {
      setError(
        "Password must be between 6 and 20 characters and contain at least one letter"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
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

      console.log(data);

      if (data === 200) {
        navigate("/login");
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box className="register" dir="rtl" sx={{ maxWidth: 400, margin: "auto", padding: 3 }}>
      {/* Adding Logo */}
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
    </Box>
  );
}

export default Register;
