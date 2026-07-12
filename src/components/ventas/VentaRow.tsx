"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ESTADO_VENTA_BADGE_STATUS } from "@/lib/ventaEstado";
import { ESTADO_VENTA_LABEL, type EstadoVenta } from "@/types";
import type { Id } from "@/lib/convexApi";

const formatoImporte = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const formatoFecha = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });

interface VentaRowProps {
  clienteId: Id<"clientes">;
  clienteNombre: string;
  producto: string;
  monto: number;
  estado: EstadoVenta;
  fecha: number;
}

/** Fila de la pantalla Ventas (WUA-61): concepto, estado, cliente, importe y
 * fecha; navega a la ficha del cliente al tocarla. */
export function VentaRow({ clienteId, clienteNombre, producto, monto, estado, fecha }: VentaRowProps) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(`/clientes/${clienteId}`)}
      className="flex min-h-[44px] w-full items-center gap-3 py-2.5 text-left hover:bg-surface-2"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-[15px] font-semibold text-text">{producto}</span>
          <Badge status={ESTADO_VENTA_BADGE_STATUS[estado]} dot={false} className="shrink-0">
            {ESTADO_VENTA_LABEL[estado]}
          </Badge>
        </div>
        <span className="truncate text-xs text-text-subtle">{clienteNombre}</span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="text-[15px] font-medium text-text">{formatoImporte.format(monto)}</span>
        <span className="text-xs text-text-subtle">{formatoFecha.format(new Date(fecha))}</span>
      </div>
    </button>
  );
}
