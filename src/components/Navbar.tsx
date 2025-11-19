// src/components/Navbar.tsx
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// 🎨 Colores corporativos
const gold = "#B8860B";
const dark = "#1A1A1A";

export default function Navbar() {
  // ⛑️ El contexto puede ser null → lo validamos
  const auth = useContext(AuthContext);
  if (!auth) return null; // evita errores de TS al desestructurar

  const { user, logout } = auth;
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        background: dark,
        color: "white",
        padding: "0.7rem 1.2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `2px solid ${gold}`,
      }}
    >
      {/* 🦅 LOGO + NOMBRE */}
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          color: "white",
          fontSize: "1.2rem",
          fontWeight: 700,
        }}
      >
        <img
          src="/logo-primal.png"
          alt="Primal Experience"
          style={{ width: 40, marginRight: 10 }}
        />
        PRIMAL EXPERIENCE
      </Link>

      {/* 📱 Botón hamburguesa móvil */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          fontSize: "1.5rem",
          background: "none",
          color: "white",
          border: "none",
          display: "none",
        }}
        className="menu-btn"
      >
        ☰
      </button>

      {/* 🔗 Menú principal */}
      <ul
        className={`menu ${open ? "open" : ""}`}
        style={{
          listStyle: "none",
          display: "flex",
          gap: "1.5rem",
          alignItems: "center",
          margin: 0,
        }}
      >
        <li>
          <Link to="/tours" style={{ color: "white", textDecoration: "none" }}>
            Experiencias
          </Link>
        </li>

        <li>
          <Link to="/destinos" style={{ color: "white", textDecoration: "none" }}>
            Destinos
          </Link>
        </li>

        <li>
          <Link
            to="/como-funciona"
            style={{ color: "white", textDecoration: "none" }}
          >
            Cómo funciona
          </Link>
        </li>

        {/* 👤 Zona autenticada */}
        {user ? (
          <>
            {/* 🔥 Roles */}
            {user.rol === "admin" && (
              <li>
                <Link
                  to="/admin/dashboard"
                  style={{ color: gold, textDecoration: "none" }}
                >
                  Admin
                </Link>
              </li>
            )}

            {user.rol === "guia" && (
              <li>
                <Link
                  to="/guia/panel"
                  style={{ color: gold, textDecoration: "none" }}
                >
                  Panel Guía
                </Link>
              </li>
            )}

            <li>
              <Link
                to="/mi-cuenta"
                style={{ color: "white", textDecoration: "none" }}
              >
                Mi Cuenta
              </Link>
            </li>

            <li>
              <button
                onClick={logout}
                style={{
                  background: gold,
                  border: "none",
                  color: dark,
                  padding: "0.3rem 0.8rem",
                  fontWeight: 600,
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                to="/login"
                style={{ color: gold, textDecoration: "none", fontWeight: 600 }}
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/registro"
                style={{
                  background: gold,
                  color: dark,
                  padding: "0.3rem 0.8rem",
                  borderRadius: 4,
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Registrarse
              </Link>
            </li>
          </>
        )}
      </ul>

      {/* 📱 Responsive */}
      <style>
        {`
          @media (max-width: 768px) {
            .menu-btn {
              display: block !important;
            }
            .menu {
              position: absolute;
              top: 60px;
              right: 0;
              background: ${dark};
              width: 70%;
              flex-direction: column;
              padding: 1rem;
              border-left: 2px solid ${gold};
              display: none;
            }
            .menu.open {
              display: flex;
            }
          }
        `}
      </style>
    </nav>
  );
}
