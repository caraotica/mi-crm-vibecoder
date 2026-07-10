"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ESTADO_CLIENTE_LABEL, type EstadoCliente } from "@/types";
import { ESTADO_BADGE_STATUS } from "@/lib/clienteEstado";
import { etiquetaUltimoContacto } from "@/lib/seguimientoFechaLabel";
import type { Id } from "@/lib/convexApi";

interface ClienteRowProps {
  id: Id<"clientes">;
  nombre: string;
  estado: EstadoCliente;
  ultimoContacto: number;
}

/** Fila de la lista de clientes (WUA-9): avatar, nombre, chip de estado y último contacto. */
export function ClienteRow({ id, nombre, estado, ultimoContacto }: ClienteRowProps) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(`/clientes/${id}`)}
      className="flex min-h-[44px] w-full items-center gap-3 py-2.5 text-left hover:bg-surface-2"
    >
      <Avatar nombre={nombre} size={40} />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-[15px] font-semibold text-text">{nombre}</span>
        <Badge status={ESTADO_BADGE_STATUS[estado]} dot={false} className="shrink-0">
          {ESTADO_CLIENTE_LABEL[estado]}
        </Badge>
      </div>
      <span className="shrink-0 whitespace-nowrap text-xs text-text-subtle">
        {etiquetaUltimoContacto(ultimoContacto)}
      </span>
    </button>
  );
}
