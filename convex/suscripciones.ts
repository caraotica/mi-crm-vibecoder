import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * ⚠️ Bloqueado por un gap de diseño (ver Linear WUA-15/WUA-64): el prototipo
 * de la Fase 0 no incluye las pantallas de "Registrar suscripción" ni las de
 * alerta de renovación/impago. Estas funciones cubren el modelo de datos del
 * PRD para que el resto del backend pueda avanzar, pero la UI que las llama
 * todavía no está diseñada.
 */

/** Suscripciones de un cliente (ficha, WUA-16). */
export const listByCliente = query({
  args: { clienteId: v.id("clientes") },
  handler: async (ctx, args) =>
    ctx.db
      .query("suscripciones")
      .withIndex("by_cliente", (q) => q.eq("clienteId", args.clienteId))
      .collect(),
});

/** Suscripciones activas cuyo próximo cobro está a `diasAntes` días o menos
 * (usada por la generación automática de alertas de renovación, WUA-20). */
export const proximasARenovar = query({
  args: { diasAntes: v.number() },
  handler: async (ctx, args) => {
    const limite = Date.now() + args.diasAntes * 24 * 60 * 60 * 1000;
    return ctx.db
      .query("suscripciones")
      .withIndex("by_estado_proximoCobro", (q) => q.eq("estado", "activa"))
      .filter((q) => q.lte(q.field("fechaProximoCobro"), limite))
      .collect();
  },
});

/** Registrar suscripción activa (WUA-15 — pendiente de diseño, WUA-64). */
export const create = mutation({
  args: {
    clienteId: v.id("clientes"),
    producto: v.string(),
    monto: v.number(),
    frecuencia: v.union(
      v.literal("mensual"),
      v.literal("trimestral"),
      v.literal("anual"),
    ),
    fechaInicio: v.number(),
    fechaProximoCobro: v.number(),
  },
  handler: async (ctx, args) => {
    if (!args.producto.trim()) throw new Error("Falta el producto/servicio");
    if (!(args.monto > 0)) throw new Error("El importe debe ser mayor que 0");
    return ctx.db.insert("suscripciones", { ...args, estado: "activa" });
  },
});

/** Marcar pago fallido / cancelar (WUA-21 — pendiente de diseño, WUA-64). */
export const updateEstado = mutation({
  args: {
    id: v.id("suscripciones"),
    estado: v.union(v.literal("pago_fallido"), v.literal("cancelada")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { estado: args.estado });
  },
});

/** Tras marcar como hecha la alerta de renovación, adelantar el próximo cobro
 * según la frecuencia (WUA-22). */
export const avanzarProximoCobro = mutation({
  args: { id: v.id("suscripciones") },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.id);
    if (!sub) return;
    const dias = { mensual: 30, trimestral: 91, anual: 365 }[sub.frecuencia];
    await ctx.db.patch(args.id, {
      fechaProximoCobro: sub.fechaProximoCobro + dias * 24 * 60 * 60 * 1000,
    });
  },
});
