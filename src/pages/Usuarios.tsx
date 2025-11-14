// src/pages/Usuarios.tsx
import { useState } from "react";
import { apiGet, apiPost } from "../api/client";

interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  telefono?: string;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nuevo, setNuevo] = useState<Usuario>({ nombre: "", email: "", telefono: "" });

  async function cargarUsuarios() {
    const data = await apiGet<Usuario[]>("/usuarios");
    setUsuarios(data);
  }

  async function crearUsuario() {
    const creado = await apiPost<Usuario>("/usuarios", nuevo);
    setUsuarios([...usuarios, creado]);
    setNuevo({ nombre: "", email: "", telefono: "" });
  }

  return (
    <div>
      <h1>Usuarios</h1>
      <button onClick={cargarUsuarios}>Cargar usuarios</button>

      <ul>
        {usuarios.map((u) => (
          <li key={u.id}>{u.nombre} - {u.email}</li>
        ))}
      </ul>

      <h2>Nuevo Usuario</h2>
      <input
        placeholder="Nombre"
        value={nuevo.nombre}
        onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
      />
      <input
        placeholder="Email"
        value={nuevo.email}
        onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
      />
      <input
        placeholder="Teléfono"
        value={nuevo.telefono}
        onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })}
      />
      <button onClick={crearUsuario}>Crear</button>
    </div>
  );
}
/*·usa apiGet y apiPost del arcvhivo del cliente
·Permite consultar usuarios o crear uno nuevo
·Si el backend responde correctamente, el nuevo usuario añade automáticamente a la lista
d*/
