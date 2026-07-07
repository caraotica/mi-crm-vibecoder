import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const estadoV = v.union(
  v.literal("abierta"),
  v.literal("ganada"),
  v.literal("perdida"),
);

/** Pantalla "Ventas" (WUA-61): lista agregada, filtrable por estado. */
export const list = query({
  args: { estado: v.optional(estadoV) },
  handler: async (ctx, args) => {
    const ventas = args.estado
      ? await ctx.db
          .query("ventasPuntuales")
          .withIndex("by_estado", (q) => q.eq("estado", args.estado!))
          .collect()
      : await ctx.db.query("ventasPuntuales").collect();
    return ventas.sort((a, b) => b.fecha - a.fecha);
  },
});

/** Ventas de un cliente (ficha, WUA-16). */
export const listByCliente = query({
  args: { clienteId: v.id("clientes") },
  handler: async (ctx, args) =>
    ctx.db
      .query("ventasPuntuales")
      .withIndex("by_cliente", (q) => q.eq("clienteId", args.clienteId))
      .collect(),
});

/** Registrar venta puntual / oportunidad (WUA-14). */
export const create = mutation({
  args: {
    clienteId: v.id("clientes"),
    producto: v.string(),
    monto: v.number(),
    estado: estadoV,
    fecha: v.optional(v.number()),
    autorId: v.id("usuarios"),
  },
  handler: async (ctx, args) => {
    if (!args.producto.trim()) throw new Error("Falta el producto/concepto");
    if (!(args.monto > 0)) throw new Error("El importe debe ser mayor que 0");
    return ctx.db.insert("ventasPuntuales", {
      ...args,
      fecha: args.fecha ?? Date.now(),
    });
  },
});

/** Cambiar el estado de una venta (Oportunidad abierta → Ganada/Perdida). */
export const updateEstado = mutation({
  args: { id: v.id("ventasPuntuales"), estado: estadoV },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { estado: args.estado });
  },
});
