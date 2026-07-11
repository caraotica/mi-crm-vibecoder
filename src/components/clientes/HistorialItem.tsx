import { Phone, Mail, MessageCircle, User, CheckCircle2, CircleDollarSign, Repeat } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { Badge, type BadgeStatus } from "@/components/ui/Badge";
import {
  ESTADO_VENTA_LABEL,
  ESTADO_SUSCRIPCION_LABEL,
  FRECUENCIA_SUSCRIPCION_LABEL,
  CANAL_INTERACCION_LABEL,
  type CanalInteraccion,
  type EstadoVenta,
  type EstadoSuscripcion,
  type FrecuenciaSuscripcion,
} from "@/types";

export type HistorialEntry =
  | { tipo: "seguimiento_completado"; id: string; fecha: number; descripcion: string; responsableNombre: string }
  | { tipo: "interaccion"; id: string; fecha: number; canal: CanalInteraccion; contenido: string; autorNombre: string }
  | { tipo: "venta"; id: string; fecha: number; producto: string; monto: number; estado: EstadoVenta; autorNombre: string }
  | {
      tipo: "suscripcion";
      id: string;
      fecha: number;
      producto: string;
      monto: number;
      frecuencia: FrecuenciaSuscripcion;
      fechaProximoCobro: number;
      estado: EstadoSuscripcion;
    };

const CANAL_ICONO: Record<CanalInteraccion, LucideIcon> = {
  llamada: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  en_persona: User,
};

const ESTADO_VENTA_BADGE: Record<EstadoVenta, BadgeStatus> = {
  abierta: "info",
  ganada: "success",
  perdida: "error",
};

const ESTADO_SUSCRIPCION_BADGE: Record<EstadoSuscripcion, BadgeStatus> = {
  activa: "success",
  pago_fallido: "error",
  cancelada: "neutral",
};

const formatoImporte = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const formatoFecha = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });

function IconoCirculo({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span className={clsx("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", className)}>
      <Icon size={16} strokeWidth={1.5} />
    </span>
  );
}

/** Una entrada del historial combinado de la ficha de cliente (WUA-11):
 * interacción, venta o seguimiento completado, cada una con su propio icono. */
export function HistorialItem({ entry }: { entry: HistorialEntry }) {
  const fechaLabel = formatoFecha.format(new Date(entry.fecha));

  if (entry.tipo === "interaccion") {
    const Icon = CANAL_ICONO[entry.canal];
    return (
      <div className="flex items-start gap-3 py-3">
        <IconoCirculo icon={Icon} className="bg-primary-subtle text-primary" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-medium text-text-subtle">{CANAL_INTERACCION_LABEL[entry.canal]}</span>
          <span className="text-[15px] text-text">{entry.contenido}</span>
          <span className="text-xs text-text-subtle">
            Registrado por {entry.autorNombre} · {fechaLabel}
          </span>
        </div>
      </div>
    );
  }

  if (entry.tipo === "venta") {
    return (
      <div className="flex items-start gap-3 py-3">
        <IconoCirculo icon={CircleDollarSign} className="bg-success-bg text-success-text" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-text">{entry.producto}</span>
            <Badge status={ESTADO_VENTA_BADGE[entry.estado]} dot={false}>
              {ESTADO_VENTA_LABEL[entry.estado]}
            </Badge>
          </div>
          <span className="text-[15px] text-text">{formatoImporte.format(entry.monto)}</span>
          <span className="text-xs text-text-subtle">
            Registrado por {entry.autorNombre} · {fechaLabel}
          </span>
        </div>
      </div>
    );
  }

  if (entry.tipo === "suscripcion") {
    return (
      <div className="flex items-start gap-3 py-3">
        <IconoCirculo icon={Repeat} className="bg-primary-subtle text-primary" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-text">{entry.producto}</span>
            <Badge status={ESTADO_SUSCRIPCION_BADGE[entry.estado]} dot={false}>
              {ESTADO_SUSCRIPCION_LABEL[entry.estado]}
            </Badge>
          </div>
          <span className="text-[15px] text-text">
            {formatoImporte.format(entry.monto)} / {FRECUENCIA_SUSCRIPCION_LABEL[entry.frecuencia]}
          </span>
          {entry.estado === "activa" && (
            <span className="text-xs text-text-subtle">
              Próximo cobro: {formatoFecha.format(new Date(entry.fechaProximoCobro))}
            </span>
          )}
          <span className="text-xs text-text-subtle">Inicio: {fechaLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-3">
      <IconoCirculo icon={CheckCircle2} className="bg-surface-2 text-text-subtle" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[15px] text-text">{entry.descripcion}</span>
        <span className="text-xs text-text-subtle">
          Responsable: {entry.responsableNombre} · {fechaLabel}
        </span>
      </div>
    </div>
  );
}
