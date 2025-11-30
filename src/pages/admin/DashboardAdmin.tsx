// src/pages/admin/DashboardAdmin.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../api/client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

type StatPorExperiencia = {
  tour_id: number;
  titulo: string;
  ubicacion: string | null;
  total_reservas: number;
  total_personas: number;
  total_ingresos: number;
  total_plazas: number;
  total_ocupadas: number;
  porcentaje_ocupacion: number;
};

type StatPorGuia = {
  guia_id: number | null;
  guia_nombre: string;
  guia_email: string | null;
  total_reservas: number;
  total_personas: number;
  total_ingresos: number;
  total_plazas: number;
  total_ocupadas: number;
  porcentaje_ocupacion: number;
};

type StatPorMes = {
  anio: number;
  mes: number; // 1-12
  reservas: number;
  personas: number;
};

const GOLD = "#B8860B";
const GREEN = "#22c55e";
const BLUE = "#38bdf8";
const RED = "#f97373";

const PIE_COLORS = ["#B8860B", "#38bdf8", "#22c55e", "#f97373", "#eab308", "#a855f7"];

const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export default function DashboardAdmin() {
  const [statsExp, setStatsExp] = useState<StatPorExperiencia[]>([]);
  const [statsGuia, setStatsGuia] = useState<StatPorGuia[]>([]);
  const [statsMes, setStatsMes] = useState<StatPorMes[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorExp, setErrorExp] = useState<string | null>(null);
  const [errorGuia, setErrorGuia] = useState<string | null>(null);
  const [errorMes, setErrorMes] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setErrorExp(null);
        setErrorGuia(null);
        setErrorMes(null);

        const [expData, guiaData, mesData] = await Promise.all([
          apiGet<StatPorExperiencia[]>("/reservas/admin/resumen-por-experiencia", true),
          apiGet<StatPorGuia[]>("/reservas/admin/resumen-por-guia", true),
          apiGet<StatPorMes[]>("/reservas/admin/por-mes", true),
        ]);

        setStatsExp(expData);
        setStatsGuia(guiaData);
        setStatsMes(mesData);
      } catch (err) {
        console.error("Error cargando estadísticas admin:", err);
        setErrorExp("No se han podido cargar las estadísticas por experiencia.");
        setErrorGuia("No se han podido cargar las estadísticas por guía.");
        setErrorMes("No se han podido cargar las estadísticas por mes.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Totales globales (basados en experiencias)
  const totalReservas = statsExp.reduce((acc, s) => acc + s.total_reservas, 0);
  const totalPersonas = statsExp.reduce((acc, s) => acc + s.total_personas, 0);
  const totalIngresos = statsExp.reduce((acc, s) => acc + s.total_ingresos, 0);

  const ocupacionMedia =
    statsExp.length > 0
      ? statsExp.reduce((acc, s) => acc + s.porcentaje_ocupacion, 0) / statsExp.length
      : 0;

  // Datos para gráficas
  const chartExpIngresos = statsExp.map((s) => ({
    nombre: s.titulo,
    ingresos: Math.round(s.total_ingresos),
    reservas: s.total_reservas,
    personas: s.total_personas,
  }));

  const chartGuiaIngresos = statsGuia.map((g) => ({
    nombre: g.guia_nombre,
    ingresos: Math.round(g.total_ingresos),
    reservas: g.total_reservas,
    personas: g.total_personas,
  }));

  const chartPieReservas = statsExp.map((s) => ({
    nombre: s.titulo,
    value: s.total_reservas,
  }));

  const chartMes = statsMes.map((m) => ({
    nombre: `${MESES_CORTOS[m.mes - 1]} ${String(m.anio).slice(2)}`,
    reservas: m.reservas,
    personas: m.personas,
  }));

  const hasExpData = !loading && !errorExp && statsExp.length > 0;
  const hasGuiaData = !loading && !errorGuia && statsGuia.length > 0;
  const hasMesData = !loading && !errorMes && statsMes.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      <h1 className="text-2xl font-bold mb-2">Panel Admin</h1>
      <p className="text-sm text-gray-300 mb-2">Resumen rápido de la actividad de la plataforma.</p>
      <p className="text-[11px] text-gray-500 mb-6">
        Métricas basadas en reservas <span className="font-semibold">confirmadas</span>.
      </p>

      {/* Tarjetas principales de navegación */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Link
          to="/admin/reservas"
          className="bg-[#050505] border border-[#222] rounded-2xl p-4 hover:border-[#B8860B] transition-colors"
        >
          <h2 className="text-lg font-semibold mb-1">Reservas</h2>
          <p className="text-sm text-gray-300">
            Ver y gestionar todas las reservas de los clientes.
          </p>
        </Link>
      </div>

      {/* KPI globales */}
      {hasExpData && (
        <div className="grid gap-4 md:grid-cols-4 mb-8 text-sm">
          <div className="bg-[#050505] border border-[#222] rounded-2xl p-3">
            <p className="text-xs text-gray-400">Reservas totales</p>
            <p className="text-xl font-semibold">{totalReservas}</p>
          </div>
          <div className="bg-[#050505] border border-[#222] rounded-2xl p-3">
            <p className="text-xs text-gray-400">Personas totales</p>
            <p className="text-xl font-semibold">{totalPersonas}</p>
          </div>
          <div className="bg-[#050505] border border-[#222] rounded-2xl p-3">
            <p className="text-xs text-gray-400">Ingresos estimados</p>
            <p className="text-xl font-semibold">
              {totalIngresos.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €
            </p>
          </div>
          <div className="bg-[#050505] border border-[#222] rounded-2xl p-3">
            <p className="text-xs text-gray-400">Ocupación media</p>
            <p className="text-xl font-semibold">{ocupacionMedia.toFixed(1)} %</p>
          </div>
        </div>
      )}

      {/* =========================
          BLOQUE GRÁFICAS
          ========================= */}
      {(hasExpData || hasGuiaData || hasMesData) && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Visualizaciones de rendimiento</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* BARRAS: Ingresos por experiencia */}
            {hasExpData && (
              <div className="bg-[#050505] border border-[#222] rounded-2xl p-4">
                <p className="text-sm font-semibold mb-2">Ingresos por experiencia</p>
                <p className="text-[11px] text-gray-400 mb-3">
                  Top experiencias que más facturan (eje Y en €).
                </p>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartExpIngresos}>
                      <XAxis
                        dataKey="nombre"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) =>
                          typeof value === "number"
                            ? value.toLocaleString("es-ES") + " €"
                            : value
                        }
                      />
                      <Legend />
                      <Bar dataKey="ingresos" name="Ingresos (€)" fill={GOLD} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* BARRAS: Ingresos por guía */}
            {hasGuiaData && (
              <div className="bg-[#050505] border border-[#222] rounded-2xl p-4">
                <p className="text-sm font-semibold mb-2">Ingresos por guía</p>
                <p className="text-[11px] text-gray-400 mb-3">
                  Comparativa de facturación asociada a cada guía.
                </p>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartGuiaIngresos}>
                      <XAxis
                        dataKey="nombre"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) =>
                          typeof value === "number"
                            ? value.toLocaleString("es-ES") + " €"
                            : value
                        }
                      />
                      <Legend />
                      <Bar dataKey="ingresos" name="Ingresos (€)" fill={GREEN} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* LÍNEAS: Reservas / personas por mes */}
            {hasMesData && (
              <div className="bg-[#050505] border border-[#222] rounded-2xl p-4 lg:col-span-2">
                <p className="text-sm font-semibold mb-2">Evolución mensual de reservas</p>
                <p className="text-[11px] text-gray-400 mb-3">
                  Reservas y personas confirmadas por mes.
                </p>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartMes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nombre" tick={{ fontSize: 11 }} height={40} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="reservas"
                        name="Reservas"
                        stroke={BLUE}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="personas"
                        name="Personas"
                        stroke={RED}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* PIE: Distribución de reservas por experiencia */}
            {hasExpData && (
              <div className="bg-[#050505] border border-[#222] rounded-2xl p-4 lg:col-span-2">
                <p className="text-sm font-semibold mb-2">
                  Distribución de reservas por experiencia
                </p>
                <p className="text-[11px] text-gray-400 mb-3">
                  Peso relativo de cada experiencia en el total de reservas.
                </p>
                <div className="w-full h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartPieReservas}
                        dataKey="value"
                        nameKey="nombre"
                        outerRadius={90}
                        labelLine={false}
                        label={(entry: any) => entry.payload.nombre as string}
                      >
                        {chartPieReservas.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================
          BLOQUE 1: POR EXPERIENCIA
          ========================= */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Reservas por experiencia</h2>

        {loading && <p className="text-sm text-gray-300">Cargando estadísticas...</p>}

        {errorExp && !loading && <p className="text-sm text-red-400">{errorExp}</p>}

        {!loading && !errorExp && statsExp.length === 0 && (
          <p className="text-sm text-gray-300">Todavía no hay reservas registradas.</p>
        )}

        {!loading && !errorExp && statsExp.length > 0 && (
          <div className="space-y-3">
            {statsExp.map((s) => (
              <article
                key={s.tour_id}
                className="bg-[#050505] border border-[#222] rounded-2xl p-3 text-sm flex justify-between items-center gap-3"
              >
                <div>
                  <p className="text-base font-semibold">{s.titulo}</p>
                  <p className="text-xs text-gray-400">
                    {s.ubicacion || "Ubicación pendiente"}
                  </p>
                  <p className="mt-1 text-xs text-gray-300">
                    Reservas:{" "}
                    <span className="font-semibold">{s.total_reservas}</span> · Personas:{" "}
                    <span className="font-semibold">{s.total_personas}</span> · Ingresos:{" "}
                    <span className="font-semibold">
                      {s.total_ingresos.toLocaleString("es-ES", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      €
                    </span>{" "}
                    · Ocupación:{" "}
                    <span className="font-semibold">
                      {s.porcentaje_ocupacion.toFixed(1)} %
                    </span>
                    {s.total_plazas > 0 && (
                      <>
                        {" "}
                        <span className="text-gray-400">
                          ({s.total_ocupadas}/{s.total_plazas} plazas)
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <Link
                  to={`/admin/reservas?tourId=${s.tour_id}`}
                  className="px-3 py-1 rounded-full border border-[#B8860B] text-xs font-semibold text-[#B8860B] hover:bg-[#B8860B]/10"
                >
                  Ver reservas
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ======================
          BLOQUE 2: POR GUÍA
          ====================== */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Actividad por guía</h2>

        {loading && (
          <p className="text-sm text-gray-300">Cargando estadísticas de guías...</p>
        )}

        {errorGuia && !loading && (
          <p className="text-sm text-red-400">{errorGuia}</p>
        )}

        {!loading && !errorGuia && statsGuia.length === 0 && (
          <p className="text-sm text-gray-300">
            Todavía no hay reservas asociadas a guías.
          </p>
        )}

        {!loading && !errorGuia && statsGuia.length > 0 && (
          <div className="space-y-3">
            {statsGuia.map((g) => (
              <article
                key={g.guia_id ?? -1}
                className="bg-[#050505] border border-[#222] rounded-2xl p-3 text-sm flex justify-between items-center gap-3"
              >
                <div>
                  <p className="text-base font-semibold">{g.guia_nombre}</p>
                  {g.guia_email && (
                    <p className="text-xs text-gray-400">{g.guia_email}</p>
                  )}
                  {!g.guia_email && g.guia_id && (
                    <p className="text-xs text-gray-500">ID guía: {g.guia_id}</p>
                  )}

                  <p className="mt-1 text-xs text-gray-300">
                    Reservas:{" "}
                    <span className="font-semibold">{g.total_reservas}</span> · Personas:{" "}
                    <span className="font-semibold">{g.total_personas}</span> · Ingresos:{" "}
                    <span className="font-semibold">
                      {g.total_ingresos.toLocaleString("es-ES", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      €
                    </span>{" "}
                    · Ocupación:{" "}
                    <span className="font-semibold">
                      {g.porcentaje_ocupacion.toFixed(1)} %
                    </span>
                    {g.total_plazas > 0 && (
                      <>
                        {" "}
                        <span className="text-gray-400">
                          ({g.total_ocupadas}/{g.total_plazas} plazas)
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
