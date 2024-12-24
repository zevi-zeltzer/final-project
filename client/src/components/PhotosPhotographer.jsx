import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteIcon from "@mui/icons-material/Delete";
import apiCustomers from "../services/apiCustomers";
import apiPhotographer from "../services/apiPhotographer";

function PhotosPhotographer() {
  const location = useLocation();
  const navigate = useNavigate();
  const folderName = location.state.folderName;
  const client = location.state.client;
  const folderId = location.state.folderId;
  const endFolder = location.state.endFolder;

  const [imagesPath, setImagesPath] = useState([]);
  const [imagesName, setImagesName] = useState([]);
  const [imagesId, setImagesId] = useState([]);
  const [imagesChecked, setImagesChecked] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [ifImagesSelected, setIfImagesSelected] = useState(false);
  const [tempImagesNames, setTempImagesNames] = useState([]);
  const [tempImagesPath, setTempImagesPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    if (!client) return;

    const controller = new AbortController();
    const fetchShowImages = async () => {
      try {
        const response = await apiCustomers.fetchShowImages(
          client.fullName,
          folderName,
          folderId,
          {
            signal: controller.signal,
          }
        );
        setImagesPath(response.imagesPath);
        setImagesName(response.imagesName);
        setImagesId(response.arrIdImages);
        setImagesChecked(response.arrChecked);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("API call aborted");
        } else {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShowImages();

    return () => {
      controller.abort();
    };
  }, [folderId, client, folderName]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const checkScroll = () => {
    setShowScrollTop(window.scrollY > 300);
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScroll);
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center" }}>Loading...</div>;
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folderName", folderName);

      try {
        const imageUploaded = await apiPhotographer.fetchImageUpload(
          formData,
          client,
          folderId,
          folderName
        );

        if (imageUploaded) {
          setSnackbarMessage("התמונה נשלחה בהצלחה!");
          setSnackbarSeverity("success");
          setImagesPath((prevImagesPath) => [
            ...prevImagesPath,
            imageUploaded.path,
          ]);
          setImagesName((prevImagesName) => [
            ...prevImagesName,
            imageUploaded.name,
          ]);
        } else {
          setSnackbarMessage("שגיאה בהעלאת התמונה");
          setSnackbarSeverity("error");
        }
      } catch (error) {
        console.error(error);
        setSnackbarMessage("שגיאה בהעלאת התמונה");
        setSnackbarSeverity("error");
      } finally {
        setSnackbarOpen(true);
      }
    }
  };

  const openDeleteImageDialog = (index) => {
    setImageToDelete(index);
    setOpenDeleteDialog(true);
  };

  const closeDeleteImageDialog = () => {
    setOpenDeleteDialog(false);
    setImageToDelete(null);
  };

  const handleConfirmDeleteImage = async () => {
    if (imageToDelete === null) return;

    const imagePath = imagesPath[imageToDelete];
    const imageId = imagesId[imagesId.length - 1 - imageToDelete];

    try {
      const response = await apiPhotographer.fetchImageDelete(
        imagePath,
        imageId,
        folderId
      );
      if (response.success) {
        setSnackbarMessage("התמונה נמחקה בהצלחה!");
        setSnackbarSeverity("success");
        setImagesPath((prev) => prev.filter((_, i) => i !== imageToDelete));
        setImagesName((prev) => prev.filter((_, i) => i !== imageToDelete));
      } else {
        setSnackbarMessage("שגיאה במחיקת התמונה");
        setSnackbarSeverity("error");
      }
    } catch (error) {
      console.error(error);
      setSnackbarMessage("שגיאה במחיקת התמונה");
      setSnackbarSeverity("error");
    } finally {
      closeDeleteImageDialog();
      setSnackbarOpen(true);
    }
  };

  function getFullImagePath(imagePath) {
    return `http://localhost:5000/${
      imagePath.startsWith("/") ? imagePath.substring(1) : imagePath
    }`;
  }

  function BackToGallery() {
    navigate(`/photographer/home/clients/${client.id}/gallery`, {
      state: { client },
    });
  }

  const handleImagesSelect = () => {
    setIfImagesSelected(true);
    const selectedImages = imagesPath.filter(
      (_, index) => imagesChecked[index] === 1
    );
    const selectedNames = imagesName.filter(
      (_, index) => imagesChecked[index] === 1
    );
    setTempImagesPath(imagesPath);
    setTempImagesNames(imagesName);

    setImagesPath(selectedImages);
    setImagesName(selectedNames);
  };

  const handleAlImages = async () => {
    setIfImagesSelected(false);
    setImagesPath(tempImagesPath);
    setImagesName(tempImagesNames);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom sx={{textAlign: "center" }}>
        {folderName} / {client.fullName}
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        sx={{ marginBottom: 2 }}
        onClick={BackToGallery}
      >
        חזרה לגלריה
      </Button>
      {!ifImagesSelected && (
        <Button
          variant="contained"
          color="primary"
          sx={{ marginBottom: 2, marginRight: 2 }}
          component="label"
        >
          הוספת תמונה
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />
        </Button>
      )}
      {endFolder === 1 && !ifImagesSelected && (
        <Button
        variant="contained"
        color="primary"
        sx={{ marginBottom: 2, marginRight: 2 }}
        component="label"
        onClick={handleImagesSelect}
      >
          הצג תמונות שנבחרו
        </Button>
      )}
      {ifImagesSelected && (
        <Button
          
          onClick={handleAlImages}
          variant="contained"
          color="primary"
          sx={{ marginBottom: 2, marginRight: 2 }}
        >
          הצג את כל התמונות
        </Button>
      )}
      <Grid container spacing={3} justifyContent="center">
        {imagesPath.length > 0 &&
          imagesPath.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ position: "relative", width: 350 }}>
                <CardMedia
                  component="img"
                  height="280"
                  image={getFullImagePath(image)}
                  alt={imagesName[index] || "Image"}
                />
                <CardContent>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    {imagesName[index] || "ללא שם"}
                  </Typography>
                </CardContent>
                {/* אייקון מחיקה */}
                <IconButton
                  onClick={() => openDeleteImageDialog(index)}
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    "&:hover": { backgroundColor: "rgba(255, 0, 0, 0.8)" },
                  }}
                >
                  <DeleteIcon color="error" />
                </IconButton>
              </Card>
            </Grid>
          ))}
      </Grid>
      {showScrollTop && (
        <IconButton
          onClick={scrollToTop}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            backgroundColor: "#1976D2",
            color: "white",
            "&:hover": { backgroundColor: "#1565C0" },
          }}
        >
          <ArrowUpwardIcon />
        </IconButton>
      )}

      {/* Dialog לאישור מחיקת תמונה */}
      <Dialog
        open={openDeleteDialog}
        onClose={closeDeleteImageDialog}
        aria-labelledby="delete-image-dialog-title"
        aria-describedby="delete-image-dialog-description"
      >
        <DialogTitle id="delete-image-dialog-title">
          אישור מחיקת תמונה
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-image-dialog-description">
            האם אתה בטוח שברצונך למחוק את התמונה? פעולה זו אינה ניתנת לשחזור.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteImageDialog} color="primary">
            ביטול
          </Button>
          <Button
            onClick={handleConfirmDeleteImage}
            color="error"
            variant="contained"
          >
            מחק
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PhotosPhotographer;
