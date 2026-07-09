/**
 * Tipos compartidos que reflejan el modelo de datos del PRD (Notion, sección "Datos").
 * Se mantienen sincronizados a mano con convex/schema.ts — si cambias uno, revisa el otro.
 */

export type Rol = "propietaria" | "comercial";

export type CanalInteraccion = "llamada" | "email" | "whatsapp" | "en_persona";

export type CanalOrigen = "web" | "redes" | "email" | "whatsapp";

export type EstadoCliente =
  | "nuevo_lead"
  | "en_negociacion"
  | "pendiente"
  | "ganado"
  | "perdido";

export type OrigenSeguimiento = "manual" | "sistema";

export type EstadoVenta = "abierta" | "ganada" | "perdida";

export type FrecuenciaSuscripcion = "mensual" | "trimestral" | "anual";

export type EstadoSuscripcion = "activa" | "pago_fallido" | "cancelada";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface Cliente {
  id: string;
  nombre: string;
  empresa?: string;
  telefono?: string;
  email?: string;
  nota?: string;
  canalOrigen?: CanalOrigen;
  estado: EstadoCliente;
  fechaAlta: number;
}

export interface Interaccion {
  id: string;
  clienteId: string;
  canal: CanalInteraccion;
  contenido: string;
  autorId: string;
  fecha: number;
}

export interface Seguimiento {
  id: string;
  clienteId: string;
  descripcion: string;
  origen: OrigenSeguimiento;
  responsableId: string;
  fechaProgramada: number;
  completado: boolean;
  fechaCompletado?: number;
  /** Token de versión (epoch ms) para el guard optimista de marcarHecho. */
  actualizadoEn: number;
}

export interface VentaPuntual {
  id: string;
  clienteId: string;
  producto: string;
  monto: number;
  estado: EstadoVenta;
  fecha: number;
  autorId: string;
}

export interface Suscripcion {
  id: string;
  clienteId: string;
  producto: string;
  monto: number;
  frecuencia: FrecuenciaSuscripcion;
  fechaInicio: number;
  fechaProximoCobro: number;
  estado: EstadoSuscripcion;
}

/** Etiquetas en español para mostrar en la UI (badges, selects, filtros). */
export const ESTADO_CLIENTE_LABEL: Record<EstadoCliente, string> = {
  nuevo_lead: "Nuevo lead",
  en_negociacion: "En negociación",
  pendiente: "Pendiente",
  ganado: "Ganado",
  perdido: "Perdido",
};

export const ESTADO_VENTA_LABEL: Record<EstadoVenta, string> = {
  abierta: "Oportunidad abierta",
  ganada: "Ganada",
  perdida: "Perdida",
};

export const ESTADO_SUSCRIPCION_LABEL: Record<EstadoSuscripcion, string> = {
  activa: "Activa",
  pago_fallido: "Pago fallido",
  cancelada: "Cancelada",
};

export const CANAL_INTERACCION_LABEL: Record<CanalInteraccion, string> = {
  llamada: "Llamada",
  email: "Email",
  whatsapp: "WhatsApp",
  en_persona: "En persona",
};

export const CANAL_ORIGEN_LABEL: Record<CanalOrigen, string> = {
  web: "Web",
  redes: "Redes",
  email: "Email",
  whatsapp: "WhatsApp",
};

export const ROL_LABEL: Record<Rol, string> = {
  propietaria: "Dueña",
  comercial: "Atiende y vende",
};
