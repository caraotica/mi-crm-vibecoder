import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Historial de interacciones de un cliente, más reciente primero (WUA-11). */
export const listByCliente = query({
  args: { clienteId: v.id("clientes") },
  handler: async (ctx, args) =>
    ctx.db
      .query("interacciones")
      .withIndex("by_cliente", (q) => q.eq("clienteId", args.clienteId))
      .order("desc")
      .collect(),
});

/** Registrar interacción — canal + nota (WUA-12). Actualiza el "último contacto"
 * del cliente indirectamente, ya que la UI ordena por interacción más reciente. */
export const create = mutation({
  args: {
    clienteId: v.id("clientes"),
    canal: v.union(
      v.literal("llamada"),
      v.literal("email"),
      v.literal("whatsapp"),
      v.literal("en_persona"),
    ),
    contenido: v.string(),
    autorId: v.id("usuarios"),
    fecha: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.contenido.trim()) throw new Error("La nota no puede estar vacía");
    return ctx.db.insert("interacciones", {
      ...args,
      fecha: args.fecha ?? Date.now(),
    });
  },
});
