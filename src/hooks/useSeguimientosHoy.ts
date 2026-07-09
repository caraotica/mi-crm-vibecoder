"use client";

import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";

/**
 * Wrapper compartido de listHoy (WUA-17/18). Convex deduplica la misma
 * query+args entre componentes, así que AppShell (badge de atrasados) y
 * HoyPage (las 3 secciones) pueden usar este hook de forma independiente
 * sin coste doble ni necesidad de context/store.
 */
export function useSeguimientosHoy() {
  const data = useQuery(api.seguimientos.listHoy, {});
  return {
    ...data,
    /** Solo el conteo de atrasados — nunca el total de las tres secciones. */
    atrasadosCount: data?.atrasados.length ?? 0,
    isLoading: data === undefined,
  };
}
