import { v } from "convex/values";
import { mutation, query } from "./functions";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx } from "./_generated/server";
import { requireTrimmed } from "./validation";
import { requireUsuarioActual } from "./authGuard";

/** Perfil de `usuarios` del usuario autenticado actual, o `null` si su
 * identidad de Convex Auth no tiene fila de `usuarios` vinculada todavía
 * (no debería pasar tras el seed). Usado por el hook de sesión real (WUA-8). */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) return null;
    return ctx.db
      .query("usuarios")
      .withIndex("by_authId", (q) => q.eq("authId", authUserId))
      .unique();
  },
});

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

/** Añadir usuario al equipo (WUA-59). Solo la propietaria puede gestionar el
 * equipo — verificado aquí, no solo en la UI. La cuenta de acceso real
 * (password) se crea aparte, en el proveedor de auth (ver authId). */
export const create = mutation({
  args: {
    nombre: v.string(),
    email: v.string(),
    rol: v.union(v.literal("propietaria"), v.literal("comercial")),
    authId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const yo = await requireUsuarioActual(ctx);
    if (yo.rol !== "propietaria") {
      throw new Error("Solo la propietaria puede gestionar el equipo");
    }
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
    const yo = await requireUsuarioActual(ctx);
    if (yo.rol !== "propietaria") {
      throw new Error("Solo la propietaria puede gestionar el equipo");
    }
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

/** Eliminar usuario (WUA-59). Reglas: solo la propietaria puede gestionar el
 * equipo; no puedes eliminarte a ti misma; no puede quedar el equipo sin
 * ninguna propietaria. `solicitanteId` se deriva del usuario autenticado, no
 * se acepta como argumento del cliente (antes de WUA-8 era client-trusted). */
export const remove = mutation({
  args: { id: v.id("usuarios") },
  handler: async (ctx, args) => {
    const yo = await requireUsuarioActual(ctx);
    if (yo.rol !== "propietaria") {
      throw new Error("Solo la propietaria puede gestionar el equipo");
    }
    if (args.id === yo._id) {
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
