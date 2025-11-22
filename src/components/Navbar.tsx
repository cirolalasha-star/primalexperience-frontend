// src/components/Navbar.tsx

/**
 * · Navegación limpia en desktop
 * · Menú móvil que solo tapa la pantalla cuando está abierto
 * · En función de user.rol aparecen "Panel guía" y "Admin"
 * · Login/Registro si no hay usuario, "Cerrar sesión" si lo hay
 */

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const gold = "#B8860B";
const dark = "#020202";

export default function Navbar() {
  // Estado del menú móvil (abierto/cerrado)
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  // user = usuario actual, logout = función del contexto que limpia token + usuario
  const { user, logout } = useAuth();

  /**
   * Cerrar sesión:
   * · llama a logout() del contexto (que borra token + user)
   * · cierra el menú móvil
   * · navega a la home ("/")
   */
  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  /** Cierra el menú móvil (para usar en varios sitios) */
  const closeMenu = () => setOpen(false);

  /** Estilo base de los links del navbar */
  const linkBase =
    "text-sm font-medium tracking-wide transition-colors hover:text-white";

  /**
   * Links principales (Experiencias, Destinos, Cómo funciona)
   * extraClasses permite adaptar el layout entre desktop y mobile
   */
  const renderMainLinks = (extraClasses = "") => (
    <div className={`flex gap-6 items-center ${extraClasses}`}>
      <NavLink
        to="/experiencias"
        onClick={closeMenu}
        className={({ isActive }) =>
          `${linkBase} ${isActive ? "text-white" : "text-gray-300"}`
        }
      >
        Experiencias
      </NavLink>
      <NavLink
        to="/destinos"
        onClick={closeMenu}
        className={({ isActive }) =>
          `${linkBase} ${isActive ? "text-white" : "text-gray-300"}`
        }
      >
        Destinos
      </NavLink>
      <NavLink
        to="/como-funciona"
        onClick={closeMenu}
        className={({ isActive }) =>
          `${linkBase} ${isActive ? "text-white" : "text-gray-300"}`
        }
      >
        Cómo funciona
      </NavLink>
    </div>
  );

  /**
   * Links visibles para cualquier usuario logueado:
   * · Mis reservas
   * · Mi cuenta
   */
  const renderUserLinks = (extraClasses = "") => {
    if (!user) return null;

    return (
      <div className={`flex gap-4 items-center ${extraClasses}`}>
        <NavLink
          to="/mis-reservas"
          onClick={closeMenu}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? "text-white" : "text-gray-300"}`
          }
        >
          Mis reservas
        </NavLink>
        <NavLink
          to="/mi-cuenta"
          onClick={closeMenu}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? "text-white" : "text-gray-300"}`
          }
        >
          Mi cuenta
        </NavLink>
      </div>
    );
  };

  /**
   * Links según el rol:
   * · "Panel guía" si user.rol === "guia"
   * · "Admin" si user.rol === "admin"
   */
  const renderRoleLinks = (extraClasses = "") => {
    if (!user) return null;

    return (
      <div className={`flex gap-4 items-center ${extraClasses}`}>
        {user.rol === "guia" && (
          <NavLink
            to="/guia/panel"
            onClick={closeMenu}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? "text-white" : "text-gray-300"}`
            }
          >
            Panel guía
          </NavLink>
        )}

        {user.rol === "admin" && (
          <NavLink
            to="/admin/dashboard"
            onClick={closeMenu}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? "text-white" : "text-gray-300"}`
            }
          >
            Admin
          </NavLink>
        )}
      </div>
    );
  };

  return (
    <nav
      className="sticky top-0 z-40 bg-black/90 backdrop-blur border-b"
      style={{ borderColor: gold }}
    >
      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* LOGO (botón que lleva a la home) */}
        <button
          onClick={() => {
            navigate("/");
            closeMenu();
          }}
          className="flex items-center gap-2 text-left"
        >
          <div
            className="w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold"
            style={{ borderColor: gold }}
          >
            PE
          </div>
          <div className="leading-tight">
            <p className="text-xs text-gray-300 uppercase tracking-[0.2em]">
              Ecoturismo responsable
            </p>
            <p className="text-sm md:text-base font-semibold">
              PRIMAL EXPERIENCE
            </p>
          </div>
        </button>

        {/* MENU DESKTOP (≥ md) */}
        <div className="hidden md:flex items-center gap-8">
          {renderMainLinks()}
          {renderUserLinks()}
          {renderRoleLinks()}

          {/* Parte derecha: login/registro o cerrar sesión */}
          {!user ? (
            // Usuario NO logueado
            <div className="flex items-center gap-4">
              <button
                className="text-sm font-medium text-gray-200 hover:text-white"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg"
                style={{ backgroundColor: gold, color: dark }}
                onClick={() => navigate("/registro")}
              >
                Registrarse
              </button>
            </div>
          ) : (
            // Usuario logueado
            <button
              className="text-sm font-medium text-gray-300 hover:text-white"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          )}
        </div>

        {/* BOTÓN MENÚ MOBILE (hamburguesa) */}
        <button
          className="md:hidden inline-flex items-center justify-center w-9 h-9 border rounded-full border-gray-600"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          <span className="w-4 h-[2px] bg-gray-200 block mb-[4px]" />
          <span className="w-4 h-[2px] bg-gray-200 block mb-[4px]" />
          <span className="w-4 h-[2px] bg-gray-200 block" />
        </button>
      </div>

      {/* MENU MOBILE (solo se muestra cuando open === true) */}
      {open && (
        <div className="md:hidden border-t border-[#222] bg-black/95">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4">
            {/* Links principales en columna */}
            {renderMainLinks("flex-col items-start gap-3")}
            {/* Links de usuario y de rol en columna */}
            {renderUserLinks("flex-col items-start gap-2")}
            {renderRoleLinks("flex-col items-start gap-2")}

            {/* Parte inferior: login/registro o cerrar sesión */}
            {!user ? (
              <div className="flex flex-col gap-3 pt-2">
                <button
                  className="text-sm font-medium text-gray-200 text-left"
                  onClick={() => {
                    navigate("/login");
                    closeMenu();
                  }}
                >
                  Login
                </button>
                <button
                  className="px-4 py-2 rounded-full text-sm font-semibold text-left"
                  style={{ backgroundColor: gold, color: dark }}
                  onClick={() => {
                    navigate("/registro");
                    closeMenu();
                  }}
                >
                  Registrarse
                </button>
              </div>
            ) : (
              <button
                className="mt-2 text-sm font-medium text-gray-200 text-left"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
