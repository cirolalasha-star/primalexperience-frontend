// src/router/AppRouter.tsx
import { Routes, Route } from "react-router-dom";

// 🧱 Layouts principales
import PublicLayout from "../layouts/PublicLayout";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
// (GuideLayout lo usaremos más adelante cuando tengamos las páginas de guía)
// import GuideLayout from "../layouts/GuideLayout";

// 🌍 Páginas públicas que YA tenemos
import Home from "../pages/Home";
import Login from "../pages/Login";
import Registro from "../pages/Registro";
import Experiencias from "../pages/Experiencias";
import ExperienciaDetalle from "../pages/ExperienciaDetalle";

// 👤 Área usuario
import MiCuenta from "../pages/MiCuenta";
import MisReservas from "../pages/MisReservas";
// (cuando tengas la página, la activas)
// import Favoritos from "../pages/Favoritos";


// 🛠 Área admin
import DashboardAdmin from "../pages/admin/DashboardAdmin";
// (cuando tengas estas páginas, las importas y añades rutas)
// import AdminExperiencias from "../pages/admin/AdminExperiencias";
// import AdminReservas from "../pages/admin/AdminReservas";
// import AdminUsuarios from "../pages/admin/AdminUsuarios";
// import AdminContenido from "../pages/admin/AdminContenido";

// (cuando crees estas páginas, las vamos añadiendo poco a poco al router)
// import Destinos from "../pages/Destinos";
// import DestinoDetalle from "../pages/DestinoDetalle";
// import ComoFunciona from "../pages/ComoFunciona";
// import Impacto from "../pages/Impacto";
// import Blog from "../pages/Blog";
// import BlogDetalle from "../pages/BlogDetalle";
// import Contacto from "../pages/Contacto";
// import NotFound from "../pages/NotFound";

export default function AppRouter() {
  return (
    <Routes>
      {/* 🌐 RUTAS PÚBLICAS (sin login) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route path="/experiencias" element={<Experiencias />} />
        {/* 🔴 IMPORTANTE: usamos :id porque en ExperienciaDetalle haces const { id } = useParams() */}
        <Route path="/experiencias/:id" element={<ExperienciaDetalle />} />

        {/* Cuando tengas estas páginas creadas, descomentas sus rutas */}
        {/*
        <Route path="/destinos" element={<Destinos />} />
        <Route path="/destinos/:slug" element={<DestinoDetalle />} />

        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/impacto" element={<Impacto />} />

        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetalle />} />

        <Route path="/contacto" element={<Contacto />} />
        <Route path="*" element={<NotFound />} />
        */}
      </Route>

      {/* 👤 ÁREA DE USUARIO (requiere login, se protege en UserLayout) */}
      <Route element={<UserLayout />}>
        <Route path="/mi-cuenta" element={<MiCuenta />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
        {/* <Route path="/favoritos" element={<Favoritos />} /> */}
      </Route>

      {/* 🧭 ÁREA GUÍA – la activamos cuando tengas las páginas hechas */}
      {/*
      <Route path="/guia" element={<GuideLayout />}>
        <Route path="panel" element={<GuiaPanel />} />
        <Route path="experiencias" element={<GuiaExperiencias />} />
        <Route path="ingresos" element={<GuiaIngresos />} />
      </Route>
      */}

      {/* 🛠 ÁREA ADMIN */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardAdmin />} />
        {/*
        <Route path="experiencias" element={<AdminExperiencias />} />
        <Route path="reservas" element={<AdminReservas />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="contenido" element={<AdminContenido />} />
        */}
      </Route>
    </Routes>
  );
}
