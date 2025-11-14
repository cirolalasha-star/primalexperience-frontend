import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Tours from "./pages/Tours";
import Usuarios from "./pages/Usuarios";
import Reservas from "./pages/Reservas";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/tours">Tours</Link> |{" "}
        <Link to="/usuarios">Usuarios</Link> |{" "}
        <Link to="/reservas">Reservas</Link> |{" "}
        <Link to="/login">Login</Link> |{" "}
        <Link to="/logout">Logout</Link>
      </nav>

      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

        {/* Protegidas */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <Usuarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservas"
          element={
            <ProtectedRoute>
              <Reservas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tours"
          element={
            <ProtectedRoute>
              <Tours />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * ·Cuando el usuario haga login -> se guarda token en localStorage
 * ·Cuando pulse "Cerrar sesión" -> se elimina el token y se redirige automáticamente al login
 * ·Gracias a tu client.ts, cualquier petición sin token ahora devolverá 401, impidiendo acceso a rutas protegidas
 * ·Si el usuario intenta entrar a /reservas, /usuarios o /tours sin haber hecho login → lo redirige automáticamente a /login
 * ·Si ya tiene el token → puede acceder sin problema.
 */