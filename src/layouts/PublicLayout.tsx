// src/layouts/PublicLayout.tsx
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
