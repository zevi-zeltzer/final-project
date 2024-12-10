import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PhotographerHome from "./components/PhotographerHome.jsx";
import Register from "./components/Register.jsx";
import ClientGallery from "./components/ClientGallery.jsx";
import PhotosPhotographer from "./components/PhotosPhotographer.jsx";
import Login from "./components/Login.jsx";
import CustomerHome from "./components/CustomerHome.jsx";
import ProtectedPages from "./components/ProtectedPages.jsx";
import Profile from "./components/Profile.jsx";
import Clients from "./components/Clients.jsx";
import PhotosClient from "./components/PhotosClient.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Navigate to="/login" />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/register" element={<Register />} />
        <Route element={<ProtectedPages />}>
          <Route exact path="/photographer/home" element={<PhotographerHome />}>
            <Route
              exact
              path="/photographer/home/clients"
              element={<Clients />}
            />

            <Route
              exact
              path="/photographer/home/clients/:id/gallery"
              element={<ClientGallery />}
            />

            <Route
              exact
              path="/photographer/home/clients/:id/gallery/folder/:folderId/images"
              element={<PhotosPhotographer />}
            />
          </Route>
          <Route
            exact
            path="/customer/home/:fullName"
            element={<CustomerHome />}
          >
            <Route
              exact
              path="/customer/home/:fullName/folder/:folderId/images"
              element={<PhotosClient />}
            />
            <Route
              exact
              path="/customer/home/:fullName/profile"
              element={<Profile />}
            />
          </Route>
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
