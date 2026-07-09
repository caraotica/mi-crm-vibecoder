"use client";

import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";

/**
 * TODO(WUA-8): sustituir por la sesión real (Convex Auth / Clerk / etc.)
 * cuando exista login. Mientras tanto, "usuario actual" = un usuario real
 * sembrado en Convex (no un id inventado), para que responsableId/autorId
 * en las mutations sean válidos.
 *
 * Para probar el rol "comercial" (oculta la pestaña Equipo), cambia esta
 * constante al email de Carlos y recarga.
 */
const MOCK_SESSION_EMAIL = "marta@negocio.es";

export function useMockSession() {
  const usuario = useQuery(api.usuarios.getByEmail, { email: MOCK_SESSION_EMAIL });
  return {
    usuario,
    isLoading: usuario === undefined,
    /** El seed (`npx convex run seed:seedDemo`) no se ha corrido todavía. */
    isMissing: usuario === null,
  };
}
