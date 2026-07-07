import type { Rol } from "@/types";

export interface Session {
  user: { id: string; nombre: string; email: string; rol: Rol };
}

/**
 * TEMPORAL — placeholder mientras no existe autenticación real (Linear WUA-8).
 * Sustituir por la sesión real (Convex Auth / Clerk / etc.) cuando se
 * implemente el login. No usar este mock más allá de la fase de scaffolding.
 */
export function getMockSession(): Session {
  return {
    user: {
      id: "mock-marta",
      nombre: "Marta López",
      email: "marta@negocio.es",
      rol: "propietaria",
    },
  };
}
