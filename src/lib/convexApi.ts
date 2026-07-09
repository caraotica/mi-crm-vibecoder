/**
 * Re-exporta la API generada de Convex bajo el alias `@/lib/convexApi`, para
 * no tener que contar niveles de `../` desde cada archivo en `src/` hasta
 * `convex/_generated/` (que vive fuera de `src/`, así que el alias `@/*` no
 * lo alcanza directamente).
 */
export { api } from "../../convex/_generated/api";
export type { Id } from "../../convex/_generated/dataModel";
