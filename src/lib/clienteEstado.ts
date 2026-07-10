import type { EstadoCliente } from "@/types";
import type { BadgeStatus } from "@/components/ui/Badge";

/** Color de Badge para cada estado comercial del cliente (WUA-63). */
export const ESTADO_BADGE_STATUS: Record<EstadoCliente, BadgeStatus> = {
  nuevo_lead: "info",
  en_negociacion: "primary",
  pendiente: "warning",
  ganado: "success",
  perdido: "error",
};
