import { v } from "convex/values";
import { mutation, query } from "./functions";
import { requireTrimmed } from "./validation";
import { requireUsuarioActual } from "./authGuard";

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

/** Registrar interacción — canal + nota (WUA-12). `autorId` se deriva
 * siempre del usuario autenticado (no es un argumento del cliente) — así es
 * como el diseño siempre quiso que funcionara ("autor automático = usuario
 * actual"), solo era imposible sin sesión real (WUA-8). Actualiza el
 * "último contacto" del cliente indirectamente, ya que la UI ordena por
 * interacción más reciente. */
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
    fecha: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const contenido = requireTrimmed(args.contenido, "la nota", 2000);
    const autorId = (await requireUsuarioActual(ctx))._id;
    return ctx.db.insert("interacciones", {
      ...args,
      contenido,
      autorId,
      fecha: args.fecha ?? Date.now(),
    });
  },
});
