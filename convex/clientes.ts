import { v } from "convex/values";
import { mutation, query } from "./functions";
import { requireTrimmed, optionalTrimmed } from "./validation";

const canalOrigenV = v.optional(
  v.union(
    v.literal("web"),
    v.literal("redes"),
    v.literal("email"),
    v.literal("whatsapp"),
  ),
);

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

/** Ficha de cliente (WUA-11). `id` llega como string sin validar desde la URL
 * (ruta dinámica /clientes/[id]) — se usa `normalizeId` en vez de `v.id()`
 * para que un id con formato inválido devuelva `null` (mismo tratamiento que
 * "no encontrado") en vez de lanzar un error de parseo. */
export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("clientes", args.id);
    if (!id) return null;
    return ctx.db.get(id);
  },
});

/** Alta rápida de cliente (WUA-10). Nombre requerido + al menos teléfono o email. */
export const create = mutation({
  args: {
    nombre: v.string(),
    empresa: v.optional(v.string()),
    telefono: v.optional(v.string()),
    email: v.optional(v.string()),
    nota: v.optional(v.string()),
    canalOrigen: canalOrigenV,
  },
  handler: async (ctx, args) => {
    const nombre = requireTrimmed(args.nombre, "el nombre", 120);
    const empresa = optionalTrimmed(args.empresa, "la empresa", 120);
    const telefono = optionalTrimmed(args.telefono, "el teléfono", 40);
    const email = optionalTrimmed(args.email, "el email", 200);
    const nota = optionalTrimmed(args.nota, "la nota", 2000);
    if (!telefono && !email) {
      throw new Error("Añade al menos un teléfono o un email");
    }
    return ctx.db.insert("clientes", {
      nombre,
      empresa,
      telefono,
      email,
      nota,
      canalOrigen: args.canalOrigen,
      estado: "nuevo_lead",
    });
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
    nota: v.optional(v.string()),
    canalOrigen: canalOrigenV,
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
  handler: async (ctx, { id, nombre, empresa, telefono, email, nota, ...rest }) => {
    await ctx.db.patch(id, {
      ...rest,
      ...(nombre !== undefined && { nombre: requireTrimmed(nombre, "el nombre", 120) }),
      ...(empresa !== undefined && { empresa: optionalTrimmed(empresa, "la empresa", 120) }),
      ...(telefono !== undefined && { telefono: optionalTrimmed(telefono, "el teléfono", 40) }),
      ...(email !== undefined && { email: optionalTrimmed(email, "el email", 200) }),
      ...(nota !== undefined && { nota: optionalTrimmed(nota, "la nota", 2000) }),
    });
  },
});
