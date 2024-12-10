import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Tooltip,
  Container,
  Avatar,
  IconButton,
  Card,
  CardContent,
  Popover,
} from "@mui/material";
import { useNavigate, Outlet } from "react-router-dom";
import Profile from "./Profile";

function PhotographerHome() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const [anchorEl, setAnchorEl] = useState(null); // סטייט למיקום הפופובר
  const [openProfile, setOpenProfile] = useState(false);

  useEffect(() => {
    navigate("/photographer/home/clients");
  }, []);

  const logout = () => {
    sessionStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const handleClients = () => {
    navigate("/photographer/home/clients");
  };

  const handleClickProfile = (event) => {
    // אם הפופובר פתוח, נסגור אותו; אחרת, נפתח אותו
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const closeProfile = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "#1976D2",
          color: "#FFFFFF",
          padding: "10px 0",
          zIndex: 800,
        }}
      >
        <Container
          maxWidth="xl"
          sx={{ paddingLeft: "5px", paddingRight: "5px" }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              {`ברוך הבא, ${userInfo.fullName}`}
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2.5, // רווח גדול יותר בין הכפתורים
                marginRight: "auto", // מזיז את הכפתורים לצד שמאל
              }}
            >
              <Button
                onClick={handleClients}
                color="inherit"
                variant="outlined"
                sx={{
                  "&:hover": { backgroundColor: "#1976D2", color: "#fff" },
                }}
              >
                הלקוחות שלי
              </Button>

              <Button
                onClick={logout}
                color="inherit"
                variant="outlined"
                sx={{
                  "&:hover": { backgroundColor: "#D32F2F", color: "#fff" },
                }}
              >
                יציאה
              </Button>
              <Tooltip title="Open profile" sx={{ display: "flex" }}>
                <IconButton onClick={handleClickProfile} sx={{ p: 0 }}>
                  <Avatar
                    src={`/images/${userInfo.fullName}.jpg`}
                    alt={userInfo.username}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* פופובר להצגת פרופיל */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)} // סוגר את הפופובר כאשר לוחצים מחוץ לו
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        sx={{
          width: 300, // רוחב המינימלי
          maxWidth: 400, // מקסימום רוחב
          position: "absolute", // מיקום קבוע
          top: "3%", // גובה מהקצה העליון של המסך
          right: "80%", // המרחק מצד ימין של המסך
          zIndex: 1000,
          "& .MuiPopover-paper": {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)", // מעומם את הרקע
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Profile client={userInfo} closeProfile={closeProfile} />
        </Box>
      </Popover>

      <Outlet />
    </Box>
  );
}

export default PhotographerHome;
