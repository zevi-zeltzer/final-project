import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import apiPhotographer from "../services/apiPhotographer";
import apiCustomers from "../services/apiCustomers";

function ClientGallery() {
  const location = useLocation();
  const client = location.state?.client;
  const [foldersName, setFoldersName] = useState([]);
  const [foldersId, setFoldersId] = useState([]);
  const [arrEndFolders, setArrEndFolders] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // ניהול פתיחת הדיאלוג
  const [folderToDelete, setFolderToDelete] = useState(null); // שמירת תיקייה למחיקה
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!client) {
      console.error("לא נמצאו נתונים עבור הלקוח.");
      return;
    }

    const fetchShowFolders = async () => {
      try {
        const response = await apiCustomers.fetchShowFolders(
          client.fullName,
          client.id
        );
        setFoldersName(response.arrNamesFolders);
        setFoldersId(response.arrIdFolders);
        setArrEndFolders(response.arrEndFolders);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(true);
      }
    };

    fetchShowFolders();
  }, [client]);

  if (!client) {
    return (
      <Typography variant="h6" color="error">
        לא נמצאו נתונים עבור הלקוח.
      </Typography>
    );
  }

  if (!loading) {
    return (
      <Typography variant="h6" color="error">
        טוען תיקיות...
      </Typography>
    );
  }
  console.log(
    "foldersName",
    foldersName,
    "arrIdFolders",
    foldersId,
    "arrEndFolders",
    arrEndFolders
  );

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleFolderUpload = async (event) => {
    setUploading(true);
    const folder = event.target.files;
    console.log(folder);

    const formData = new FormData();
    const firstFolderPath = folder[0].webkitRelativePath || folder[0].name;
    const folderName = firstFolderPath.split("/")[0];
    console.log(folderName);

    formData.append("folderName", folderName);
    formData.append("userId", client.id);

    Array.from(folder).forEach((image) => {
      formData.append("images", image);
    });

    try {
      const foldersUploaded = await apiPhotographer.fetchFoldersUpload(
        formData,
        client,
        folderName
      );
      if (!foldersUploaded.folderId) {
        console.error("שגיאה בהעלאת התיקיות");
        setSnackbar({
          open: true,
          message: "שגיאה בהעלאת התיקיות. אנא נסה שוב.",
          severity: "error",
        });
      } else {
        setFoldersName((prevFolders) => [...prevFolders, folderName]);
        setFoldersId((prevIds) => [...prevIds, foldersUploaded.folderId[0]]);
        setSnackbar({
          open: true,
          message: "התיקייה הועלתה בהצלחה!",
          severity: "success",
        });
      }
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "שגיאה בהעלאה. אנא בדוק את חיבור האינטרנט שלך.",
        severity: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImagesShow = async (folderName, index) => {
    const folderId = foldersId[index];
    const endFolder = arrEndFolders[index];
    console.log(endFolder);

    console.log(folderId);

    navigate(
      `/photographer/home/clients/${client.id}/gallery/folder/${folderId}/images`,
      {
        state: {
          folderName: folderName,
          client: client,
          folderId: folderId,
          endFolder: endFolder,
        },
      }
    );
  };

  const openDeleteFolderDialog = (folder, index) => {
    setFolderToDelete({ name: folder, index }); // שמירת תיקייה למחיקה
    setOpenDeleteDialog(true); // פתיחת הדיאלוג
  };

  const closeDeleteFolderDialog = () => {
    setOpenDeleteDialog(false); // סגירת הדיאלוג
    setFolderToDelete(null);
  };

  const handleConfirmDeleteFolder = async () => {
    if (!folderToDelete) return;

    const { name: folderName, index } = folderToDelete;

    // הסרה מיידית של התיקייה מהסטייט
    const updatedFolders = foldersName.filter((_, i) => i !== index);
    setFoldersName(updatedFolders);
    arrEndFolders.splice(index, 1);
    closeDeleteFolderDialog(); // סגירת הדיאלוג

    // שליחת בקשה לשרת למחיקת התיקייה
    try {
      const response = await apiPhotographer.fetchDeleteFolder(
        client.fullName,
        folderName,
        foldersId[index]
      );
       console.log("response", response);
       
      if (!response.success) {
        console.error("שגיאה במחיקת התיקייה");
        setSnackbar({
          open: true,
          message: "שגיאה במחיקת התיקייה. אנא נסה שוב.",
          severity: "error",
        });
        setFoldersName((prev) => [
          ...prev.slice(0, index),
          folderName,
          ...prev.slice(index),
        ]);
      } else {
        setSnackbar({
          open: true,
          message: "התיקייה נמחקה בהצלחה!",
          severity: "success",
        });
      }
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "שגיאה ברשת. לא ניתן היה למחוק את התיקייה.",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        גלריה עבור {client.fullName}
      </Typography>

      <Box sx={{ marginBottom: 4 }}>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFolderUpload}
          style={{ display: "none" }}
          id="file-upload"
          webkitdirectory="true"
        />
        <label htmlFor="file-upload">
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/photographer/home/clients")}
          >
            חזרה ללקוחות
          </Button>
          <Button
            variant="contained"
            component="span"
            color="primary"
            sx={{ marginRight: 2 }}
          >
            העלאת תיקיות
          </Button>
        </label>
        {uploading && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)", // רקע שחור שקוף
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999, // קדימות גבוהה
              backdropFilter: "blur(5px)", // טשטוש הרקע
            }}
          >
            <Box sx={{ textAlign: "center", color: "white" }}>
              <CircularProgress color="inherit" />
              <Typography variant="h6" sx={{ marginTop: 2 }}>
                מעלה...
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {foldersName.length > 0 &&
          foldersName.map((folder, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative", // מאפשר מיקום הסרט
                  overflow: "visible", // דואג שהסרט ייראה גם מחוץ לכרטיס
                }}
              >
                {arrEndFolders[index] === 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "40px", // הסרט יתחיל ממש קצת מעל הכרטיס
                      left: "10px", // סטייה קלה מהשוליים
                      width: "50%", // הסרט יתפוס 80% מרוחב הכרטיס
                      backgroundColor: "#4caf50",
                      color: "white",
                      padding: "4px",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "12px", // טקסט קטן יותר
                      transform: "rotate(-20deg)", // נטייה מתונה
                      transformOrigin: "left top",
                      zIndex: 2, // מעל כל תוכן אחר
                      borderRadius: "4px", // קצוות מעוגלים
                    }}
                  >
                    בחירה הושלמה
                  </Box>
                )}

                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {folder}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() =>
                      handleImagesShow(folder, index, foldersId[index])
                    }
                    variant="contained"
                    color="primary"
                  >
                    הצג תמונות
                  </Button>
                  <Button
                    size="small"
                    onClick={() => openDeleteFolderDialog(folder, index)}
                    variant="outlined"
                    color="error"
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      style={{ marginRight: 8 }}
                    />
                    מחק תיקייה
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Dialog לאישור מחיקה */}
      <Dialog
        open={openDeleteDialog}
        onClose={closeDeleteFolderDialog}
        aria-labelledby="delete-folder-dialog-title"
        aria-describedby="delete-folder-dialog-description"
      >
        <DialogTitle id="delete-folder-dialog-title">
          אישור מחיקת תיקייה
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-folder-dialog-description">
            האם אתה בטוח שברצונך למחוק את התיקייה "{folderToDelete?.name}"?
            פעולה זו אינה ניתנת לשחזור.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteFolderDialog} color="primary">
            ביטול
          </Button>
          <Button
            onClick={handleConfirmDeleteFolder}
            color="error"
            variant="contained"
          >
            מחק
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000} // משך הזמן שההודעה מופיעה
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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

export default ClientGallery;
