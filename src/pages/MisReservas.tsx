// src/pages/MisReservas.tsx

/**
 * Página "Mis reservas"
 * ----------------------
 * - Solo accesible para usuarios logueados (usa useAuth).
 * - Llama al backend para obtener las reservas del usuario actual.
 * - Muestra estados de carga, error y lista vacía.
 *
 * IMPORTANTE: ajusta el tipo Reserva y el endpoint "/reservas/mias"
 * para que coincidan con tu API real.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiGet } from "../api/client";
import { useAuth } from "../context/AuthContext";

const gold = "#B8860B";

type Reserva = {
  // 👇 Ajusta estos campos a lo que devuelva tu backend
  id: number;
  tourTitulo: string;
  fecha: string;          // ISO string o "2025-09-12"
  nPersonas: number;
  estado: string;         // "pendiente" | "confirmada" | "cancelada" ...
  precioTotal: number;    // en euros
};

export default function MisReservas() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1️⃣ Si aún estamos comprobando /auth/me → pantalla de carga genérica
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-white">
        <p>Cargando tu sesión...</p>
      </div>
    );
  }

  // 2️⃣ Si no hay usuario → forzamos ir a login
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-white">
        <h1 className="text-2xl font-bold mb-4">Debes iniciar sesión</h1>
        <p className="mb-4">
          Inicia sesión para ver tus reservas y gestionar tus experiencias.
        </p>
        <button
          onClick={() => navigate("/login?redirect=/mis-reservas")}
          className="px-4 py-2 rounded-full text-sm font-semibold"
          style={{ backgroundColor: gold }}
        >
          Ir a iniciar sesión
        </button>
      </div>
    );
  }

  // 3️⃣ Cargar reservas del usuario logueado
  useEffect(() => {
    let cancelled = false;

    async function cargarReservas() {
      try {
        setError(null);
        setLoadingReservas(true);

        /**
         * 🔥 Endpoint de ejemplo:
         *    GET /api/reservas/mias
         *
         * apiGet ya añade automáticamente:
         *   - BASE_URL (VITE_API_URL)
         *   - Authorization: Bearer <token> si existe en localStorage
         *
         * Ajusta el tipo <Reserva[]> y la URL al formato real de tu backend.
         */
        const data = await apiGet<Reserva[]>("/reservas/mias");

        if (!cancelled) {
          setReservas(data);
        }
      } catch (err) {
        console.error("Error cargando reservas:", err);
        if (!cancelled) {
          setError("No se han podido cargar tus reservas. Inténtalo más tarde.");
        }
      } finally {
        if (!cancelled) {
          setLoadingReservas(false);
        }
      }
    }

    cargarReservas();

    // Cleanup por si se desmonta el componente en mitad de la petición
    return () => {
      cancelled = true;
    };
  }, []); // 👈 se ejecuta solo al montar la página

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-2">Mis reservas</h1>
      <p className="text-sm text-gray-300 mb-6">
        Aquí verás tus próximas experiencias, el estado de cada reserva y el
        número de personas.
      </p>

      {/* Estado de carga de las reservas */}
      {loadingReservas && (
        <p className="text-sm text-gray-300">Cargando tus reservas...</p>
      )}

      {/* Error al cargar reservas */}
      {error && !loadingReservas && (
        <p className="text-sm text-red-400 mb-4">{error}</p>
      )}

      {/* Lista vacía */}
      {!loadingReservas && !error && reservas.length === 0 && (
        <div className="border border-[#222] rounded-2xl p-6 bg-[#050505]">
          <p className="text-sm mb-2">Todavía no tienes ninguna reserva.</p>
          <button
            onClick={() => navigate("/experiencias")}
            className="mt-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ backgroundColor: gold }}
          >
            Explorar experiencias
          </button>
        </div>
      )}

      {/* Lista de reservas */}
      {!loadingReservas && !error && reservas.length > 0 && (
        <div className="space-y-4">
          {reservas.map((reserva) => (
            <div
              key={reserva.id}
              className="border border-[#222] rounded-2xl p-4 bg-[#050505] flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <p className="text-xs uppercase text-gray-400 mb-1">
                  Experiencia
                </p>
                <p className="text-lg font-semibold">{reserva.tourTitulo}</p>

                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-300">
                  <div>
                    <span className="block text-[11px] uppercase text-gray-500">
                      Fecha
                    </span>
                    <span>{new Date(reserva.fecha).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase text-gray-500">
                      Personas
                    </span>
                    <span>{reserva.nPersonas}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase text-gray-500">
                      Estado
                    </span>
                    <span className="capitalize">{reserva.estado}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase text-gray-500">
                      Importe
                    </span>
                    <span>{reserva.precioTotal.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              {/* Botón para ir a detalle (cuando lo tengas) */}
              <div className="md:text-right">
                <button
                  className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: gold }}
                  // TODO: cuando tengas ruta tipo /experiencias/:id o :slug
                  // onClick={() => navigate(`/experiencias/${reserva.id}`)}
                  onClick={() => navigate("/experiencias")}
                >
                  Ver experiencia
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
