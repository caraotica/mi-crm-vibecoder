import { v } from "convex/values";
import { internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { createAccount } from "@convex-dev/auth/server";
import { todayBusinessDayEpoch } from "../src/lib/seguimientoFecha";
import type { Id } from "./_generated/dataModel";

/**
 * Datos de prueba para desarrollo local. SOLO para deployments de
 * desarrollo/preview — no ejecutar contra producción.
 *
 * Idempotente por clave (email de usuario/cliente, tupla clienteId+descripcion
 * de seguimiento, `authId` presente en `usuarios`) — buscar cada registro
 * antes de insertar/crear su cuenta, para que ejecutar `seedDemo` varias
 * veces no duplique nada.
 *
 * Usa `internalMutation`/`internalAction` (no `./functions`, no exportados al
 * cliente): este seed bootstrapea las primeras cuentas de acceso, así que no
 * puede exigir una sesión ya autenticada (paradoja del huevo y la gallina).
 * Solo es invocable vía `npx convex run seed:seedDemo` (credenciales de
 * admin/deploy-key de la CLI), nunca desde el cliente público.
 *
 * `createAccount()` (WUA-8) exige contexto de action, no de mutation — por
 * eso la orquestación vive en un `internalAction` que llama a mutations
 * internas más pequeñas vía `ctx.runMutation`.
 *
 * Ejecutar una vez: `npx convex run seed:seedDemo`.
 */

/** Contraseña compartida de las cuentas semilla — cambiar antes de dar acceso
 * real a usuarios finales (ver README). Mismo patrón que el "acceso de
 * ejemplo" del prototipo de diseño original. */
const SEED_PASSWORD = "vibecrm-2026";

const USUARIOS_SEED = [
  { nombre: "Marta López", email: "marta@negocio.es", rol: "propietaria" as const },
  { nombre: "Carlos Ruiz", email: "carlos@negocio.es", rol: "comercial" as const },
];

export const ensureUsuario = internalMutation({
  args: {
    nombre: v.string(),
    email: v.string(),
    rol: v.union(v.literal("propietaria"), v.literal("comercial")),
  },
  handler: async (ctx, args) => {
    const existente = await ctx.db
      .query("usuarios")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existente) return { id: existente._id, authId: existente.authId ?? null };
    const id = await ctx.db.insert("usuarios", args);
    return { id, authId: null };
  },
});

export const setUsuarioAuthId = internalMutation({
  args: { id: v.id("usuarios"), authId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { authId: args.authId });
  },
});

export const ensureCliente = internalMutation({
  args: {
    nombre: v.string(),
    empresa: v.optional(v.string()),
    telefono: v.optional(v.string()),
    email: v.string(),
    estado: v.union(
      v.literal("nuevo_lead"),
      v.literal("en_negociacion"),
      v.literal("pendiente"),
      v.literal("ganado"),
      v.literal("perdido"),
    ),
  },
  handler: async (ctx, args) => {
    const existente = await ctx.db
      .query("clientes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existente) return existente._id;
    return ctx.db.insert("clientes", args);
  },
});

export const ensureSeguimiento = internalMutation({
  args: {
    clienteId: v.id("clientes"),
    descripcion: v.string(),
    responsableId: v.id("usuarios"),
    fechaProgramada: v.number(),
  },
  handler: async (ctx, args) => {
    const existentes = await ctx.db
      .query("seguimientos")
      .withIndex("by_cliente", (q) => q.eq("clienteId", args.clienteId))
      .collect();
    if (existentes.some((s) => s.descripcion === args.descripcion)) return;
    await ctx.db.insert("seguimientos", {
      ...args,
      origen: "manual",
      completado: false,
      actualizadoEn: Date.now(),
    });
  },
});

export const seedDemo = internalAction({
  args: {},
  handler: async (ctx) => {
    const usuarioIds: Record<string, Id<"usuarios">> = {};
    for (const u of USUARIOS_SEED) {
      const { id, authId } = await ctx.runMutation(internal.seed.ensureUsuario, u);
      if (!authId) {
        const { user } = await createAccount(ctx, {
          provider: "password",
          account: { id: u.email, secret: SEED_PASSWORD },
          profile: { email: u.email },
        });
        await ctx.runMutation(internal.seed.setUsuarioAuthId, { id, authId: user._id });
      }
      usuarioIds[u.email] = id;
    }
    const martaId = usuarioIds["marta@negocio.es"];
    const carlosId = usuarioIds["carlos@negocio.es"];

    const anaId = await ctx.runMutation(internal.seed.ensureCliente, {
      nombre: "Ana Torres",
      empresa: "Torres Consulting",
      telefono: "+34 611 222 333",
      email: "ana.torres@seed.vibecrm.local",
      estado: "en_negociacion",
    });
    const beltranId = await ctx.runMutation(internal.seed.ensureCliente, {
      nombre: "Beltrán Ruiz",
      empresa: "Ruiz e Hijos",
      email: "beltran.ruiz@seed.vibecrm.local",
      estado: "nuevo_lead",
    });
    const carmenId = await ctx.runMutation(internal.seed.ensureCliente, {
      nombre: "Carmen Díaz",
      telefono: "+34 644 555 666",
      email: "carmen.diaz@seed.vibecrm.local",
      estado: "pendiente",
    });
    await ctx.runMutation(internal.seed.ensureCliente, {
      nombre: "David Soler",
      empresa: "Soler Digital",
      email: "david.soler@seed.vibecrm.local",
      estado: "ganado",
    });

    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const hoy = todayBusinessDayEpoch();

    await ctx.runMutation(internal.seed.ensureSeguimiento, {
      clienteId: anaId,
      descripcion: "Llamar para cerrar la propuesta",
      responsableId: carlosId,
      fechaProgramada: hoy - 2 * MS_PER_DAY, // atrasado
    });
    await ctx.runMutation(internal.seed.ensureSeguimiento, {
      clienteId: beltranId,
      descripcion: "Primera llamada de descubrimiento",
      responsableId: martaId,
      fechaProgramada: hoy, // para hoy
    });
    await ctx.runMutation(internal.seed.ensureSeguimiento, {
      clienteId: carmenId,
      descripcion: "Enviar propuesta de seguimiento",
      responsableId: carlosId,
      fechaProgramada: hoy + 3 * MS_PER_DAY, // próxima
    });
  },
});
