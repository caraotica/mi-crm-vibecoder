import { v } from "convex/values";
import { mutation, query } from "./functions";
import { requireTrimmed, requirePositiveAmount } from "./validation";
import { requireUsuarioActual } from "./authGuard";
import type { Doc } from "./_generated/dataModel";

const estadoV = v.union(
  v.literal("abierta"),
  v.literal("ganada"),
  v.literal("perdida"),
);

/** Comparador estable: por fecha desc, con _creationTime como desempate. */
function byFechaDesc(a: Doc<"ventasPuntuales">, b: Doc<"ventasPuntuales">) {
  return b.fecha - a.fecha || b._creationTime - a._creationTime;
}

/** Pantalla "Ventas" (WUA-61): lista agregada, filtrable por estado, con el
 * nombre del cliente ya resuelto (para no cruzar listas en el frontend, mismo
 * criterio que `clientes.getFicha`/`seguimientos.listHoy`). */
export const list = query({
  args: { estado: v.optional(estadoV) },
  handler: async (ctx, args) => {
    const ventas = args.estado
      ? await ctx.db
          .query("ventasPuntuales")
          .withIndex("by_estado", (q) => q.eq("estado", args.estado!))
          .collect()
      : await ctx.db.query("ventasPuntuales").collect();

    const clientes = await Promise.all(
      [...new Set(ventas.map((v) => v.clienteId))].map((id) => ctx.db.get(id)),
    );
    const nombrePorCliente = new Map(
      clientes.filter((c): c is Doc<"clientes"> => c !== null).map((c) => [c._id, c.nombre]),
    );

    return ventas
      .sort(byFechaDesc)
      .map((v) => ({ ...v, clienteNombre: nombrePorCliente.get(v.clienteId) ?? "Cliente eliminado" }));
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

/** Registrar venta puntual / oportunidad (WUA-14). `autorId` se deriva
 * siempre del usuario autenticado (no es un argumento del cliente). */
export const create = mutation({
  args: {
    clienteId: v.id("clientes"),
    producto: v.string(),
    monto: v.number(),
    estado: estadoV,
    fecha: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const producto = requireTrimmed(args.producto, "el producto/concepto", 120);
    const monto = requirePositiveAmount(args.monto, "el importe");
    const autorId = (await requireUsuarioActual(ctx))._id;
    return ctx.db.insert("ventasPuntuales", {
      ...args,
      producto,
      monto,
      autorId,
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
