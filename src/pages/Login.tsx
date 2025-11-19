// src/pages/Login.tsx
// 👇 FormEvent se importa como *type*
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiPost } from "../api/client";
import { useAuth, type User } from "../context/AuthContext";


const gold = "#B8860B";
const dark = "#020202";

interface AuthResponse {
  token: string;
  usuario: User;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || "/mi-cuenta";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiPost<AuthResponse>("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      login(data.usuario);

      navigate(redirectTo);
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas o error en el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10 text-white">
      <h1 className="text-2xl font-bold mb-2">Iniciar sesión</h1>
      <p className="text-sm text-gray-300 mb-6">
        Accede a tus reservas y datos personales.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-[#050505] border border-[#222] rounded-2xl p-4 space-y-4"
      >
        <div>
          <label className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg px-3 py-2 bg-black/70 border border-gray-600 text-sm focus:outline-none focus:border-gray-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg px-3 py-2 bg-black/70 border border-gray-600 text-sm focus:outline-none focus:border-gray-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-full text-sm font-semibold mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: gold, color: dark }}
        >
          {loading ? "Accediendo..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="text-xs text-gray-300 mt-4">
        ¿Aún no tienes cuenta?{" "}
        <Link to="/registro" className="underline underline-offset-4">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
