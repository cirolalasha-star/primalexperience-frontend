// src/pages/Experiencias.tsx
/** 
 * ·GET /tours al backend
 * ·Aplica filtros de destino, nivel físico, precio máximo en el frontend
 * ·Respeta los parámetros que se envían desde la Home (destino, nivel) para precargar filtros
 * ·Cada tarjeta lleva a /experiencias/:id (la ficha)
 **/
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet } from "../api/client";

const gold = "#B8860B";

interface TourItem {
  id: number;
  titulo: string;
  descripcion: string | null;
  ubicacion: string | null;
  duracion_dias: number | null;
  dificultad: string | null;
  precio_base: number | string | null;
  imagen_url: string | null;
}

export default function Experiencias() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tours, setTours] = useState<TourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fDestino, setFDestino] = useState(
    searchParams.get("destino") ?? ""
  );
  const [fDificultad, setFDificultad] = useState(
    searchParams.get("nivel") ?? ""
  );
  const [fPrecioMax, setFPrecioMax] = useState<string>("");

  useEffect(() => {
    async function fetchTours() {
      try {
        setLoading(true);
        setError(null);

        const data = await apiGet<TourItem[]>("/tours");
        setTours(data);
      } catch (err) {
        console.error(err);
        setError("No se han podido cargar las experiencias.");
      } finally {
        setLoading(false);
      }
    }

    fetchTours();
  }, []);

  const toursFiltrados = useMemo(() => {
    return tours.filter((t) => {
      if (fDestino) {
        const d = fDestino.toLowerCase();
        const ubic = (t.ubicacion ?? "").toLowerCase();
        if (!ubic.includes(d)) return false;
      }

      if (fDificultad) {
        if ((t.dificultad ?? "").toLowerCase() !== fDificultad.toLowerCase()) {
          return false;
        }
      }

      if (fPrecioMax) {
        const max = Number(fPrecioMax);
        const precio =
          t.precio_base !== null && t.precio_base !== undefined
            ? Number(t.precio_base)
            : null;
        if (precio !== null && !Number.isNaN(max) && precio > max) {
          return false;
        }
      }

      return true;
    });
  }, [tours, fDestino, fDificultad, fPrecioMax]);

  const goToDetalle = (t: TourItem) => {
    navigate(`/experiencias/${t.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">
        Explora nuestras experiencias
      </h1>
      <p className="text-sm text-gray-300 mb-6">
        Ecoturismo responsable en montaña, costa y zonas de fauna salvaje.
        Elige destino, nivel físico y rango de precio.
      </p>

      <section className="grid gap-6 md:grid-cols-[260px,1fr]">
        {/* FILTROS */}
        <aside className="bg-[#050505] border border-[#222] rounded-2xl p-4 text-sm">
          <h2 className="text-base font-semibold mb-3">Filtros</h2>

          <div className="mb-3">
            <label className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">
              Destino / zona
            </label>
            <input
              className="w-full rounded-lg px-3 py-2 bg-black/70 border border-gray-600 text-sm focus:outline-none focus:border-gray-300"
              placeholder="Galicia, Pirineos, Andalucía..."
              value={fDestino}
              onChange={(e) => setFDestino(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">
              Nivel físico
            </label>
            <select
              className="w-full rounded-lg px-3 py-2 bg-black/70 border border-gray-600 text-sm focus:outline-none"
              value={fDificultad}
              onChange={(e) => setFDificultad(e.target.value)}
            >
              <option value="">Cualquiera</option>
              <option value="baja">Tranquilo</option>
              <option value="media">Medio</option>
              <option value="alta">Exigente</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">
              Precio máximo (€)
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg px-3 py-2 bg-black/70 border border-gray-600 text-sm focus:outline-none"
              placeholder="Ej. 150"
              value={fPrecioMax}
              onChange={(e) => setFPrecioMax(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="mt-2 w-full py-2 rounded-full text-sm font-semibold"
            style={{ backgroundColor: gold, color: "#000" }}
            onClick={() => {
              setFDestino("");
              setFDificultad("");
              setFPrecioMax("");
            }}
          >
            Limpiar filtros
          </button>
        </aside>

        {/* LISTADO */}
        <main>
          {loading && (
            <p className="text-sm text-gray-300">Cargando experiencias...</p>
          )}

          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

          {!loading && !error && toursFiltrados.length === 0 && (
            <p className="text-sm text-gray-300">
              No hemos encontrado experiencias que encajen con esos filtros.
              Prueba a ampliar la zona o el rango de precio.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toursFiltrados.map((t) => {
              const precio =
                t.precio_base !== null && t.precio_base !== undefined
                  ? Number(t.precio_base)
                  : null;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => goToDetalle(t)}
                  className="group text-left rounded-2xl overflow-hidden bg-[#111] border border-[#222] hover:border-[#444] transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="h-40 w-full bg-black relative overflow-hidden">
                    {t.imagen_url ? (
                      <img
                        src={t.imagen_url}
                        alt={t.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                        Foto pendiente
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex flex-col gap-1">
                    <h3 className="text-sm md:text-base font-semibold line-clamp-2">
                      {t.titulo}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {t.ubicacion || "Destino por confirmar"}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-300">
                      <span>
                        {t.duracion_dias && `${t.duracion_dias} días · `}
                        {t.dificultad && `Nivel ${t.dificultad}`}
                      </span>
                      {precio !== null && (
                        <span
                          className="font-semibold"
                          style={{ color: gold }}
                        >
                          Desde {precio.toFixed(0)} €
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      </section>
    </div>
  );
}



