import { ConvexError } from "convex/values";

/**
 * Error de conflicto de concurrencia (p. ej. `marcarHecho` con
 * `expectedActualizadoEn` desfasado). Se distingue de un error de
 * validación genérico por `error.data.code === "CONFLICT"`, para que el
 * frontend pueda mostrar un toast de "alguien más lo modificó" en vez de
 * un error genérico.
 */
export function conflictError(message: string) {
  return new ConvexError({ code: "CONFLICT" as const, message });
}
