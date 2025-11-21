// src/pages/MiCuenta.tsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const gold = "#B8860B";

export default function MiCuenta() {
  const { user, loadingUser } = useAuth();
  const navigate = useNavigate();

  // Mientras estamos comprobando /auth/me
  if (loadingUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-white">
        <p>Cargando tus datos...</p>
      </div>
    );
  }

  // Si no hay usuario -> forzamos login
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-white">
        <h1 className="text-2xl font-bold mb-4">Debes iniciar sesión</h1>
        <p className="mb-4">
          No hemos encontrado una sesión activa. Inicia sesión para ver tus
          datos y reservas.
        </p>
        <button
          onClick={() => navigate("/login?redirect=/mi-cuenta")}
          className="px-4 py-2 rounded-full text-sm font-semibold"
          style={{ backgroundColor: gold }}
        >
          Ir a iniciar sesión
        </button>
      </div>
    );
  }

  // Si hay usuario -> mostramos sus datos
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Mi cuenta</h1>

      <div className="bg-[#050505] border border-[#222] rounded-2xl p-6 space-y-4">
        <div>
          <p className="text-xs uppercase text-gray-400 mb-1">Nombre</p>
          <p className="text-lg font-semibold">{user.nombre}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-400 mb-1">Email</p>
          <p className="text-lg">{user.email}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-400 mb-1">Rol</p>
          <p className="text-lg capitalize">{user.rol}</p>
        </div>
      </div>

      <p className="text-xs text-gray-300 mt-6">
        Próximamente aquí podrás ver tus reservas, facturas y preferencias.
      </p>

      <p className="text-xs text-gray-300 mt-2">
        <Link to="/" className="underline underline-offset-4">
          Volver a la página principal
        </Link>
      </p>
    </div>
  );
}
