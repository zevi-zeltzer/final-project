import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Profile from "./Profile";
import apiCustomers from "../services/apiCustomers";

function CustomerHome() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = sessionStorage.getItem("token");
  console.log(userInfo, token);
  const navigate = useNavigate();
  let userId;
  if (token) {
    const decodedToken = jwtDecode(token);
    userId = decodedToken.userId;
    console.log(userId);
  }

  const [foldersName, setFoldersName] = useState([]);
  const [foldersEnd, setFoldersEnd] = useState([]);
  const [foldersId, setFoldersId] = useState([]);
  const [openProfile, setOpenProfile] = useState(false);

  useEffect(() => {
    if (!token || !userInfo) {
      navigate("/login");
    }
    async function fetchShowFolders() {
      try {
        const response = await apiCustomers.fetchShowFolders(userInfo.fullName, userId);
        console.log(response.arrNamesFolders);
        const folders = response.files;
        const arrIdFolders = response.arrIdFolders;
        const arrNamesFolders = response.arrNamesFolders;
        const arrEndFolders = response.arrEndFolders;
        const id = arrIdFolders[0];
        const folderName = arrNamesFolders[0];
        const end = arrEndFolders[0];

        console.log(
          "foldersName",
          arrNamesFolders,
          "arrIdFolders",
          arrIdFolders
        );
        setFoldersName(arrNamesFolders);
        setFoldersId(arrIdFolders);
        setFoldersEnd(arrEndFolders);

        if (folders.length > 0) {
          navigate(`/customer/home/${userInfo.fullName}/folder/${id}/images`, {
            state: { folderName: folderName, folderId: id, endFolder: end },
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchShowFolders();
  }, [token]);

  // const pages = ['תיקייה 1', 'תיקייה 2', 'תיקייה 3'];
  const settings = ["פרופיל", "יציאה"];

  function ResponsiveAppBar() {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    const handleOpenNavMenu = (event) => {
      setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
      setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
      setAnchorElNav(null);
    };

    const handleNavMenu = (page, index) => {
      const folderId = foldersId[index];
      const folderName = foldersName[index];
      const endFolder = foldersEnd[index];
      console.log("folderId", folderId, "folderName", folderName);

      navigate(
        `/customer/home/${userInfo.fullName}/folder/${folderId}/images`,
        {
          state: { folderName: folderName, folderId: folderId, endFolder: endFolder },
        }
      );

      setAnchorElNav(null);
    };

    const handleCloseUserMenu = (setting) => {
      if (setting === "יציאה") {
        localStorage.removeItem("userInfo");
        sessionStorage.removeItem("token");
        navigate("/login");
      }
      if (setting === "פרופיל") {
        setOpenProfile(true);
      }
      setAnchorElUser(null);
    };

    const closeProfile = () => {
      setOpenProfile(false); // סגירת פרופיל הלקוח
    };

    return (
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} /> */}
            <Typography
              variant="h6"
              noWrap
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <img
                src="/images/logo.jpg" // יש להחליף בנתיב התמונה שלך
                alt="logo"
                style={{ height: "40px",borderRadius: "10%" }} // גובה מותאם אישית
                
              />
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: "block", md: "none" } }}
              >
                {foldersName.map((folder, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => {
                      handleNavMenu(folder, index);
                    }}
                  >
                    <Typography sx={{ textAlign: "center" }}>
                      {folder}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Typography
              variant="h5"
              noWrap
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <img
                src="/images/logo.jpg" // נתיב התמונה שלך
                alt="logo"
                style={{ height: "30px",borderRadius:"10%" }} // גובה מותאם למסכים קטנים
              
              />
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {foldersName.map((folder, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    handleNavMenu(folder, index);
                  }}
                  sx={{
                    my: 2,
                    color: "white",
                    display: "block",
                    backgroundColor: "#1976D2",
                    "&:hover": {
                      backgroundColor: "#1565C0", // צבע חדש במצב hover
                    },
                  }}
                >
                  {folder}
                </Button>
              ))}
            </Box>
            <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center" }}>
              {/* הצגת שם המשתמש */}
              <Typography
                sx={{
                  color: "white",
                  marginRight: 2, // מרווח מימין לאווטאר
                  fontWeight: "bold",
                  margin: "0 10px",
                  fontSize: "20px",
                }}
              >
                {userInfo.fullName}
              </Typography>

              {/* אווטאר וכפתור ההגדרות */}
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={userInfo.username} src={`/images/${userInfo.fullName}.png`} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem
                    key={setting}
                    onClick={() => {
                      handleCloseUserMenu(setting);
                    }}
                  >
                    <Typography sx={{ textAlign: "center" }}>
                      {setting}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            {/* הצגת פרופיל */}
            {openProfile && (
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
            )}
          </Toolbar>
        </Container>
      </AppBar>
    );
  }

  return (
    <div>
      <ResponsiveAppBar />
     
      <Outlet />
    </div>
  );
}

export default CustomerHome;
