import { useEffect } from "react";

export default function Logout() {
  useEffect(() => {
    // 🧹 Borrar token del almacenamiento local
    localStorage.removeItem("token");

    // 🔁 Redirigir al login
    window.location.href = "/login";
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <h2>Cerrando sesión...</h2>
      <p>Serás redirigido al inicio de sesión.</p>
    </div>
  );
}
