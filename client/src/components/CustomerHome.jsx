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
  const [countAllImages, setCountAllImages] = useState(0);

  useEffect(() => {
    if (!token || !userInfo) {
      navigate("/login");
      return;
    }

    async function fetchShowFolders() {
      try {
        const response = await apiCustomers.fetchShowFolders(
          userInfo.fullName,
          userId
        );
        const { arrIdFolders, arrNamesFolders, arrEndFolders } = response;

        setFoldersName(arrNamesFolders);
        setFoldersId(arrIdFolders);
        setFoldersEnd(arrEndFolders);

        const countChecked = await apiCustomers.fetchImagesChecked(
          arrIdFolders
        );
        setCountAllImages(countChecked);

        // ניווט אוטומטי לתקיה הראשונה אם קיימת
        if (arrIdFolders.length > 0) {
          const id = arrIdFolders[0];
          const folderName = arrNamesFolders[0];
          const end = arrEndFolders[0];
          navigate(`/customer/home/${userInfo.fullName}/folder/${id}/images`, {
            state: { folderName, folderId: id, endFolder: end },
          });
        }
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    }

    fetchShowFolders();
  }, [token]);

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
          state: {
            folderName: folderName,
            folderId: folderId,
            endFolder: endFolder,
          },
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
                style={{ height: "55px", borderRadius: "10%" }} // גובה מותאם אישית
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
                style={{ height: "30px", borderRadius: "10%" }} // גובה מותאם למסכים קטנים
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
                    marginRight: "20px",
                    fontSize: "20px",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    "&:hover": {
                      backgroundColor: "#1565C0", // צבע חדש במצב hover
                    },
                  }}
                >
                  {folder}
                </Button>
              ))}
            </Box>
            {/* מספר התמונות שנבחרו בכללי */}
            {foldersName.length > 0 && (
              <Typography
                variant="h6"
                title="מספר התמונות שנבחרו בכללי"
                sx={{
                  flexGrow: 0,
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#1976D2", // צבע רקע
                  color: "white", // צבע הטקסט
                  borderRadius: "20px", // פינות מעוגלות
                  padding: "8px 16px", // מרווחים פנימיים
                  fontSize: { xs: "18px", md: "20px" }, // גודל משתנה לפי מסך
                  fontWeight: "bold",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // צל
                  marginLeft: 2,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* הצגת כיתוב רק במסכים גדולים */}
                <Box
                  sx={{
                    display: { xs: "none", md: "block" }, // הכיתוב מוסתר במסכים קטנים
                  }}
                >
                  מספר התמונות שנבחרו בכללי:
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#1565C0", // צבע הרקע של העיגול
                    color: "white",
                    borderRadius: "50%",
                    fontSize: { xs: "20px", md: "20px" }, // גודל הטקסט משתנה לפי המסך
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: "10px", // ריווח קטן
                    height: "30px", // גובה העיגול
                    width: "30px", // רוחב העיגול
                    textAlign: "center",
                  }}
                >
                  {countAllImages}
                </Box>
              </Typography>
            )}

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
                  <Avatar
                    alt={userInfo.username}
                    src={`/images/${userInfo.fullName}.png`}
                  />
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
                <Profile
                  client={userInfo}
                  closeProfile={closeProfile}
                  role="customer"
                />
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

      {foldersName.length > 0 ? (
        <Outlet context={{ setCountAllImages }} />
      ) : (
        <h1 style={{ textAlign: "center" }}>לא נמצאו תיקיות </h1>
      )}
    </div>
  );
}

export default CustomerHome;
