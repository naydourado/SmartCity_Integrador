import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/admin";
import Sensores from "./pages/sensores";
import SensoresTipo from "./pages/sensoresTipo";
import Historicos from "./pages/historicos";
import HistoricosRecentes from "./pages/historicosRecentes";
import Microcontroladores from "./pages/microcontroladores";
import Ambientes from "./pages/ambientes";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin/home"
        element={
          <RoleRoute allow={["admin", "Administrador"]}>
            <Dashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/user/home"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sensores"
        element={
          <ProtectedRoute>
            <Sensores />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sensores/:tipo"
        element={
          <ProtectedRoute>
            <SensoresTipo />
          </ProtectedRoute>
        }
      />

      <Route
        path="/historicos"
        element={
          <ProtectedRoute>
            <Historicos />
          </ProtectedRoute>
        }
      />

      <Route
        path="/historicos-recentes"
        element={
          <ProtectedRoute>
            <HistoricosRecentes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ambientes"
        element={
          <ProtectedRoute>
            <Ambientes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/microcontroladores"
        element={
          <ProtectedRoute>
            <Microcontroladores />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
