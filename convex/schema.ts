import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Esquema Convex que refleja el modelo de datos del PRD (Notion, sección "Datos")
 * tras la reconciliación con el prototipo de diseño (7 jul 2026).
 * Mantener sincronizado a mano con src/types/index.ts.
 *
 * Nota: la fecha de alta de un registro puede leerse de `_creationTime`
 * (campo automático de Convex), así que no se duplica como columna propia
 * salvo que haga falta poder editarla (ver `fecha`/`fechaProgramada` explícitos
 * donde el usuario sí puede elegir la fecha, p. ej. una interacción retroactiva).
 */
export default defineSchema({
  usuarios: defineTable({
    nombre: v.string(),
    email: v.string(),
    rol: v.union(v.literal("propietaria"), v.literal("comercial")),
    // PUNTO DE INTEGRACIÓN: enlazar con el proveedor de auth real (Convex Auth /
    // Clerk / Supabase...). authId = id de identidad en ese proveedor.
    authId: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_authId", ["authId"]),

  clientes: defineTable({
    nombre: v.string(),
    empresa: v.optional(v.string()),
    telefono: v.optional(v.string()),
    email: v.optional(v.string()),
    nota: v.optional(v.string()),
    canalOrigen: v.optional(
      v.union(
        v.literal("web"),
        v.literal("redes"),
        v.literal("email"),
        v.literal("whatsapp"),
      ),
    ),
    estado: v.union(
      v.literal("nuevo_lead"),
      v.literal("en_negociacion"),
      v.literal("pendiente"),
      v.literal("ganado"),
      v.literal("perdido"),
    ),
  })
    .index("by_nombre", ["nombre"])
    .index("by_telefono", ["telefono"])
    .index("by_email", ["email"]),

  interacciones: defineTable({
    clienteId: v.id("clientes"),
    canal: v.union(
      v.literal("llamada"),
      v.literal("email"),
      v.literal("whatsapp"),
      v.literal("en_persona"),
    ),
    contenido: v.string(),
    autorId: v.id("usuarios"),
    fecha: v.number(), // epoch ms; por defecto "hoy", editable
  }).index("by_cliente", ["clienteId"]),

  seguimientos: defineTable({
    clienteId: v.id("clientes"),
    descripcion: v.string(),
    origen: v.union(v.literal("manual"), v.literal("sistema")),
    responsableId: v.id("usuarios"),
    fechaProgramada: v.number(), // epoch ms (día)
    completado: v.boolean(),
    fechaCompletado: v.optional(v.number()),
    // Token de versión (epoch ms) para el guard optimista de marcarHecho:
    // evita el problema ABA (true→false→true) que un booleano no detecta.
    actualizadoEn: v.number(),
  })
    .index("by_cliente", ["clienteId"])
    .index("by_completado_fecha", ["completado", "fechaProgramada"])
    .index("by_responsable", ["responsableId"]),

  ventasPuntuales: defineTable({
    clienteId: v.id("clientes"),
    producto: v.string(),
    monto: v.number(),
    estado: v.union(
      v.literal("abierta"),
      v.literal("ganada"),
      v.literal("perdida"),
    ),
    fecha: v.number(),
    autorId: v.id("usuarios"),
  })
    .index("by_cliente", ["clienteId"])
    .index("by_estado", ["estado"]),

  suscripciones: defineTable({
    clienteId: v.id("clientes"),
    producto: v.string(),
    monto: v.number(),
    frecuencia: v.union(
      v.literal("mensual"),
      v.literal("trimestral"),
      v.literal("anual"),
    ),
    fechaInicio: v.number(),
    fechaProximoCobro: v.number(),
    estado: v.union(
      v.literal("activa"),
      v.literal("pago_fallido"),
      v.literal("cancelada"),
    ),
  })
    .index("by_cliente", ["clienteId"])
    .index("by_estado_proximoCobro", ["estado", "fechaProximoCobro"]),
});
