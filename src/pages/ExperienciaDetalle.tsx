// src/pages/ExperienciaDetalle.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPost } from "../api/client";
import { useAuth } from "../context/AuthContext";

const gold = "#B8860B";

interface SalidaProgramada {
  id: number;
  fecha_inicio: string; // ISO que viene del backend
  plazas_disponibles: number;
  plazas_totales: number;
}


interface Resena {
  id: number;
  usuario_nombre: string;
  comentario: string;
  puntuacion: number;
  creado_en: string;
}

interface TourDetalle {
  id: number;
  titulo: string;
  descripcion: string | null;
  ubicacion: string | null;
  latitud: number | string | null;
  longitud: number | string | null;
  duracion_dias: number | null;
  precio_base: number | string | null;
  dificultad: string | null;
  cupo_maximo: number | null;
  imagen_url: string | null;
  salidas_programadas?: SalidaProgramada[];
  resenas?: Resena[];
}

export default function ExperienciaDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tour, setTour] = useState<TourDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔽 Estados para reserva
  const [salidaSeleccionada, setSalidaSeleccionada] = useState<number | null>(
    null
  );
  const [numeroPersonas, setNumeroPersonas] = useState<number>(1);
  const [notas, setNotas] = useState("");
  const [reservaLoading, setReservaLoading] = useState(false);
  const [reservaError, setReservaError] = useState<string | null>(null);

  useEffect(() => {
  if (!id) return;

  async function fetchTour() {
    try {
      setLoading(true);
      setError(null);

      const data = await apiGet<TourDetalle>(`/tours/${id}`);
      setTour(data);
    } catch (err) {
      console.error(err);
      setError("No se ha podido cargar esta experiencia.");
    } finally {
      setLoading(false);
    }
  }

  fetchTour();
}, [id]);


  // 🟡 Enviar solicitud de reserva
  const handleReservaClick = async () => {
    if (!tour) return;

    // Si no hay sesión, redirigimos a login con redirect
    if (!user) {
      navigate(`/login?redirect=/experiencias/${tour.id}`);
      return;
    }

    // Validaciones básicas
    if (!salidaSeleccionada) {
      setReservaError("Selecciona una fecha antes de reservar.");
      return;
    }

    if (numeroPersonas <= 0) {
      setReservaError("Introduce un número de personas válido.");
      return;
    }

    try {
      setReservaLoading(true);
      setReservaError(null);

      // 🔥 Llamada real al backend → POST /api/reservas
      await apiPost("/reservas", {
        tour_id: tour.id,
        salida_programada_id: salidaSeleccionada,
        numero_personas: numeroPersonas,
        notas: notas.trim() || undefined,
      });

      // Si todo OK → ir a Mis reservas
      navigate("/mis-reservas");
    } catch (err) {
      console.error("Error al crear la reserva:", err);
      setReservaError(
        err instanceof Error
          ? err.message
          : "No se ha podido crear la reserva. Inténtalo de nuevo."
      );
    } finally {
      setReservaLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-sm text-gray-300">
        Cargando experiencia...
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-sm text-red-400">
        {error || "No se ha encontrado esta experiencia."}
      </div>
    );
  }

  const precio =
    tour.precio_base !== null && tour.precio_base !== undefined
      ? Number(tour.precio_base)
      : null;

  const lat =
    tour.latitud !== null && tour.latitud !== undefined
      ? Number(tour.latitud)
      : null;

  const lng =
    tour.longitud !== null && tour.longitud !== undefined
      ? Number(tour.longitud)
      : null;

  const salidas = tour.salidas_programadas ?? [];
  const resenas = tour.resenas ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      {/* HEADER */}
      <section className="mb-6">
        <button
          className="text-xs text-gray-300 mb-3 underline underline-offset-4"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">
              Experiencia · {tour.ubicacion || "Ubicación por confirmar"}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {tour.titulo}
            </h1>
            <div className="flex flex-wrap gap-2 text-[11px] text-gray-200">
              {tour.dificultad && (
                <span className="px-2 py-1 rounded-full bg-[#111] border border-[#333]">
                  Dificultad: {tour.dificultad}
                </span>
              )}
              {tour.duracion_dias && (
                <span className="px-2 py-1 rounded-full bg-[#111] border border-[#333]">
                  {tour.duracion_dias} día
                  {tour.duracion_dias > 1 ? "s" : ""}
                </span>
              )}
              {tour.cupo_maximo && (
                <span className="px-2 py-1 rounded-full bg-[#111] border border-[#333]">
                  Grupo máx. {tour.cupo_maximo} personas
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            {precio !== null && (
              <p className="text-sm text-gray-300">
                Desde{" "}
                <span className="text-xl font-semibold" style={{ color: gold }}>
                  {precio.toFixed(0)} €
                </span>{" "}
                por persona
              </p>
            )}
            <button
              onClick={handleReservaClick}
              disabled={reservaLoading}
              className="mt-2 px-6 py-2 rounded-full text-sm font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: gold, color: "#000" }}
            >
              {reservaLoading ? "Enviando solicitud..." : "Solicitar reserva"}
            </button>
            <p className="text-[11px] text-gray-400 mt-1">
              No se realiza ningún pago online. Confirmamos por contacto
              directo.
            </p>
          </div>
        </div>
      </section>

      {/* GALERÍA + MAPA */}
      <section className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="md:col-span-2 rounded-2xl overflow-hidden bg-[#111] border border-[#222] h-64 md:h-80">
          {tour.imagen_url ? (
            <img
              src={tour.imagen_url}
              alt={tour.titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
              Foto principal pendiente
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-[#050505] border border-[#222] p-4 text-sm">
          <h2 className="text-base font-semibold mb-2">Mapa aproximado</h2>
          {lat !== null && lng !== null ? (
            <div className="w-full h-40 rounded-lg overflow-hidden bg-[#111] flex items-center justify-center text-xs text-gray-300">
              <p>
                Coordenadas: {lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
            </div>
          ) : (
            <div className="w-full h-40 rounded-lg bg-[#111] flex items-center justify-center text-xs text-gray-500">
              Coordenadas pendientes
            </div>
          )}
          <p className="text-[11px] text-gray-400 mt-2">
            Mostramos una zona aproximada para proteger la tranquilidad de la
            fauna y evitar masificación.
          </p>
        </div>
      </section>

      {/* DESCRIPCIÓN + INFO RÁPIDA */}
      <section className="grid gap-8 md:grid-cols-3 mb-10">
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-2">Descripción</h2>
          <p className="text-sm text-gray-200 whitespace-pre-line">
            {tour.descripcion || "Descripción pendiente de completar."}
          </p>
        </div>

        <div className="bg-[#050505] border border-[#222] rounded-2xl p-4 text-sm">
          <h3 className="text-base font-semibold mb-2">
            Información esencial
          </h3>
          <ul className="space-y-1 text-gray-200 text-sm">
            {tour.duracion_dias && (
              <li>• Duración: {tour.duracion_dias} día(s)</li>
            )}
            {tour.dificultad && <li>• Dificultad: {tour.dificultad}</li>}
            {tour.cupo_maximo && (
              <li>• Grupo máximo: {tour.cupo_maximo} personas</li>
            )}
            {tour.ubicacion && <li>• Zona principal: {tour.ubicacion}</li>}
            <li>• Idioma: Español (otros idiomas próximamente)</li>
          </ul>
        </div>
      </section>

      {/* CALENDARIO / SALIDAS PROGRAMADAS */}
      <section id="calendario" className="mb-10">
        <h2 className="text-lg font-semibold mb-3">
          Fechas disponibles y plazas
        </h2>

        {salidas.length === 0 ? (
          <p className="text-sm text-gray-300">
            Aún no hay salidas programadas visibles. Si te interesa esta
            experiencia, contáctanos y te avisamos de las próximas fechas.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {salidas.map((s) => {
                const fecha = new Date(s.fecha_inicio);
                const plazasLibres = s.plazas_disponibles;

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSalidaSeleccionada(s.id)}
                    className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg border text-sm ${
                      salidaSeleccionada === s.id
                        ? "border-[#B8860B] bg-[#1a1305]"
                        : "border-[#333] bg-[#050505]"
                    }`}
                  >
                    <div>
                      <p className="font-medium">
                        {fecha.toLocaleDateString("es-ES", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        ·{" "}
                        {fecha.toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-gray-300">
                        Salida programada con guía experto
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p>
                        Plazas libres:{" "}
                        <span className="font-semibold">{plazasLibres}</span>
                      </p>
                      {tour.cupo_maximo && (
                        <p className="text-[11px] text-gray-400">
                          Cupo máx. {tour.cupo_maximo}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Formulario mini: nº personas + notas */}
            <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm text-gray-200">
              <div>
                <label className="block text-[11px] uppercase text-gray-400 mb-1">
                  Número de personas
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg px-3 py-2 bg-black/70 border border-gray-600 text-sm focus:outline-none focus:border-gray-300"
                  value={numeroPersonas}
                  onChange={(e) => setNumeroPersonas(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-gray-400 mb-1">
                  Notas opcionales (alergias, nivel, dudas…)
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 bg-black/70 border border-gray-600 text-sm focus:outline-none focus:border-gray-300 resize-none"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                />
              </div>
            </div>

            {salidaSeleccionada && (
              <div className="mt-3 text-xs text-gray-300">
                Has seleccionado una fecha. Al solicitar la reserva confirmaremos tu
                plaza por email o WhatsApp.
              </div>
            )}

            {reservaError && (
              <p className="mt-3 text-sm text-red-400">{reservaError}</p>
            )}
          </>
        )}
      </section>

      {/* IMPACTO POSITIVO */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">
          Impacto positivo de esta experiencia
        </h2>
        <p className="text-sm text-gray-200 mb-2">
          Parte de los beneficios de esta salida se destinan a proyectos de
          conservación en la zona donde se realiza la actividad.
        </p>
        <ul className="text-sm text-gray-200 space-y-1">
          <li>• Apoyo a proyectos de seguimiento de fauna y hábitats.</li>
          <li>• Colaboración con guías locales y economía de la zona.</li>
          <li>• Grupos reducidos para minimizar el impacto sobre el entorno.</li>
        </ul>
      </section>

      {/* RESEÑAS */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Reseñas de viajeros</h2>

        {resenas.length === 0 ? (
          <p className="text-sm text-gray-300">
            Todavía no hay reseñas para esta experiencia. ¡Puedes ser de los
            primeros en vivirla!
          </p>
        ) : (
          <div className="space-y-3">
            {resenas.map((r) => (
              <article
                key={r.id}
                className="bg-[#050505] border border-[#222] rounded-2xl p-3 text-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm">
                    {r.usuario_nombre || "Viajero"}
                  </p>
                  <p className="text-xs text-yellow-400">
                    {"★".repeat(r.puntuacion)}{" "}
                    <span className="text-gray-400">
                      ({r.puntuacion.toFixed(1)})
                    </span>
                  </p>
                </div>
                <p className="text-xs text-gray-300 mb-1 whitespace-pre-line">
                  {r.comentario}
                </p>
                <p className="text-[10px] text-gray-500">
                  {new Date(r.creado_en).toLocaleDateString("es-ES")}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
