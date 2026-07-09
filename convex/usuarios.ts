import { v } from "convex/values";
import { mutation, query } from "./functions";
import type { MutationCtx } from "./_generated/server";
import { requireTrimmed } from "./validation";

/** Lista de usuarios para la pantalla Equipo (WUA-59, solo rol propietaria). */
export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("usuarios").collect(),
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("usuarios")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique(),
});

/** Añadir usuario al equipo (WUA-59). La cuenta de acceso real (password) se
 * crea en el proveedor de auth — PUNTO DE INTEGRACIÓN, ver authId. */
export const create = mutation({
  args: {
    nombre: v.string(),
    email: v.string(),
    rol: v.union(v.literal("propietaria"), v.literal("comercial")),
    authId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const nombre = requireTrimmed(args.nombre, "el nombre", 120);
    const email = requireTrimmed(args.email, "el email", 200);
    const existente = await ctx.db
      .query("usuarios")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existente) throw new Error("Ya existe un usuario con ese email");
    return ctx.db.insert("usuarios", { ...args, nombre, email });
  },
});

export const update = mutation({
  args: {
    id: v.id("usuarios"),
    nombre: v.optional(v.string()),
    email: v.optional(v.string()),
    rol: v.optional(v.union(v.literal("propietaria"), v.literal("comercial"))),
  },
  handler: async (ctx, { id, nombre, email, ...rest }) => {
    if (rest.rol === "comercial") {
      await assertQuedaUnaPropietaria(ctx, id);
    }
    await ctx.db.patch(id, {
      ...rest,
      ...(nombre !== undefined && { nombre: requireTrimmed(nombre, "el nombre", 120) }),
      ...(email !== undefined && { email: requireTrimmed(email, "el email", 200) }),
    });
  },
});

/** Eliminar usuario (WUA-59). Reglas: no puedes eliminarte a ti misma, y no
 * puede quedar el equipo sin ninguna propietaria — se validan aquí porque son
 * invariantes de datos, no solo de UI. */
export const remove = mutation({
  args: { id: v.id("usuarios"), solicitanteId: v.id("usuarios") },
  handler: async (ctx, args) => {
    if (args.id === args.solicitanteId) {
      throw new Error("No puedes eliminar tu propia cuenta");
    }
    await assertQuedaUnaPropietaria(ctx, args.id);
    await ctx.db.delete(args.id);
  },
});

async function assertQuedaUnaPropietaria(ctx: MutationCtx, idAExcluir: string) {
  const usuarios = await ctx.db.query("usuarios").collect();
  const otrasPropietarias = usuarios.filter(
    (u) => u.rol === "propietaria" && u._id !== idAExcluir,
  );
  if (otrasPropietarias.length === 0) {
    throw new Error("Debe quedar al menos una propietaria en el equipo");
  }
}
