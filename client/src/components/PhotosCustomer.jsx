import React, { useState, useEffect } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
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
import PhotoClient from "./PhotoCustomer";
import apiCustomers from "../services/apiCustomers";
import apiPhotographer from "../services/apiPhotographer";

function Photos() {
  const location = useLocation();
  const folderName = location.state.folderName;
  const client = JSON.parse(localStorage.getItem("userInfo"));
  const folderId = location.state.folderId;
  const endFolder = location.state.endFolder;
  console.log("endFolder", endFolder);
  
  const { setCountAllImages } = useOutletContext();

  const [imagesPath, setImagesPath] = useState([]);
  const [imagesName, setImagesName] = useState([]);
  const [imagesId, setImagesId] = useState([]);
  const [imagesChecked, setImagesChecked] = useState([]);
  const [localEndFolder, setLocalEndFolder] = useState(0);
  console.log("localEndFolder", localEndFolder);

  const [showScrollTop, setShowScrollTop] = useState(false); // משתנה לניהול הצגת האייקון
  const [openDialog, setOpenDialog] = useState(false); // משתנה לניהול פתיחת הדיאלוג
  const [loading, setLoading] = useState(true);
  const [countImages, setCountImages] = useState(0);
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
        setImagesChecked(response.arrChecked); // עדכון הסטייט
        setLoading(false);
        setLocalEndFolder(endFolder);

        // מחשבים את המספר ישירות מהנתונים ששלפת
        const numCount = response.arrChecked.reduce(
          (count, checked) => count + (checked === 1 ? 1 : 0),
          0
        );
        console.log("imagesChecked", response.arrChecked);
        setCountImages(numCount);
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
     setLocalEndFolder(1);
  };

  return (
    <Box sx={{ padding: 4 }}>
      {imagesPath.length > 0 && (
        <>
          {localEndFolder === 0 && <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
          >
            סיום בחירה
          </Button>}
          <Typography
            variant="h6"
            sx={{
              width: "25%",
              fontSize: "18px", // גודל הטקסט
              fontWeight: "bold", // משקל הפונט
              color: "#1976D2", // צבע הכותרת
              display: "flex", // שימוש ב-flexbox למיקום
              alignItems: "center", // מיקום התוכן במרכז
              marginTop: 2, // מרווח עליון
              padding: "10px", // ריפוד מסביב לטקסט
              backgroundColor: "#E3F2FD", // רקע עדין
              borderRadius: "8px", // עיגול הקצוות
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // צל עדין
            }}
          >
            <Typography variant="body1" sx={{ marginRight: 2}}>
              מספר התמונות שנבחרו בתיקייה זו:
            </Typography>

            <Box
              sx={{
                backgroundColor: "#1976D2", // צבע הרקע של העיגול
                color: "white", // צבע הטקסט בתוך העיגול
                padding: "8px 16px", // מרווח פנימי (כדי שהעיגול יהיה יותר גדול)
                borderRadius: "50%", // הפיכת האלמנט לעיגול
                fontSize: "20px", // גודל הטקסט בתוך העיגול
                fontWeight: "bold", // משקל הפונט
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginRight: "10px",
                height: "20px", // גובה העיגול
                width: "10px", // רוחב העיגול
                textAlign: "center", // מיקום הטקסט בתוך העיגול
              }}
            >
              {countImages}
            </Box>
          </Typography>
        </>
      )}
      {/*שם התיקייה*/}
      <Typography variant="h4" align="center" gutterBottom>
        {folderName}
      </Typography>

      {/* רשת התמונות */}
      <Grid
        container
        spacing={3}
        sx={{ justifyContent: "center", marginTop: 3 }}
      >
        {imagesPath.length > 0 && (
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
                endFolder={localEndFolder}
                setCountImages={setCountImages}
                setCountAllImages={setCountAllImages}
              />
            );
          })
        ) }
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
