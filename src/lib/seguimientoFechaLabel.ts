import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";
import { diasDeAtraso, toBusinessDayEpoch, todayBusinessDayEpoch } from "./seguimientoFecha";

/**
 * Etiqueta relativa en español para mostrar junto a un seguimiento (solo UI,
 * cliente). Usa date-fns — por eso vive separado de ./seguimientoFecha.ts,
 * que sí se importa desde convex/seguimientos.ts y debe quedarse solo con
 * `Date`/`Intl` nativos.
 */
/**
 * Etiqueta de "último contacto" para una fila de cliente (WUA-9): a diferencia
 * de `etiquetaFechaRelativa` (fechas futuras de seguimiento, "Vence"/"Venció"),
 * esta es siempre sobre el pasado, así que no necesita esos casos.
 */
export function etiquetaUltimoContacto(fecha: number, hoy: number = todayBusinessDayEpoch()): string {
  const dias = diasDeAtraso(fecha, hoy);
  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Ayer";
  return `Hace ${dias} días`;
}

export function etiquetaFechaRelativa(fechaProgramada: number, hoy: number = todayBusinessDayEpoch()): string {
  const dias = diasDeAtraso(fechaProgramada, hoy);
  if (dias === 0) return "Vence hoy";
  if (dias === 1) return "Venció ayer";
  if (dias > 1) return `Venció hace ${dias} días`;
  if (dias === -1) return "Vence mañana";
  return formatDistanceToNowStrict(toBusinessDayEpoch(fechaProgramada), {
    addSuffix: true,
    locale: es,
  });
}
