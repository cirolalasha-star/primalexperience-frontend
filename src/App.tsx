// src/App.tsx

// 🔹 Solo necesitamos BrowserRouter aquí
import { BrowserRouter } from "react-router-dom";

// 🔹 Nuestro router con todas las rutas (Home, experiencias, admin, etc.)
import AppRouter from "./router/AppRouter";

// 🔹 Contexto de autenticación (user, loading, login, logout)
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    // Envuelve toda la SPA con el router de React
    <BrowserRouter>
      {/* 
        AuthProvider hace accesible la info de sesión (user, rol, loading)
        a cualquier componente que use useAuth() o useContext(AuthContext).
      */}
      <AuthProvider>
        {/* 
          AppRouter se encarga de:
          - Rutas públicas (/ , /experiencias, /blog…)
          - Área de usuario (/mi-cuenta, /mis-reservas…)
          - Panel guía (/guia/...)
          - Panel admin (/admin/...)
          con sus layouts correspondientes.
        */}
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
