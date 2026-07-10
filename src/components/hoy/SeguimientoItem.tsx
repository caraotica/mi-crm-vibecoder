"use client";

import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ESTADO_CLIENTE_LABEL, type EstadoCliente } from "@/types";
import { etiquetaFechaRelativa } from "@/lib/seguimientoFechaLabel";
import { ESTADO_BADGE_STATUS } from "@/lib/clienteEstado";
import type { Id } from "@/lib/convexApi";

interface SeguimientoItemProps {
  clienteId: Id<"clientes">;
  clienteNombre: string;
  clienteEstado: EstadoCliente;
  descripcion: string;
  responsableNombre: string;
  fechaProgramada: number;
  atrasado: boolean;
  pendingAction: boolean;
  onMarcarHecho: () => void;
}

/** Fila de seguimiento en Hoy/ficha: checkbox "hecho" + datos + fecha relativa. */
export function SeguimientoItem({
  clienteId,
  clienteNombre,
  clienteEstado,
  descripcion,
  responsableNombre,
  fechaProgramada,
  atrasado,
  pendingAction,
  onMarcarHecho,
}: SeguimientoItemProps) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2 py-3">
      <button
        type="button"
        aria-label="Marcar como hecho"
        disabled={pendingAction}
        onClick={onMarcarHecho}
        className="flex h-11 w-11 shrink-0 items-center justify-center disabled:opacity-40"
      >
        <span className="h-[22px] w-[22px] rounded-full border-[1.5px] border-border-strong transition-colors duration-150 hover:border-primary" />
      </button>
      <button
        type="button"
        onClick={() => router.push(`/clientes/${clienteId}`)}
        className="flex min-w-0 flex-1 items-center gap-3 py-0.5 text-left"
      >
        <Avatar nombre={clienteNombre} size={36} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate text-[15px] font-semibold text-text">{clienteNombre}</span>
            <Badge status={ESTADO_BADGE_STATUS[clienteEstado]} dot={false}>
              {ESTADO_CLIENTE_LABEL[clienteEstado]}
            </Badge>
          </div>
          <span className="truncate text-sm text-text-muted">{descripcion}</span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span title={responsableNombre} className="inline-flex">
            <Avatar nombre={responsableNombre} size={22} />
          </span>
          <span className={clsx("text-xs whitespace-nowrap", atrasado ? "font-medium text-error-text" : "text-text-subtle")}>
            {etiquetaFechaRelativa(fechaProgramada)}
          </span>
        </div>
      </button>
    </div>
  );
}
