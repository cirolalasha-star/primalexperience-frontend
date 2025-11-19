// src/api/client.ts
// -------------------------------
// Este archivo centraliza todas las llamadas HTTP a tu backend.
// Así, si cambias la URL o agregas headers, solo lo haces aquí.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";


/**
 * Hace una petición GET a la API.
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Error ${res.status}: ${msg}`);
  }

  return (await res.json()) as T;
}


/**
 * Hace una petición POST a la API.
 */
export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    // ⬇️ Intentamos sacar un mensaje útil del backend
    let message = `Error ${res.status}`;

    try {
      const text = await res.text();
      if (text) {
        try {
          const json = JSON.parse(text);
          message = json.message ?? text;
        } catch {
          message = text;
        }
      }
    } catch {
      // si algo falla aquí dejamos el mensaje por defecto
    }

    throw new Error(message);
  }

  return (await res.json()) as T;
}




/**
 * BASE_URL: toma tu URL del backend en Render (VITE_API_URL), o usa localhost en desarrollo.

apiGet y apiPost: funciones reutilizables para no escribir fetch en cada componente.

Usan genéricos <T> en TypeScript → las respuestas quedan tipadas según el modelo que pidas.

Con Esto:
  ·En desarrollo, uso .env.local con http://localhost:3000/api
  ·En producción, uso .env (o variables en Vercel) con https://mi-app-reservas-bceb.onrender.com/api
 */