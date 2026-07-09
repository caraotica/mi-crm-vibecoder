import { mutation } from "./functions";
import { todayBusinessDayEpoch } from "../src/lib/seguimientoFecha";

/**
 * Datos de prueba para desarrollo local. SOLO para deployments de
 * desarrollo/preview — no ejecutar contra producción (además, ya queda
 * bloqueado por el guard CRM_LOCAL_ONLY_MODE de ./functions).
 *
 * Idempotente por clave (email de usuario/cliente, tupla clienteId+descripcion
 * de seguimiento) — buscar cada registro antes de insertar y solo crear los
 * que faltan, para que ejecutar `seedDemo` varias veces no duplique nada
 * (a diferencia de comprobar solo "¿la tabla usuarios está vacía?").
 *
 * Ejecutar una vez: `npx convex run seed:seedDemo`.
 */
export const seedDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const hoy = todayBusinessDayEpoch();

    async function usuarioPorEmail(email: string) {
      return ctx.db
        .query("usuarios")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();
    }

    async function asegurarUsuario(nombre: string, email: string, rol: "propietaria" | "comercial") {
      const existente = await usuarioPorEmail(email);
      if (existente) return existente._id;
      return ctx.db.insert("usuarios", { nombre, email, rol });
    }

    const martaId = await asegurarUsuario("Marta López", "marta@negocio.es", "propietaria");
    const carlosId = await asegurarUsuario("Carlos Ruiz", "carlos@negocio.es", "comercial");

    async function clientePorEmail(email: string) {
      return ctx.db
        .query("clientes")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();
    }

    async function asegurarCliente(input: {
      nombre: string;
      empresa?: string;
      telefono?: string;
      email: string;
      estado: "nuevo_lead" | "en_negociacion" | "pendiente" | "ganado" | "perdido";
    }) {
      const existente = await clientePorEmail(input.email);
      if (existente) return existente._id;
      return ctx.db.insert("clientes", input);
    }

    const anaId = await asegurarCliente({
      nombre: "Ana Torres",
      empresa: "Torres Consulting",
      telefono: "+34 611 222 333",
      email: "ana.torres@seed.vibecrm.local",
      estado: "en_negociacion",
    });
    const beltranId = await asegurarCliente({
      nombre: "Beltrán Ruiz",
      empresa: "Ruiz e Hijos",
      email: "beltran.ruiz@seed.vibecrm.local",
      estado: "nuevo_lead",
    });
    const carmenId = await asegurarCliente({
      nombre: "Carmen Díaz",
      telefono: "+34 644 555 666",
      email: "carmen.diaz@seed.vibecrm.local",
      estado: "pendiente",
    });
    await asegurarCliente({
      nombre: "David Soler",
      empresa: "Soler Digital",
      email: "david.soler@seed.vibecrm.local",
      estado: "ganado",
    });

    async function seguimientoExiste(clienteId: typeof anaId, descripcion: string) {
      const existentes = await ctx.db
        .query("seguimientos")
        .withIndex("by_cliente", (q) => q.eq("clienteId", clienteId))
        .collect();
      return existentes.some((s) => s.descripcion === descripcion);
    }

    async function asegurarSeguimiento(input: {
      clienteId: typeof anaId;
      descripcion: string;
      responsableId: typeof martaId;
      fechaProgramada: number;
    }) {
      if (await seguimientoExiste(input.clienteId, input.descripcion)) return;
      await ctx.db.insert("seguimientos", {
        ...input,
        origen: "manual",
        completado: false,
        actualizadoEn: Date.now(),
      });
    }

    await asegurarSeguimiento({
      clienteId: anaId,
      descripcion: "Llamar para cerrar la propuesta",
      responsableId: carlosId,
      fechaProgramada: hoy - 2 * MS_PER_DAY, // atrasado
    });
    await asegurarSeguimiento({
      clienteId: beltranId,
      descripcion: "Primera llamada de descubrimiento",
      responsableId: martaId,
      fechaProgramada: hoy, // para hoy
    });
    await asegurarSeguimiento({
      clienteId: carmenId,
      descripcion: "Enviar propuesta de seguimiento",
      responsableId: carlosId,
      fechaProgramada: hoy + 3 * MS_PER_DAY, // próxima
    });
  },
});
