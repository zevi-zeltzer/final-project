import React, { useEffect, useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  Modal,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import FavoriteIcon from "@mui/icons-material/Favorite"; // אייקון לב מלא
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"; // אייקון לב ריק
import DownloadIcon from "@mui/icons-material/Download"; // אייקון הורדה
import apiCustomers from "../services/apiCustomers";

function PhotoClient({ image, index, imagesName, imageId, imageChecked,endFolder }) {
  const [checked, setChecked] = useState(imageChecked === 1);

  // עדכון המצב כשה-prop משתנה
  useEffect(() => {
    setChecked(imageChecked === 1);
  }, [imageChecked, endFolder]);

  const getFullImagePath = (imagePath) => {
    return `http://localhost:5000/${
      imagePath.startsWith("/") ? imagePath.substring(1) : imagePath
    }`;
  };

  const handleHeartClick = () => {
    if (endFolder===1) return;
    const newCheckedState = !checked;
    setChecked(newCheckedState);
    apiCustomers.fetchCheckImage(imageId, newCheckedState); // מעדכן את המצב לשרת
  };

  const handleDownloadClick = () => {
    const imagePath = getFullImagePath(image);
    const link = document.createElement("a");
    link.href = imagePath;
    link.download = imagesName[index] || "image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenModal = () => setOpenModal(true);

  const handleCloseModal = () => setOpenModal(false);

  const [openModal, setOpenModal] = useState(false);

  return (
    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
      <Card
        sx={{
          width: 300,
          height: 350,
          margin: "auto",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* לב למעלה */}
        <Box sx={{ position: "absolute", top: 10, right: 10 }}>
          <IconButton
            onClick={handleHeartClick}
            sx={{
              color: checked ? "red" : "grey", // צבע לפי מצב
              "&:hover": { color: checked ? "darkred" : "darkgrey" },
            }}
          >
            {checked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>

        {/* הצגת תמונה */}
        <CardMedia
          component="img"
          image={getFullImagePath(image)}
          alt={imagesName[index] || "Image"}
          sx={{
            width: "100%",
            height: 270,
            objectFit: "cover",
            borderRadius: 1,
          }}
          onClick={handleOpenModal}
        />

        {/* כפתור הורדה */}
        <Box sx={{ position: "absolute", bottom: 12, left: 35 }}>
          <IconButton
            onClick={handleDownloadClick}
            sx={{
              color: "#1976D2",
              "&:hover": { color: "#1565C0" },
            }}
          >
            <DownloadIcon />
          </IconButton>
        </Box>

        {/* תוכן כרטיס */}
        <CardContent>
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {imagesName[index]?.split(".")[0] || "ללא שם"}
          </Typography>
        </CardContent>
      </Card>

      {/* Modal להצגת תמונה */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backdropFilter: "blur(10px)",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            outline: "none",
            width: "90%",
            maxWidth: "800px",
            maxHeight: "90vh",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={getFullImagePath(image)}
            alt={imagesName[index] || "Image"}
            style={{
              width: "auto",
              height: "auto",
              maxWidth: "100%",
              maxHeight: "90vh",
              borderRadius: "10px",
            }}
          />
        </Box>
      </Modal>
    </Grid>
  );
}

export default PhotoClient;
