import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/client";

const gold = "#B8860B";
const dark = "#020202";

// Ajusta este tipo a la forma real de tu API
interface Experience {
  id: number;
  nombre: string;
  destino: string | null;
  duracion: string | null;
  dificultad: string | null;
  precioDesde: number | null;
  imagenPrincipal: string | null;
  // opcionales si los sigues usando en el JSX:
  pais?: string | null;
  tipo?: string | null;
}


export default function Home() {
  const navigate = useNavigate();

  const [destino, setDestino] = useState("");
  const [tipo, setTipo] = useState("");
  const [fecha, setFecha] = useState("");
  const [nivel, setNivel] = useState("");

  const [destacadas, setDestacadas] = useState<Experience[]>([]);
  const [loadingDestacadas, setLoadingDestacadas] = useState(true);
  const [errorDestacadas, setErrorDestacadas] = useState<string | null>(null);

  // ⬇️ Carga experiencias destacadas desde tu backend
  useEffect(() => {
    async function fetchDestacadas() {
      try {
        setLoadingDestacadas(true);
        setErrorDestacadas(null);

        // 💡 AJUSTA ESTE ENDPOINT a tu API real
        // Por ejemplo: "/experiencias?destacadas=true" o "/experiencias/destacadas"
        const apiTours = await apiGet<any[]>("/tours/destacados");

// Adaptamos los tours de la API al tipo Experience del frontend
const mapped: Experience[] = apiTours.map((t) => ({
  id: t.id,
  nombre: t.titulo,
  destino: t.ubicacion ?? null,
  duracion: t.duracion_dias
    ? `${t.duracion_dias} día${t.duracion_dias > 1 ? "s" : ""}`
    : null,
  dificultad: t.dificultad ?? null,
  precioDesde:
    t.precio_base !== null && t.precio_base !== undefined
      ? Number(t.precio_base)
      : null,
  imagenPrincipal: t.imagen_url ?? null,
}));

setDestacadas(mapped);

      } catch (err) {
        console.error(err);
        setErrorDestacadas("No se han podido cargar las experiencias destacadas.");
      } finally {
        setLoadingDestacadas(false);
      }
    }

    fetchDestacadas();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (destino) params.set("destino", destino);
    if (tipo) params.set("tipo", tipo);
    if (fecha) params.set("fecha", fecha);
    if (nivel) params.set("nivel", nivel);

    navigate(`/experiencias?${params.toString()}`);
  };

  const goToExperience = (exp: Experience) => {
    // Si usas slug: `/experiencias/${exp.slug}`
    navigate(`/experiencias/${exp.id}`);
  };

  return (
    <div className="w-full bg-black text-white">
      {/* HERO + BUSCADOR */}
      <section className="relative min-h-[60vh] flex items-center justify-center text-center px-4 py-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/572861/pexels-photo-572861.jpeg?auto=compress')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black" />

        <div className="relative max-w-4xl mx-auto">
          <p className="uppercase tracking-[0.25em] text-xs md:text-sm mb-3 text-gray-300">
            Ecoturismo responsable · Grupos reducidos
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Vive experiencias salvajes{" "}
            <span style={{ color: gold }}>con impacto positivo</span> en la
            naturaleza.
          </h1>
          <p className="text-gray-200 mb-8 text-sm md:text-base">
            Avistamientos de fauna, montaña, mar y expediciones diseñadas por
            guías expertos para disfrutar sin masificar ni dañar el entorno.
          </p>

          {/* Buscador */}
          <form
            onSubmit={handleSearch}
            className="bg-black/75 border rounded-2xl p-4 md:p-5 grid gap-3 md:grid-cols-4 shadow-xl"
            style={{ borderColor: gold }}
          >
            <div className="text-left">
              <label className="text-[11px] uppercase tracking-wide text-gray-300">
                Destino / parque
              </label>
              <input
                className="w-full mt-1 rounded-lg px-3 py-2 bg-black/60 border border-gray-600 text-sm focus:outline-none focus:border-gray-300"
                placeholder="Picos de Europa, Sierra de la Culebra..."
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
              />
            </div>

            <div className="text-left">
              <label className="text-[11px] uppercase tracking-wide text-gray-300">
                Tipo de experiencia
              </label>
              <select
                className="w-full mt-1 rounded-lg px-3 py-2 bg-black/60 border border-gray-600 text-sm focus:outline-none"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="">Cualquiera</option>
                <option value="fauna">Fauna</option>
                <option value="montana">Montaña</option>
                <option value="mar">Mar</option>
                <option value="fotografia">Fotografía</option>
                <option value="expedicion_larga">Expedición larga</option>
                <option value="familiar">Familiar</option>
              </select>
            </div>

            <div className="text-left">
              <label className="text-[11px] uppercase tracking-wide text-gray-300">
                Fecha aproximada
              </label>
              <input
                type="month"
                className="w-full mt-1 rounded-lg px-3 py-2 bg-black/60 border border-gray-600 text-sm focus:outline-none"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            <div className="text-left">
              <label className="text-[11px] uppercase tracking-wide text-gray-300">
                Nivel físico
              </label>
              <select
                className="w-full mt-1 rounded-lg px-3 py-2 bg-black/60 border border-gray-600 text-sm focus:outline-none"
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
              >
                <option value="">Cualquiera</option>
                <option value="bajo">Tranquilo</option>
                <option value="medio">Medio</option>
                <option value="alto">Exigente</option>
              </select>
            </div>

            <div className="md:col-span-4 flex justify-center mt-1">
              <button
                type="submit"
                className="px-8 py-2 rounded-full text-sm md:text-base font-semibold shadow-lg"
                style={{ backgroundColor: gold, color: dark }}
              >
                Explorar experiencias
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* BLOQUE CONFIANZA */}
      <section className="max-w-6xl mx-auto px-4 py-10 grid gap-6 md:grid-cols-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            Confianza real
          </h2>
          <p className="text-sm text-gray-300">
            ⭐⭐⭐⭐⭐ Viajeros que repiten. Salidas guiadas por biólogos y guías
            locales, con años de experiencia en observación responsable.
          </p>
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            Impacto positivo
          </h2>
          <p className="text-sm text-gray-300">
            Parte de cada reserva se destina a proyectos de conservación,
            censos de fauna y apoyo a comunidades locales.
          </p>
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            Grupos reducidos
          </h2>
          <p className="text-sm text-gray-300">
            Sin masificación. Diseñamos las salidas para minimizar ruidos,
            respetar distancias y priorizar el bienestar de la fauna.
          </p>
        </div>
      </section>

      {/* EXPERIENCIAS DESTACADAS */}
      <section className="bg-[#050505] border-y border-[#222]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-semibold">
              Experiencias destacadas este mes
            </h2>
            <button
              className="text-sm underline underline-offset-4"
              onClick={() => navigate("/experiencias")}
            >
              Ver todas
            </button>
          </div>

          {loadingDestacadas && (
            <p className="text-sm text-gray-300">Cargando experiencias...</p>
          )}

          {errorDestacadas && (
            <p className="text-sm text-red-400">{errorDestacadas}</p>
          )}

          {!loadingDestacadas && !errorDestacadas && destacadas.length === 0 && (
            <p className="text-sm text-gray-400">
              Aún no hay experiencias destacadas configuradas.
            </p>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destacadas.map((exp) => (
              <button
                key={exp.id}
                onClick={() => goToExperience(exp)}
                className="group text-left rounded-2xl overflow-hidden bg-[#111] border border-[#222] hover:border-[#444] transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-40 w-full bg-black relative overflow-hidden">
                  {exp.imagenPrincipal ? (
                    <img
                      src={exp.imagenPrincipal}
                      alt={exp.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                      Foto pendiente
                    </div>
                  )}
                  {exp.tipo && (
                    <span
                      className="absolute top-2 left-2 text-[11px] px-2 py-1 rounded-full bg-black/70"
                      style={{ border: `1px solid ${gold}` }}
                    >
                      {exp.tipo}
                    </span>
                  )}
                </div>

                <div className="p-3 flex flex-col gap-1">
                  <h3 className="text-sm md:text-base font-semibold line-clamp-2">
                    {exp.nombre}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {exp.destino || exp.pais || "Destino por confirmar"}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-300">
                    <span>
                      {exp.duracion && `${exp.duracion} · `}
                      {exp.dificultad && `Nivel ${exp.dificultad}`}
                    </span>
                    {typeof exp.precioDesde === "number" && (
                      <span className="font-semibold" style={{ color: gold }}>
                        Desde {exp.precioDesde.toFixed(0)} €
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* BLOQUE "POR QUÉ ECOTURISMO RESPONSABLE" */}
      <section className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            ¿Por qué ecoturismo responsable?
          </h2>
          <p className="text-sm text-gray-300 mb-4">
            No vendemos solo “excursiones”. Diseñamos experiencias que
            equilibran observación de fauna, seguridad, educación y conservación
            real del entorno.
          </p>
          <ul className="space-y-3 text-sm text-gray-200">
            <li>• Grupos pequeños para reducir impacto y ruidos.</li>
            <li>• Rutas y horarios pensados para no interferir con la fauna.</li>
            <li>• Colaboración con proyectos de conservación y ONGs locales.</li>
            <li>• Información clara sobre normas de comportamiento en la naturaleza.</li>
          </ul>
        </div>
        <div className="bg-[#050505] border border-[#222] rounded-2xl p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-2">
            Recibe alertas de nuevas salidas y avistamientos especiales
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            Te avisamos cuando lancemos nuevas experiencias de lobos, osos,
            aves rapaces, fotografía nocturna y más.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Aquí luego conectarás con tu endpoint /newsletter
              alert("¡Gracias! Te avisaremos de nuevas salidas.");
            }}
            className="space-y-3"
          >
            <input
              type="email"
              required
              placeholder="Tu email"
              className="w-full rounded-lg px-3 py-2 bg-black/70 border border-gray-600 text-sm focus:outline-none focus:border-gray-300"
            />
            <select className="w-full rounded-lg px-3 py-2 bg-black/70 border border-gray-600 text-sm focus:outline-none">
              <option>Interes principal</option>
              <option>Fauna (lobos, osos, aves...)</option>
              <option>Fotografía de naturaleza</option>
              <option>Montaña y travesías</option>
              <option>Experiencias familiares</option>
            </select>
            <button
              type="submit"
              className="w-full py-2 rounded-full text-sm font-semibold mt-1"
              style={{ backgroundColor: gold, color: dark }}
            >
              Quiero recibir alertas
            </button>
          </form>
        </div>
      </section>

      {/* BLOQUE BLOG / CONTENIDO EDUCATIVO */}
      <section className="bg-[#050505] border-t border-[#222]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-semibold">
              Aprende antes de salir al campo
            </h2>
            <button
              className="text-sm underline underline-offset-4"
              onClick={() => navigate("/blog")}
            >
              Ver todas las guías
            </button>
          </div>

          {/* Por ahora, estático. Luego puedes sustituirlo por datos de /blog */}
          <div className="grid gap-4 md:grid-cols-3">
            <article className="bg-[#111] border border-[#222] rounded-2xl p-4 text-sm">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                Guía de fauna
              </p>
              <h3 className="font-semibold mb-2">
                Cómo observar lobos sin interferir en su comportamiento
              </h3>
              <p className="text-gray-300 text-xs mb-2">
                Distancias mínimas, horarios recomendados y consejos para no
                dejar rastro en el monte.
              </p>
              <button
                className="text-xs underline underline-offset-4"
                onClick={() => navigate("/blog/lobos-observacion-responsable")}
              >
                Leer guía
              </button>
            </article>

            <article className="bg-[#111] border border-[#222] rounded-2xl p-4 text-sm">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                Fotografía
              </p>
              <h3 className="font-semibold mb-2">
                Fotografía nocturna de fauna y paisaje
              </h3>
              <p className="text-gray-300 text-xs mb-2">
                Equipo mínimo, ajustes de cámara y ética en fotografía de fauna
                nocturna.
              </p>
              <button
                className="text-xs underline underline-offset-4"
                onClick={() =>
                  navigate("/blog/fotografia-nocturna-fauna-paisaje")
                }
              >
                Leer guía
              </button>
            </article>

            <article className="bg-[#111] border border-[#222] rounded-2xl p-4 text-sm">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                Preparación
              </p>
              <h3 className="font-semibold mb-2">
                Qué llevar a una salida de montaña invernal
              </h3>
              <p className="text-gray-300 text-xs mb-2">
                Capas de ropa, material imprescindible y seguridad en zonas
                remotas.
              </p>
              <button
                className="text-xs underline underline-offset-4"
                onClick={() =>
                  navigate("/blog/que-llevar-salida-montana-invierno")
                }
              >
                Leer guía
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* FOOTER MINI (si aún no tienes Footer global) */}
      {/* Si ya tienes <Footer /> en el layout, puedes borrar esto */}
      <footer className="border-t border-[#222] py-4 text-center text-[11px] text-gray-500">
        © {new Date().getFullYear()} Primal Experience · Ecoturismo responsable
      </footer>
    </div>
  );
}
