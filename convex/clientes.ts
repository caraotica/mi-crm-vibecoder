import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Lista de clientes con búsqueda en vivo por nombre, teléfono o email (WUA-9). */
export const list = query({
  args: { query: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const clientes = await ctx.db.query("clientes").order("desc").collect();
    const q = (args.query ?? "").trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter((c) =>
      [c.nombre, c.telefono, c.email]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  },
});

/** Ficha de cliente (WUA-11). */
export const get = query({
  args: { id: v.id("clientes") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

/** Alta rápida de cliente (WUA-10). Nombre requerido + al menos teléfono o email. */
export const create = mutation({
  args: {
    nombre: v.string(),
    empresa: v.optional(v.string()),
    telefono: v.optional(v.string()),
    email: v.optional(v.string()),
    canalOrigen: v.optional(
      v.union(
        v.literal("web"),
        v.literal("redes"),
        v.literal("email"),
        v.literal("whatsapp"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    if (!args.nombre.trim()) throw new Error("El nombre es obligatorio");
    if (!args.telefono?.trim() && !args.email?.trim()) {
      throw new Error("Añade al menos un teléfono o un email");
    }
    return ctx.db.insert("clientes", { ...args, estado: "nuevo_lead" });
  },
});

/** Editar cliente (mismo formulario que el alta, WUA-10) o cambiar su estado (WUA-63). */
export const update = mutation({
  args: {
    id: v.id("clientes"),
    nombre: v.optional(v.string()),
    empresa: v.optional(v.string()),
    telefono: v.optional(v.string()),
    email: v.optional(v.string()),
    canalOrigen: v.optional(
      v.union(
        v.literal("web"),
        v.literal("redes"),
        v.literal("email"),
        v.literal("whatsapp"),
      ),
    ),
    estado: v.optional(
      v.union(
        v.literal("nuevo_lead"),
        v.literal("en_negociacion"),
        v.literal("pendiente"),
        v.literal("ganado"),
        v.literal("perdido"),
      ),
    ),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});
