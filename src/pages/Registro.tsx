// src/pages/Registro.tsx
// 👇 FormEvent se importa como *type* (solo tipo)
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiPost } from "../api/client";
import { useAuth, type User } from "../context/AuthContext";

const gold = "#B8860B";
const dark = "#020202";

interface AuthResponse {
  token: string;
  usuario: User;
}

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // ⬇️ Manejador del submit con errores “bonitos”
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Evitamos recarga del navegador
    e.preventDefault();

    // Limpiamos error anterior
    setError(null);

    // Validación básica en cliente
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      // Marcamos estado de carga
      setLoading(true);

      // Llamada al backend -> POST /auth/registro
      const data = await apiPost<AuthResponse>("/auth/registro", {
        nombre,
        email,
        password,
      });

      // Guardamos token y usuario en el contexto
      localStorage.setItem("token", data.token);
      login(data.usuario);

      // Redirigimos al área privada
      navigate("/mi-cuenta");
    } catch (err: unknown) {
      console.error("Error en registro:", err);

      // Si apiPost lanzó un Error con mensaje del backend, lo mostramos
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido al crear la cuenta.");
      }
    } finally {
      // Quitamos el estado de carga siempre
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 text-white">
      <h1 className="text-2xl font-bold mb-2">Crear cuenta</h1>
      <p className="text-sm text-gray-300 mb-6">
        Regístrate para gestionar tus reservas y recibir avisos personalizados.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-[#050505] border border-[#222] rounded-2xl p-4 space-y-4"
      >
        <div>
          <label className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">
            Nombre
          </label>
          <input
            type="text"
            required
            className="w-full rounded-lg px-3 py-2 bg-black/70 border border-gray-600 text-sm focus:outline-none focus:border-gray-300"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

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
            autoComplete="new-password"
            className="w-full rounded-lg px-3 py-2 bg-black/70 border border-gray-600 text-sm focus:outline-none focus:border-gray-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">
            Repite la contraseña
          </label>
          <input
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-lg px-3 py-2 bg-black/70 border border-gray-600 text-sm focus:outline-none focus:border-gray-300"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-full text-sm font-semibold mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: gold, color: dark }}
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>
      </form>

      <p className="text-xs text-gray-300 mt-4">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="underline underline-offset-4">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
