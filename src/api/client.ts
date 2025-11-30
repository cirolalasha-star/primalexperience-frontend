// src/api/client.ts
const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

async function request<T>(
  endpoint: string,
  method: HttpMethod,
  body?: unknown,
  requireAuth = false
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("token");
  if (requireAuth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Error ${res.status}`);
  }

  // 👇 SI ES 204 (No Content), devolvemos null y no intentamos parsear JSON
  if (res.status === 204 || res.headers.get("Content-Length") === "0") {
    return null as T;
  }

  return (await res.json()) as T;
}

export function apiGet<T>(endpoint: string, requireAuth = false) {
  return request<T>(endpoint, "GET", undefined, requireAuth);
}

export function apiPost<T>(
  endpoint: string,
  body?: unknown,
  requireAuth = true
) {
  return request<T>(endpoint, "POST", body, requireAuth);
}

export function apiPatch<T>(
  endpoint: string,
  body?: unknown,
  requireAuth = true
) {
  return request<T>(endpoint, "PATCH", body, requireAuth);
}

export function apiDelete<T>(endpoint: string, requireAuth = true) {
  return request<T>(endpoint, "DELETE", undefined, requireAuth);
}
