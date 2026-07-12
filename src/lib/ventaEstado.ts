import type { EstadoVenta } from "@/types";
import type { BadgeStatus } from "@/components/ui/Badge";

/** Color de Badge para cada estado de una venta puntual (historial de la ficha, WUA-16; pantalla Ventas, WUA-61). */
export const ESTADO_VENTA_BADGE_STATUS: Record<EstadoVenta, BadgeStatus> = {
  abierta: "info",
  ganada: "success",
  perdida: "error",
};
