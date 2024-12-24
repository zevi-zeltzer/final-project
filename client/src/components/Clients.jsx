import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";
import Profile from "./Profile";
import apiPhotographer from "../services/apiPhotographer";

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addClient, setAddClient] = useState(false); // State עבור הצגת טופס הוספת הלקוח
  const [selectedClient, setSelectedClient] = useState(null); // לשמור את הלקוח שנבחר
  const [searchTerm, setSearchTerm] = useState(""); // State עבור מילות חיפוש
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // דיאלוג מחיקה
  const [clientToDelete, setClientToDelete] = useState(null); // הלקוח למחיקה
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" }); // עבור התראות
  const inputEmailRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await apiPhotographer.fetchGetCustomers();
        console.log(data);
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // פונקציה לסינון הלקוחות לפי מילת החיפוש
  let filteredClients = [];
  if (clients && Array.isArray(clients)) {
    filteredClients = clients.filter((client) =>
      client.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const ViewGallery = (client) => {
    navigate(`/photographer/home/clients/${client.id}/gallery`, {
      state: { client },
    });
  };

  const sendEmail = async () => {
    const email = inputEmailRef.current.value;
    try {
      const data = await apiPhotographer.fetchSendEmail(email);
      console.log(data);
      if (data.success) {
        setSnackbar({ open: true, message: "האימייל נשלח בהצלחה", severity: "success" });
        setAddClient(false);
      } else {
        setSnackbar({ open: true, message: "שגיאה בשליחת האימייל", severity: "error" });
        throw new Error("שגיאה בשליחת האימייל");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const clientProfile = (client) => {
    setSelectedClient(client); // שומר את הלקוח שנבחר
  };

  const closeProfile = () => {
    setSelectedClient(null); // סגירת פרופיל הלקוח
  };

  const openDeleteClientDialog = (client) => {
    setClientToDelete(client);
    setOpenDeleteDialog(true);
  };

  const handleDeleteClient = async () => {
    try {
      const data = await apiPhotographer.fetchDeleteCustomer(clientToDelete.id); // קריאה ל-API למחיקת הלקוח
      console.log(data);

      setClients(clients.filter((c) => c.id !== clientToDelete.id)); // עדכון הלקוחות
      setOpenDeleteDialog(false);
      setClientToDelete(null);
      setSnackbar({ open: true, message: "הלקוח נמחק בהצלחה.", severity: "success" });
    } catch (error) {
      console.error("Error deleting client:", error);
      setSnackbar({ open: true, message: "שגיאה במחיקת הלקוח", severity: "error" });
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      {/* Snackbar להודעות */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* שורת חיפוש */}
      {clients && clients.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <TextField
            label="חפש לקוח"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // עדכון ה-state לפי מה שהמשתמש כותב
          />
        </Box>
      )}
      {/* כפתור פלוס */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 3 }}>
        <IconButton
          color="primary"
          onClick={() => setAddClient(!addClient)}
          sx={{
            fontSize: 30,
            backgroundColor: "#42a5f5", // צבע תכלת
            color: "#fff",
            "&:hover": {
              backgroundColor: "#039be5", // צבע כהה יותר בהובר
            },
            boxShadow: 3,
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* רקע מעומעם כאשר טופס ההוספה פתוח */}
      {addClient && (
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
          <Paper
            sx={{
              padding: 3,
              width: "400px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
            elevation={6}
          >
            <Typography variant="h6" gutterBottom>
              הוסף לקוח חדש
            </Typography>
            <TextField
              label="כתובת אימייל"
              variant="outlined"
              type="email"
              inputRef={inputEmailRef}
              fullWidth
            />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button variant="contained" color="primary" onClick={sendEmail}>
                שלח
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setAddClient(false)}
              >
                סגור
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* דיאלוג מחיקה */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>מחיקת לקוח</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את {clientToDelete?.fullName}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="secondary">
            ביטול
          </Button>
          <Button onClick={handleDeleteClient} color="error">
            מחק
          </Button>
        </DialogActions>
      </Dialog>

      {selectedClient && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Profile client={selectedClient} closeProfile={closeProfile} role="customer" />
        </Box>
      )}

      {/* הצגת הלקוחות */}
      <Grid container spacing={3}>
        {clients &&
          clients.length > 0 &&
          filteredClients &&
          filteredClients.map((client) => (
            <Grid item xs={12} sm={6} md={4} key={client.id}>
              <Card
                sx={{
                  cursor: "pointer",
                  "&:hover": { boxShadow: 6 },
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ textAlign: "center" }}
                  >
                    {client.fullName}
                  </Typography>

                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ margin: 1 }}
                    onClick={() => ViewGallery(client)}
                  >
                    צפה בגלרייה
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{ margin: 1 }}
                    onClick={() => clientProfile(client)}
                  >
                    פרטי הלקוח
                  </Button>
                  <Button
                    onClick={() => openDeleteClientDialog(client)}
                    color="error"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
}

export default Clients;
