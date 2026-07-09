import { v } from "convex/values";
import { mutation, query } from "./functions";
import { todayBusinessDayEpoch, toBusinessDayEpoch } from "../src/lib/seguimientoFecha";
import { requireTrimmed } from "./validation";
import { conflictError } from "./errors";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

/** Comparador estable: por fecha programada, con _creationTime como desempate. */
function byFechaThenCreacion(
  a: { fechaProgramada: number; _creationTime: number },
  b: { fechaProgramada: number; _creationTime: number },
) {
  return a.fechaProgramada - b.fechaProgramada || a._creationTime - b._creationTime;
}

/** La pantalla Hoy necesita nombre/estado del cliente y nombre del
 * responsable junto a cada seguimiento — se resuelven aquí (en vez de que
 * el frontend haga listas aparte y las cruce) porque es una query pequeña,
 * de un puñado de pendientes, no un listado grande. */
async function enrich(ctx: QueryCtx, seguimiento: Doc<"seguimientos">) {
  const [cliente, responsable] = await Promise.all([
    ctx.db.get(seguimiento.clienteId),
    ctx.db.get(seguimiento.responsableId),
  ]);
  return {
    ...seguimiento,
    clienteNombre: cliente?.nombre ?? "Cliente eliminado",
    clienteEstado: cliente?.estado ?? ("nuevo_lead" as const),
    responsableNombre: responsable?.nombre ?? "—",
  };
}

/** Pantalla "Hoy" (WUA-17/18): atrasados / para hoy / próximas, pendientes de completar.
 * "Hoy" se calcula en la zona horaria única del negocio (Europe/Madrid, ver
 * src/lib/seguimientoFecha.ts) para que no dependa de la TZ del proceso del servidor. */
export const listHoy = query({
  args: {},
  handler: async (ctx) => {
    const pendientes = await ctx.db
      .query("seguimientos")
      .withIndex("by_completado_fecha", (q) => q.eq("completado", false))
      .collect();
    const hoy = todayBusinessDayEpoch();
    const atrasados = pendientes.filter((s) => toBusinessDayEpoch(s.fechaProgramada) < hoy);
    const paraHoy = pendientes.filter((s) => toBusinessDayEpoch(s.fechaProgramada) === hoy);
    const proximas = pendientes
      .filter((s) => toBusinessDayEpoch(s.fechaProgramada) > hoy)
      .sort(byFechaThenCreacion);
    atrasados.sort(byFechaThenCreacion);
    return {
      atrasados: await Promise.all(atrasados.map((s) => enrich(ctx, s))),
      paraHoy: await Promise.all(paraHoy.map((s) => enrich(ctx, s))),
      proximas: await Promise.all(proximas.map((s) => enrich(ctx, s))),
    };
  },
});

/** Seguimientos pendientes de un cliente (ficha, WUA-11). */
export const listByCliente = query({
  args: { clienteId: v.id("clientes") },
  handler: async (ctx, args) =>
    ctx.db
      .query("seguimientos")
      .withIndex("by_cliente", (q) => q.eq("clienteId", args.clienteId))
      .collect(),
});

/** Programar seguimiento (WUA-19) / Nueva tarea desde Hoy (WUA-62). */
export const create = mutation({
  args: {
    clienteId: v.id("clientes"),
    descripcion: v.string(),
    responsableId: v.id("usuarios"),
    fechaProgramada: v.number(),
    origen: v.optional(v.union(v.literal("manual"), v.literal("sistema"))),
  },
  handler: async (ctx, args) => {
    const descripcion = requireTrimmed(args.descripcion, "la descripción de la tarea", 2000);
    return ctx.db.insert("seguimientos", {
      ...args,
      descripcion,
      origen: args.origen ?? "manual",
      completado: false,
      actualizadoEn: Date.now(),
    });
  },
});

/** Marcar como hecho, con deshacer (WUA-22).
 *
 * `expectedActualizadoEn` protege contra "lost update" de forma robusta
 * frente a ABA: un booleano `expectedCompletado` no detectaría un ciclo
 * true→false→true hecho por otra persona (el booleano volvería a coincidir
 * con lo que el cliente original esperaba). `actualizadoEn` es un timestamp
 * que cambia en CADA escritura, así que un ciclo ABA sí se detecta: si el
 * valor no coincide exactamente con el que el cliente observó por última
 * vez, se rechaza en vez de sobrescribir silenciosamente.
 *
 * No actualiza aún la renovación de suscripción — eso se conecta cuando
 * exista WUA-15/WUA-64. */
export const marcarHecho = mutation({
  args: {
    id: v.id("seguimientos"),
    completado: v.boolean(),
    expectedActualizadoEn: v.number(),
  },
  handler: async (ctx, args) => {
    const actual = await ctx.db.get(args.id);
    if (!actual) throw new Error("El seguimiento ya no existe");
    if (actual.actualizadoEn !== args.expectedActualizadoEn) {
      throw conflictError("Este seguimiento ya fue modificado por otra persona");
    }
    const actualizadoEn = Date.now();
    await ctx.db.patch(args.id, {
      completado: args.completado,
      fechaCompletado: args.completado ? actualizadoEn : undefined,
      actualizadoEn,
    });
    // Se devuelve el nuevo token de versión para que un "Deshacer" posterior
    // (u otra marcación) pueda encadenar expectedActualizadoEn correctamente.
    return { actualizadoEn };
  },
});
