/**
 * El negocio opera en una sola zona horaria (Europe/Madrid). Toda fecha de
 * seguimiento/interacción/venta se representa como epoch de medianoche UTC
 * del día civil elegido — no como un instante real — para que guardar y
 * comparar fechas no dependa de en qué TZ corre el navegador o el servidor.
 * Usar SIEMPRE este helper (tanto en el cliente como en convex/*.ts) en vez
 * de `new Date(ts).setHours(0,0,0,0)`, que sí depende de la TZ local del
 * proceso y puede desclasificar atrasados/próximos cerca de medianoche.
 *
 * Este módulo se importa desde convex/seguimientos.ts (runtime de Convex,
 * no Node/navegador completo) — mantenerlo SOLO con `Date`/`Intl` nativos,
 * sin dependencias como `date-fns`. Las etiquetas de UI que sí necesitan
 * date-fns viven en ./seguimientoFechaLabel.ts, que nunca se importa desde
 * convex/*.ts.
 */
export const BUSINESS_TIMEZONE = "Europe/Madrid";

/** Valor por defecto para un `<input type="date">` — fecha local del navegador, "YYYY-MM-DD". */
export function todayDateInputValue(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Convierte un string "YYYY-MM-DD" (de <input type="date">, sin TZ) a epoch UTC-medianoche. */
export function dateStringToBusinessDayEpoch(dateString: string): number {
  const [y, m, d] = dateString.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Epoch UTC-medianoche del día civil "de hoy" en Europe/Madrid, para un instante dado. */
export function todayBusinessDayEpoch(now: number = Date.now(), tz: string = BUSINESS_TIMEZONE): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(now));
  const y = Number(parts.find((p) => p.type === "year")!.value);
  const m = Number(parts.find((p) => p.type === "month")!.value);
  const d = Number(parts.find((p) => p.type === "day")!.value);
  return Date.UTC(y, m - 1, d);
}

/** Reduce cualquier epoch de seguimiento (medianoche UTC del día civil) al mismo día civil. */
export function toBusinessDayEpoch(epoch: number): number {
  const d = new Date(epoch);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Días de diferencia (positivo = en el pasado) entre una fecha programada y "hoy". */
export function diasDeAtraso(fechaProgramada: number, hoy: number = todayBusinessDayEpoch()): number {
  return Math.round((hoy - toBusinessDayEpoch(fechaProgramada)) / MS_PER_DAY);
}
