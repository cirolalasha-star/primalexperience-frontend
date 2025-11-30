// src/pages/admin/AdminReservas.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet, apiPatch } from "../../api/client";

type EstadoReserva = "pendiente" | "confirmada" | "cancelada" | string;

type ReservaAdmin = {
  id: number;
  numero_personas: number;
  estado: EstadoReserva;
  notas: string | null;
  fecha: string; // fecha de creación de la reserva

  usuario: {
    id: number;
    nombre: string;
    email: string;
  };

  salidas_programadas?: {
    id: number;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    tours?: {
      id: number;
      titulo: string;
      ubicacion: string | null;
      guia_id?: number | null; // 👈 para filtro por guía
    };
  };
};

export default function AdminReservas() {
  const [reservas, setReservas] = useState<ReservaAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ separamos error de carga y error de actualización
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorActualizar, setErrorActualizar] = useState<string | null>(null);

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] =
    useState<"todas" | "pendiente" | "confirmada" | "cancelada">("todas");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [filtroGuiaId, setFiltroGuiaId] = useState<string>("");

  // Para leer ?tourId= desde la URL (cuando vienes desde el Dashboard)
  const [searchParams] = useSearchParams();

  // 🔄 Cargar reservas al entrar en la página (y cuando cambie ?tourId=)
  useEffect(() => {
    const fetchReservas = async () => {
      try {
        setLoading(true);
        setErrorCarga(null);

        const tourIdParam = searchParams.get("tourId");
        let url = "/reservas/admin";

        if (tourIdParam) {
          const params = new URLSearchParams();
          params.set("tour_id", tourIdParam);
          url += `?${params.toString()}`;
        }

        const data = await apiGet<ReservaAdmin[]>(url, true); // 👈 con token
        setReservas(data);
      } catch (err) {
        console.error("Error al cargar reservas admin:", err);
        setErrorCarga("No se han podido cargar las reservas.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [searchParams]);

  // 🔁 Cambiar estado (pendiente / confirmada / cancelada)
  const cambiarEstado = async (
    id: number,
    nuevoEstado: "pendiente" | "confirmada" | "cancelada"
  ) => {
    try {
      setUpdatingId(id);
      setErrorActualizar(null);

      // ⚠️ Usamos la ruta admin explícita del backend
      await apiPatch(`/reservas/admin/${id}/estado`, { estado: nuevoEstado }, true);

      // Refrescamos en memoria sin volver a pedir todo
      setReservas((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                estado: nuevoEstado,
              }
            : r
        )
      );
    } catch (err) {
      console.error("Error al actualizar estado de reserva:", err);
      setErrorActualizar("No se ha podido actualizar el estado de la reserva.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Lista de guías disponibles (por id) a partir de las reservas cargadas
  const guiasDisponibles = Array.from(
    new Set(
      reservas
        .map((r) => r.salidas_programadas?.tours?.guia_id)
        .filter((id): id is number => typeof id === "number")
    )
  ).sort((a, b) => a - b);

  // Aplicar filtros en memoria (estado, guía, rango de fechas)
  const reservasFiltradas = reservas.filter((r) => {
    // Filtro por estado
    if (filtroEstado !== "todas" && r.estado !== filtroEstado) {
      return false;
    }

    // Filtro por guía (id)
    if (filtroGuiaId) {
      const guiaIdReserva = r.salidas_programadas?.tours?.guia_id ?? null;
      if (!guiaIdReserva || guiaIdReserva !== Number(filtroGuiaId)) {
        return false;
      }
    }

    // Filtro por fechas (usamos r.fecha = fecha de creación de la reserva)
    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      const fechaReserva = new Date(r.fecha);
      if (fechaReserva < desde) return false;
    }

    if (fechaHasta) {
      // Incluimos todo el día de fechaHasta
      const hasta = new Date(fechaHasta + "T23:59:59");
      const fechaReserva = new Date(r.fecha);
      if (fechaReserva > hasta) return false;
    }

    return true;
  });

  // Exportar CSV con las reservasFiltradas
  const handleExportCsv = () => {
    if (reservasFiltradas.length === 0) {
      alert("No hay reservas para exportar con los filtros actuales.");
      return;
    }

    const escapeCsv = (value: unknown) => {
      if (value === null || value === undefined) return '""';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

    const header = [
      "id",
      "tour_id",
      "tour_titulo",
      "guia_id",
      "cliente_nombre",
      "cliente_email",
      "estado",
      "numero_personas",
      "fecha_reserva",
      "fecha_salida",
      "ubicacion",
      "notas",
    ].join(";");

    const rows = reservasFiltradas.map((r) => {
      const salida = r.salidas_programadas;
      const tour = salida?.tours;

      const fechaSalida = salida?.fecha_inicio
        ? new Date(salida.fecha_inicio).toISOString()
        : "";

      return [
        escapeCsv(r.id),
        escapeCsv(tour?.id ?? ""),
        escapeCsv(tour?.titulo ?? ""),
        escapeCsv(tour?.guia_id ?? ""),
        escapeCsv(r.usuario?.nombre ?? ""),
        escapeCsv(r.usuario?.email ?? ""),
        escapeCsv(r.estado),
        escapeCsv(r.numero_personas),
        escapeCsv(new Date(r.fecha).toISOString()),
        escapeCsv(fechaSalida),
        escapeCsv(tour?.ubicacion ?? ""),
        escapeCsv(r.notas ?? ""),
      ].join(";");
    });

    const csvContent = [header, ...rows].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const hoy = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.setAttribute("download", `reservas_admin_${hoy}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-300">
        Cargando reservas...
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-red-400">
        {errorCarga}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      <h1 className="text-2xl font-bold mb-2">Gestión de reservas</h1>
      <p className="text-sm text-gray-300 mb-2">
        Aquí puedes revisar todas las reservas, filtrarlas y cambiar su estado.
      </p>

      {errorActualizar && (
        <p className="text-sm text-red-400 mb-3">
          {errorActualizar}
        </p>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
        {/* Estado */}
        <div className="flex items-center gap-2">
          <span className="text-gray-300">Estado:</span>
          <select
            value={filtroEstado}
            onChange={(e) =>
              setFiltroEstado(e.target.value as typeof filtroEstado)
            }
            className="bg-black/70 border border-gray-600 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gray-300"
          >
            <option value="todas">Todas</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        {/* Guía */}
        <div className="flex items-center gap-2">
          <span className="text-gray-300">Guía:</span>
          <select
            value={filtroGuiaId}
            onChange={(e) => setFiltroGuiaId(e.target.value)}
            className="bg-black/70 border border-gray-600 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gray-300"
          >
            <option value="">Todos</option>
            {guiasDisponibles.map((id) => (
              <option key={id} value={id}>
                Guía #{id}
              </option>
            ))}
          </select>
        </div>

        {/* Rango de fechas */}
        <div className="flex items-center gap-2">
          <span className="text-gray-300">Fecha reserva:</span>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="bg-black/70 border border-gray-600 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gray-300"
          />
          <span className="text-gray-400">–</span>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="bg-black/70 border border-gray-600 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-gray-300"
          />
        </div>

        {/* Exportar CSV */}
        <button
          onClick={handleExportCsv}
          className="ml-auto px-3 py-1.5 rounded-full border border-[#B8860B] text-xs font-semibold text-[#B8860B] hover:bg-[#B8860B]/10"
        >
          Exportar CSV
        </button>

        <span className="text-xs text-gray-400">
          Mostrando {reservasFiltradas.length} reserva
          {reservasFiltradas.length !== 1 ? "s" : ""}
        </span>
      </div>

      {reservasFiltradas.length === 0 ? (
        <p className="text-sm text-gray-300">
          No hay reservas con esos filtros.
        </p>
      ) : (
        <div className="space-y-4">
          {reservasFiltradas.map((r) => {
            const salida = r.salidas_programadas;
            const tour = salida?.tours;
            const fechaSalida = salida?.fecha_inicio
              ? new Date(salida.fecha_inicio)
              : null;
            const fechaReserva = r.fecha ? new Date(r.fecha) : null;

            const isPending = r.estado === "pendiente";
            const isConfirmed = r.estado === "confirmada";
            const isCancelled = r.estado === "cancelada";

            const estadoColor = isConfirmed
              ? "text-green-400"
              : isCancelled
              ? "text-red-400"
              : "text-yellow-300";

            return (
              <article
                key={r.id}
                className="bg-[#050505] border border-[#222] rounded-2xl p-4 text-sm flex flex-col md:flex-row md:justify-between gap-3"
              >
                {/* Columna izquierda: info de tour y usuario */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    Reserva #{r.id}
                  </p>
                  <h2 className="text-base font-semibold mb-1">
                    {tour?.titulo || "Experiencia sin título"}
                  </h2>
                  <p className="text-xs text-gray-400 mb-1">
                    {tour?.ubicacion || "Ubicación pendiente"}
                  </p>

                  {tour?.guia_id && (
                    <p className="text-xs text-gray-400">
                      Guía asignado: #{tour.guia_id}
                    </p>
                  )}

                  <p className="text-sm text-gray-200">
                    <span className="font-semibold">Cliente:</span>{" "}
                    {r.usuario?.nombre}{" "}
                    <span className="text-gray-400">
                      ({r.usuario?.email})
                    </span>
                  </p>

                  <p className="text-sm text-gray-200">
                    <span className="font-semibold">Personas:</span>{" "}
                    {r.numero_personas}
                  </p>

                  {fechaSalida && (
                    <p className="text-xs text-gray-300">
                      <span className="font-semibold">Fecha salida:</span>{" "}
                      {fechaSalida.toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}

                  {fechaReserva && (
                    <p className="text-xs text-gray-500">
                      Fecha de solicitud:{" "}
                      {fechaReserva.toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}

                  {r.notas && (
                    <p className="mt-1 text-xs text-gray-300">
                      <span className="font-semibold">Notas:</span> {r.notas}
                    </p>
                  )}
                </div>

                {/* Columna derecha: estado + acciones */}
                <div className="flex flex-col items-start md:items-end gap-2">
                  <p className={`text-sm font-semibold ${estadoColor}`}>
                    {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {!isConfirmed && (
                      <button
                        onClick={() => cambiarEstado(r.id, "confirmada")}
                        disabled={updatingId === r.id}
                        className="px-3 py-1 rounded-full border border-green-500 text-green-300 hover:bg-green-500/10 disabled:opacity-60"
                      >
                        {updatingId === r.id
                          ? "Actualizando..."
                          : "Marcar confirmada"}
                      </button>
                    )}

                    {!isPending && (
                      <button
                        onClick={() => cambiarEstado(r.id, "pendiente")}
                        disabled={updatingId === r.id}
                        className="px-3 py-1 rounded-full border border-yellow-500 text-yellow-300 hover:bg-yellow-500/10 disabled:opacity-60"
                      >
                        {updatingId === r.id
                          ? "Actualizando..."
                          : "Volver a pendiente"}
                      </button>
                    )}

                    {!isCancelled && (
                      <button
                        onClick={() => cambiarEstado(r.id, "cancelada")}
                        disabled={updatingId === r.id}
                        className="px-3 py-1 rounded-full border border-red-500 text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                      >
                        {updatingId === r.id
                          ? "Actualizando..."
                          : "Cancelar"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
