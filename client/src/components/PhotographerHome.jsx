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
  Popover,
} from "@mui/material";
import { useNavigate, Outlet } from "react-router-dom";
import Profile from "./Profile";

function PhotographerHome() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  

  const [anchorEl, setAnchorEl] = useState(null); // State for Popover anchor
  const handleClickProfile = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget); // Toggle the popover
  };

  const closeProfile = () => {
    setAnchorEl(null); // Close the popover
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  
  useEffect(() => {
    navigate("/photographer/home/clients");
  }, []);

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
                gap: 2.5,
                marginRight: "auto",
              }}
            >
              {/* <Button
                onClick={handleClients}
                color="inherit"
                variant="outlined"
                sx={{
                  "&:hover": { backgroundColor: "#1976D2", color: "#fff" },
                }}
              >
                הלקוחות שלי
              </Button> */}

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
              <Tooltip title="Open profile">
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

      {/* Popover for Profile */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closeProfile}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center", // ממורכז למסכים קטנים
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center", // ממורכז למסכים קטנים
        }}
        slotProps={{
          paper: {
            style: {
            borderRadius: "8px",
            minWidth: "280px", // מינימום רוחב למסכים קטנים
            maxWidth: "90vw", // 90% מרוחב המסך
            overflow: "auto", // גלילה במקרה של תוכן גדול
          },
          }
          
        }}
      >
        <Box sx={{ padding: 2 }}>
          <Profile client={userInfo} closeProfile={closeProfile} role="photographer"  />
        </Box>
      </Popover>

      <Outlet />
    </Box>
  );
}

export default PhotographerHome;
