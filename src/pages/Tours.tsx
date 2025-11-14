// src/pages/Tours.tsx
import { useEffect, useState } from "react";
import { apiGet } from "../api/client";

interface Tour {
  id: number;
  titulo: string;
  descripcion?: string;
  ubicacion?: string;
}

export default function Tours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTours() {
      try {
        const data = await apiGet<Tour[]>("/tours");
        setTours(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTours();
  }, []);

  if (loading) return <p>Cargando tours...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Lista de Tours</h1>
      {tours.map((tour) => (
        <div key={tour.id}>
          <h3>{tour.titulo}</h3>
          <p>{tour.descripcion}</p>
          <small>{tour.ubicacion}</small>
        </div>
      ))}
    </div>
  );
}
/**
 * ·llama al endpoint /api/tours del backend en Render
 * ·Muestra los tours reales que cargue con seed
 * ·Si hay error(como CORS o conexión), lo muestra claro en pantalla
 */