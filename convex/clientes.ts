import { v } from "convex/values";
import { mutation, query } from "./functions";
import { requireTrimmed, optionalTrimmed } from "./validation";
import type { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

const canalOrigenV = v.optional(
  v.union(
    v.literal("web"),
    v.literal("redes"),
    v.literal("email"),
    v.literal("whatsapp"),
  ),
);

const MARCA_DIACRITICA_DESDE = 0x300; // U+0300, inicio del bloque Unicode "Combining Diacritical Marks"
const MARCA_DIACRITICA_HASTA = 0x36f; // U+036F, fin de ese bloque

/** Minúsculas + sin diacríticos, para que la búsqueda ignore acentos ("jose" encuentra "José"). */
function normalizar(texto: string): string {
  return Array.from(texto.toLowerCase().normalize("NFD"))
    .filter((ch) => {
      const code = ch.codePointAt(0)!;
      return code < MARCA_DIACRITICA_DESDE || code > MARCA_DIACRITICA_HASTA;
    })
    .join("");
}

/** Fecha de la interacción más reciente del cliente, o su alta si no tiene ninguna (WUA-9). */
async function ultimoContacto(ctx: QueryCtx, cliente: Doc<"clientes">): Promise<number> {
  const ultima = await ctx.db
    .query("interacciones")
    .withIndex("by_cliente", (q) => q.eq("clienteId", cliente._id))
    .order("desc")
    .first();
  return ultima?.fecha ?? cliente._creationTime;
}

/** Lista de clientes con búsqueda en vivo por nombre, teléfono o email (WUA-9). */
export const list = query({
  args: { query: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const clientes = await ctx.db.query("clientes").order("desc").collect();
    const q = normalizar((args.query ?? "").trim());
    const filtrados = q
      ? clientes.filter((c) =>
          [c.nombre, c.telefono, c.email]
            .filter(Boolean)
            .some((field) => normalizar(field!).includes(q)),
        )
      : clientes;
    return Promise.all(
      filtrados.map(async (c) => ({ ...c, ultimoContacto: await ultimoContacto(ctx, c) })),
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

/** Datos completos de la ficha de cliente (WUA-11): el cliente, sus
 * seguimientos pendientes y el historial combinado (interacciones + ventas +
 * seguimientos completados), todo enriquecido con nombres de responsable/autor
 * para que el frontend no tenga que cruzar 4 listas él mismo — mismo criterio
 * que `seguimientos.listHoy`. */
export const getFicha = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("clientes", args.id);
    if (!id) return null;
    const cliente = await ctx.db.get(id);
    if (!cliente) return null;

    const [seguimientos, interacciones, ventas, suscripciones] = await Promise.all([
      ctx.db.query("seguimientos").withIndex("by_cliente", (q) => q.eq("clienteId", id)).collect(),
      ctx.db.query("interacciones").withIndex("by_cliente", (q) => q.eq("clienteId", id)).collect(),
      ctx.db.query("ventasPuntuales").withIndex("by_cliente", (q) => q.eq("clienteId", id)).collect(),
      ctx.db.query("suscripciones").withIndex("by_cliente", (q) => q.eq("clienteId", id)).collect(),
    ]);

    const usuarioIds = new Set<Id<"usuarios">>();
    for (const s of seguimientos) usuarioIds.add(s.responsableId);
    for (const i of interacciones) usuarioIds.add(i.autorId);
    for (const v of ventas) usuarioIds.add(v.autorId);
    const usuarios = await Promise.all([...usuarioIds].map((uid) => ctx.db.get(uid)));
    const nombrePorUsuario = new Map(
      usuarios.filter((u): u is Doc<"usuarios"> => u !== null).map((u) => [u._id, u.nombre]),
    );
    const nombreDe = (uid: Id<"usuarios">) => nombrePorUsuario.get(uid) ?? "—";

    const seguimientosPendientes = seguimientos
      .filter((s) => !s.completado)
      .map((s) => ({ ...s, responsableNombre: nombreDe(s.responsableId) }))
      .sort((a, b) => a.fechaProgramada - b.fechaProgramada);

    const historial = [
      ...seguimientos
        .filter((s) => s.completado)
        .map((s) => ({
          tipo: "seguimiento_completado" as const,
          id: s._id,
          fecha: s.fechaCompletado ?? s.actualizadoEn,
          descripcion: s.descripcion,
          responsableNombre: nombreDe(s.responsableId),
        })),
      ...interacciones.map((i) => ({
        tipo: "interaccion" as const,
        id: i._id,
        fecha: i.fecha,
        canal: i.canal,
        contenido: i.contenido,
        autorNombre: nombreDe(i.autorId),
      })),
      ...ventas.map((v) => ({
        tipo: "venta" as const,
        id: v._id,
        fecha: v.fecha,
        producto: v.producto,
        monto: v.monto,
        estado: v.estado,
        autorNombre: nombreDe(v.autorId),
      })),
      ...suscripciones.map((sus) => ({
        tipo: "suscripcion" as const,
        id: sus._id,
        fecha: sus.fechaInicio,
        producto: sus.producto,
        monto: sus.monto,
        frecuencia: sus.frecuencia,
        fechaProximoCobro: sus.fechaProximoCobro,
        estado: sus.estado,
      })),
    ].sort((a, b) => b.fecha - a.fecha);

    return { cliente, seguimientosPendientes, historial };
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
