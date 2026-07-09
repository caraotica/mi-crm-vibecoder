"use client";

import { useQuery } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { api } from "@/lib/convexApi";

/**
 * WUA-8: sesión real sobre Convex Auth. Mismo shape que la sesión mock
 * anterior (`{usuario, isLoading}`) para minimizar cambios en los sitios que
 * ya la consumían (AppShell, formularios de overlay).
 */
export function useUsuarioActual() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const usuario = useQuery(api.usuarios.getCurrent, isAuthenticated ? {} : "skip");
  return {
    usuario,
    isAuthenticated,
    isLoading: authLoading || (isAuthenticated && usuario === undefined),
  };
}
