import type { Id } from "@/lib/convexApi";
import type { NuevaTareaDraft } from "@/components/overlays/NuevaTareaForm";

/** Máquina de estado de los overlays de Hoy (WUA-17/62). El caso "cliente"
 * con `returnTo` modela el flujo anidado "+ Nuevo cliente" desde "Nueva
 * tarea": al cerrar o guardar, se vuelve a "tarea" con el draft preservado
 * (y el cliente recién creado preseleccionado, si se guardó). */
export type OverlayState =
  | { kind: null }
  | { kind: "tarea"; draft?: NuevaTareaDraft }
  | { kind: "interaccion" }
  | { kind: "venta" }
  | { kind: "cliente"; returnTo?: { draft: NuevaTareaDraft } };

type ClienteOverlay = Extract<OverlayState, { kind: "cliente" }>;

/** Transición al cerrar/cancelar el overlay "Nuevo cliente". */
export function closeClienteOverlay(overlay: ClienteOverlay): OverlayState {
  return overlay.returnTo ? { kind: "tarea", draft: overlay.returnTo.draft } : { kind: null };
}

/** Transición al guardar un cliente nuevo desde dentro de "Nuevo cliente". */
export function clienteCreatedOverlay(overlay: ClienteOverlay, id: Id<"clientes">): OverlayState {
  return overlay.returnTo
    ? { kind: "tarea", draft: { ...overlay.returnTo.draft, clienteId: id } }
    : { kind: null };
}
