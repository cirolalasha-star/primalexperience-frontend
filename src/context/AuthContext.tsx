// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiGet, apiPost } from "../api/client";

export type User = {
  id: number;
  nombre: string;
  email: string;
  rol: string; // "usuario" | "admin" | "guia" ...
};

// 👇 Añadimos loadingUser además de loading
type AuthContextType = {
  user: User | null;
  loading: boolean;                    // para los layouts que usan `loading`
  loadingUser: boolean;                // para páginas que usan `loadingUser`
  login: (user: User, token?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // estado interno de carga

  // Al montar la app intentamos recuperar al usuario actual
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    apiGet<{ usuario: User }>("/auth/me")
      .then((res) => {
        setUser(res.usuario);
      })
      .catch(() => {
        // Si el token peta, lo limpiamos
        setUser(null);
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (usuario: User, token?: string) => {
    if (token) {
      localStorage.setItem("token", token);
    }
    setUser(usuario);
  };

  const logout = () => {
  // 1) Llamamos al backend para que limpie la cookie (si existe)
  //    No esperamos la respuesta porque no es crítico para el flujo.
  apiPost<{ message: string }>("/auth/logout", {})
    .catch((err) => {
      console.error("Error al hacer logout en backend:", err);
    });

  // 2) Limpiamos el token del frontend y el usuario en memoria
  localStorage.removeItem("token");
  setUser(null);
};


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,           // se puede usar como `loading`
        loadingUser: loading, // o como `loadingUser` en otros componentes
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
