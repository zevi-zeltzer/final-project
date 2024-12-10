import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"; // ייבוא האייקון
import PhotoClient from "./PhotoClient";
import apiCustomers from "../services/apiCustomers";
import apiPhotographer from "../services/apiPhotographer";

function Photos() {
  const location = useLocation();
  const folderName = location.state.folderName;
  const client = JSON.parse(localStorage.getItem("userInfo"));
  const folderId = location.state.folderId;
  const endFolder = location.state.endFolder;
  console.log("client", client.fullName);

  const [imagesPath, setImagesPath] = useState([]);
  const [imagesName, setImagesName] = useState([]);
  const [imagesId, setImagesId] = useState([]);
  const [imagesChecked, setImagesChecked] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false); // משתנה לניהול הצגת האייקון
  const [openDialog, setOpenDialog] = useState(false); // משתנה לניהול פתיחת הדיאלוג
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
        console.log("response", imagesId[1].id);
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
  }, [folderName]);
  

 

  // פונקציה לחזור למעלה בעמוד
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // מעקב אחרי גלילה
  const checkScroll = () => {
    if (window.scrollY > 300) {
      // כאשר הגלילה עולה מעל 300px, נציג את האייקון
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScroll); // שמיעת גלילה
    return () => window.removeEventListener("scroll", checkScroll); // ניקוי השמיעה כשמרנדרים מחדש
  }, []);
  
  if (loading) {
    return <div>Loading...</div>;
  }

  // הצגת דיאלוג אישור
  const handleOpenDialog = () => {
    setOpenDialog(true); // פותח את הדיאלוג
  };

  // סגירת הדיאלוג (ביטול או אישור)
  const handleCloseDialog = (confirm) => {
    if (confirm) {
      endSelection();
    }
    setOpenDialog(false); // סוגר את הדיאלוג
  };

  const endSelection = async () => {
    const apiEndSelection = await apiPhotographer.fetchEndSelection(
      client.fullName,
      folderName,
      folderId
    );
    console.log("apiEndSelection", apiEndSelection);
  };

  return (
    <Box sx={{ padding: 4 }}>
      {imagesPath.length > 0 && endFolder === 0 && (
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          סיום בחירה
        </Button>
      )}

      {/* רשת התמונות */}
      <Grid
        container
        spacing={3}
        sx={{ justifyContent: "center", marginTop: 3 }}
      >
        {imagesPath.length > 0 ? (
          imagesPath.map((image, index) => {
            if (!imagesId[index]) return null;
            return (
              <PhotoClient
                key={index}
                image={image}
                index={index}
                imagesName={imagesName}
                imageId={imagesId[index]}
                imageChecked={imagesChecked[index]}
                endFolder={endFolder}
              />
            );
          })
        ) : (
          <Typography variant="body1" color="textSecondary">
            לא נמצאו תמונות בתיקייה זו.
          </Typography>
        )}
      </Grid>

      {/* דיאלוג אישור לסיום בחירה */}
      <Dialog open={openDialog} onClose={() => handleCloseDialog(false)}>
        <DialogTitle>אישור סיום בחירה</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            האם אתה בטוח שברצונך לסיים את הבחירה, הצלם יקבל הודעה על הסיום ולא
            יהיה אפשרות לשנות ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseDialog(false)} color="secondary">
            ביטול
          </Button>
          <Button onClick={() => handleCloseDialog(true)} color="primary">
            אישור
          </Button>
        </DialogActions>
      </Dialog>

      {/* אייקון גלילה למעלה */}
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
    </Box>
  );
}

export default Photos;
