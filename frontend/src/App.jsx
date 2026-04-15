import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Eventos from "./pages/Eventos";
import EventoDetalhe from "./pages/EventoDetalhe";
import MinhasInscricoes from "./pages/MinhasInscricoes";
import Perfil from "./pages/Perfil";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import MyEvents from "./pages/MyEvents";
import EventRegistrations from "./pages/EventRegistrations";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageEvents from "./pages/admin/ManageEvents";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageCategories from "./pages/admin/ManageCategories";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route
            path="/eventos/novo"
            element={
              <ProtectedRoute allowedRoles={["ORGANIZER", "ADMIN"]}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route path="/eventos/:id" element={<EventoDetalhe />} />
          <Route
            path="/eventos/:id/editar"
            element={
              <ProtectedRoute allowedRoles={["ORGANIZER", "ADMIN"]}>
                <EditEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventos/:id/inscricoes"
            element={
              <ProtectedRoute allowedRoles={["ORGANIZER", "ADMIN"]}>
                <EventRegistrations />
              </ProtectedRoute>
            }
          />
          <Route path="/minhas-inscricoes" element={<MinhasInscricoes />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route
            path="/meus-eventos"
            element={
              <ProtectedRoute allowedRoles={["ORGANIZER", "ADMIN"]}>
                <MyEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/eventos"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ManageEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categorias"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ManageCategories />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
