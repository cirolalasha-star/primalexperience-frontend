// src/context/AuthContext.tsx
import { createContext, useState, useEffect, useContext } from "react";
import { apiGet } from "../api/client";

// -------------------------
// Tipos fuertes (TypeScript)
// -------------------------
export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (usuario: User) => void;
  logout: () => void;
}

// 🟦 Contexto tipado correctamente
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🟡 Recuperar sesión al cargar la app
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    apiGet<{ usuario: User }>("/auth/me")
      .then((data) => setUser(data.usuario))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = (usuario: User) => setUser(usuario);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook que ya no puede devolver null
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>")
  }
  return ctx;
}