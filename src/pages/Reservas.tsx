// src/pages/Reservas.tsx
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";

// 🔹 Tipo para las reservas
interface Reserva {
  id?: number;
  usuario_id: number;
  salida_programada_id: number;
  plazas: number;
  fecha_creacion?: string;
}

// 🔹 Tipo para mostrar usuarios y salidas
interface Usuario {
  id: number;
  nombre: string;
}
interface Salida {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  tour_id: number;
}

export default function Reservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [salidas, setSalidas] = useState<Salida[]>([]);
  const [nueva, setNueva] = useState<Reserva>({
    usuario_id: 0,
    salida_programada_id: 0,
    plazas: 1,
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Cargar datos al iniciar
  useEffect(() => {
    async function cargarDatos() {
      try {
        const [res, us, sa] = await Promise.all([
          apiGet<Reserva[]>("/reservas"),
          apiGet<Usuario[]>("/usuarios"),
          apiGet<Salida[]>("/salidas_programadas"),
        ]);
        setReservas(res);
        setUsuarios(us);
        setSalidas(sa);
      } catch (err: any) {
        console.error(err);
        setError("Error al cargar datos iniciales");
      }
    }
    cargarDatos();
  }, []);

  // 🔹 Crear una reserva
  async function crearReserva() {
    setError(null);
    setMensaje(null);
    setLoading(true);

    // Validaciones previas
    if (!nueva.usuario_id || !nueva.salida_programada_id) {
      setError("Selecciona usuario y salida antes de crear la reserva");
      setLoading(false);
      return;
    }

    try {
      const creada = await apiPost<Reserva>("/reservas", nueva);
      setReservas([...reservas, creada]);
      setMensaje("✅ Reserva creada correctamente");
      setNueva({ usuario_id: 0, salida_programada_id: 0, plazas: 1 });
    } catch (err: any) {
      console.error(err);
      setError("Error al crear la reserva");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Reservas</h1>

      {/* Mensajes de estado */}
      {loading && <p>Creando reserva...</p>}
      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Lista de reservas existentes */}
      <h2>Reservas existentes</h2>
      <table border={1} cellPadding={4}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Salida</th>
            <th>Plazas</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.usuario_id}</td>
              <td>{r.salida_programada_id}</td>
              <td>{r.plazas}</td>
              <td>{r.fecha_creacion?.split("T")[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulario nueva reserva */}
      <h2>Nueva reserva</h2>
      <div>
        <label>Usuario: </label>
        <select
          value={nueva.usuario_id}
          onChange={(e) => setNueva({ ...nueva, usuario_id: Number(e.target.value) })}
        >
          <option value="0">Selecciona un usuario</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>

        <label>Salida: </label>
        <select
          value={nueva.salida_programada_id}
          onChange={(e) => setNueva({ ...nueva, salida_programada_id: Number(e.target.value) })}
        >
          <option value="0">Selecciona una salida</option>
          {salidas.map((s) => (
            <option key={s.id} value={s.id}>
              {`Salida ${s.id} (${s.fecha_inicio.split("T")[0]})`}
            </option>
          ))}
        </select>

        <label>Plazas: </label>
        <input
          type="number"
          min="1"
          max="10"
          value={nueva.plazas}
          onChange={(e) => setNueva({ ...nueva, plazas: Number(e.target.value) })}
        />

        <button onClick={crearReserva} disabled={loading}>
          Crear reserva
        </button>
      </div>
    </div>
  );
}
