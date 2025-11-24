// src/pages/MisReservas.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/client";
import { useAuth } from "../context/AuthContext";

const gold = "#B8860B";

interface Reserva {
  id: number;
  estado: string;
  numero_personas: number;
  fecha_reserva: string | null;
  fecha_salida: string | null;
  tour: {
    id: number;
    titulo: string;
    ubicacion: string | null;
    imagen_url: string | null;
  } | null;
}

export default function MisReservas() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Si no hay usuario logueado, invitamos a iniciar sesión
  useEffect(() => {
    if (!user) return;
    async function fetchReservas() {
      try {
        setLoading(true);
        setError(null);

        // GET /api/reservas/mias
        const apiReservas = await apiGet<any[]>("/reservas/mias");

        // Adaptamos la respuesta de la API a nuestro tipo Reserva
        // Adaptamos la respuesta de la API a nuestro tipo Reserva
const parsed: Reserva[] = apiReservas.map((r) => {
  // En tu JSON: r.salidas_programadas.tours
  const salida = r.salidas_programadas || null;
  const tour = salida?.tours || null;

  return {
    id: r.id,
    estado: r.estado ?? "pendiente",
    numero_personas: r.numero_personas ?? 1,
    // en el JSON, la fecha de creación viene como r.fecha
    fecha_reserva: r.fecha || null,
    // fecha de salida: salidas_programadas.fecha_inicio
    fecha_salida: salida?.fecha_inicio || null,
    tour: tour
      ? {
          id: tour.id,
          titulo: tour.titulo ?? "Experiencia",
          ubicacion: tour.ubicacion ?? null,
          imagen_url: tour.imagen_url ?? null,
        }
      : null,
  };
});


        setReservas(parsed);
      } catch (err) {
        console.error("Error cargando mis reservas:", err);
        setError(
          "No se han podido cargar tus reservas. Inténtalo de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchReservas();
  }, [user]);

  const formatFecha = (iso: string | null) => {
    if (!iso) return "Pendiente de concretar";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Fecha no disponible";
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatEstado = (estado: string) => {
    switch (estado) {
      case "confirmada":
        return "Confirmada";
      case "cancelada":
        return "Cancelada";
      default:
        return "Pendiente de confirmar";
    }
  };

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-sm text-gray-200">
        <p className="mb-3">
          Debes iniciar sesión para ver tus reservas.
        </p>
        <button
          onClick={() => navigate("/login?redirect=/mis-reservas")}
          className="px-5 py-2 rounded-full text-sm font-semibold"
          style={{ backgroundColor: gold, color: "#000" }}
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-sm text-gray-300">
        Cargando tus reservas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (reservas.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-sm text-gray-200">
        <h1 className="text-xl font-semibold mb-3">Mis reservas</h1>
        <p className="mb-4">
          Todavía no tienes ninguna reserva. Cuando solicites una experiencia,
          aparecerá aquí.
        </p>
        <button
          onClick={() => navigate("/experiencias")}
          className="px-5 py-2 rounded-full text-sm font-semibold"
          style={{ backgroundColor: gold, color: "#000" }}
        >
          Explorar experiencias
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-white">
      <h1 className="text-xl md:text-2xl font-semibold mb-4">
        Mis reservas
      </h1>

      <div className="space-y-4">
        {reservas.map((r) => {
          const tour = r.tour;
          return (
            <article
              key={r.id}
              className="rounded-2xl border border-[#222] bg-[#050505] p-3 flex gap-3"
            >
              <div className="w-28 h-24 rounded-xl overflow-hidden bg-black flex-shrink-0">
                {tour?.imagen_url ? (
                  <img
                    src={tour.imagen_url}
                    alt={tour.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-500">
                    Sin foto
                  </div>
                )}
              </div>

              <div className="flex-1 text-sm">
                <div className="flex justify-between gap-2 mb-1">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                      {tour?.ubicacion || "Experiencia"}
                    </p>
                    <h2 className="font-semibold text-base">
                      {tour?.titulo || "Experiencia sin título"}
                    </h2>
                  </div>
                  <div className="text-right text-xs">
                    <span
                      className="px-2 py-1 rounded-full border text-[11px]"
                      style={{
                        borderColor:
                          r.estado === "confirmada" ? gold : "#444",
                        color:
                          r.estado === "confirmada" ? gold : "#ccc",
                      }}
                    >
                      {formatEstado(r.estado)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 mb-1">
                  <p>
                    <span className="text-gray-400">Fecha salida: </span>
                    {formatFecha(r.fecha_salida)}
                  </p>
                  <p>
                    <span className="text-gray-400">Personas: </span>
                    {r.numero_personas}
                  </p>
                  <p>
                    <span className="text-gray-400">
                      Fecha de solicitud:{" "}
                    </span>
                    {formatFecha(r.fecha_reserva)}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <button
                    className="text-[11px] underline underline-offset-4 text-gray-300"
                    onClick={() =>
                      tour && navigate(`/experiencias/${tour.id}`)
                    }
                  >
                    Ver experiencia
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
