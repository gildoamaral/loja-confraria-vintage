import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function ProtectedLayout({ adminOnly = false }) {
  const [loading, setLoading] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    async function verificar() {
      try {
        await api.get("/usuarios/conta");
        if (adminOnly) {
          const adminRes = await api.get("/usuarios/admin");
          setAutorizado(adminRes.data?.isAdmin === true);
        } else {
          setAutorizado(true);
        }
      } catch {
        setAutorizado(false);
      } finally {
        setLoading(false);
      }
    }
    verificar();
  }, [adminOnly]);

  if (loading) return null; // ou um spinner

  return autorizado ? <Outlet /> : <Navigate to="/" replace />;
}