import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const startOfDay = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Pantalla "Hoy" (WUA-17): atrasados / para hoy / próximas, pendientes de completar. */
export const listHoy = query({
  args: {},
  handler: async (ctx) => {
    const pendientes = await ctx.db
      .query("seguimientos")
      .withIndex("by_completado_fecha", (q) => q.eq("completado", false))
      .collect();
    const hoy = startOfDay(Date.now());
    const atrasados = pendientes.filter((s) => s.fechaProgramada < hoy);
    const paraHoy = pendientes.filter((s) => startOfDay(s.fechaProgramada) === hoy);
    const proximas = pendientes
      .filter((s) => s.fechaProgramada > hoy)
      .sort((a, b) => a.fechaProgramada - b.fechaProgramada);
    atrasados.sort((a, b) => a.fechaProgramada - b.fechaProgramada);
    return { atrasados, paraHoy, proximas };
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
    if (!args.descripcion.trim()) throw new Error("Falta describir la tarea");
    return ctx.db.insert("seguimientos", {
      ...args,
      origen: args.origen ?? "manual",
      completado: false,
    });
  },
});

/** Marcar como hecho, con deshacer (WUA-22). No actualiza aún la renovación de
 * suscripción — eso se conecta cuando exista WUA-15/WUA-64. */
export const marcarHecho = mutation({
  args: { id: v.id("seguimientos"), completado: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      completado: args.completado,
      fechaCompletado: args.completado ? Date.now() : undefined,
    });
  },
});
