"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ESTADO_CLIENTE_LABEL } from "@/types";
import { ESTADO_BADGE_STATUS } from "@/lib/clienteEstado";

/**
 * Stub de ficha de cliente (WUA-11 todavía no construida). `clientes.get`
 * usa normalizeId internamente, así que un id con formato inválido y un id
 * bien formado pero inexistente devuelven ambos `null` — mismo mensaje.
 */
export default function FichaClientePage() {
  const { id } = useParams<{ id: string }>();
  const cliente = useQuery(api.clientes.get, { id });

  if (cliente === undefined) {
    return <div className="mx-auto max-w-3xl p-5 md:p-8" />;
  }

  if (cliente === null) {
    return (
      <div className="mx-auto max-w-3xl p-5 md:p-8">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-8 text-center shadow-xs">
          <p className="text-[15px] font-semibold text-text">Cliente no encontrado</p>
          <p className="max-w-xs text-[13px] text-text-muted">
            Puede que el enlace sea incorrecto o que el cliente se haya eliminado.
          </p>
          <Link href="/hoy" className="text-sm font-medium text-primary hover:underline">
            Volver a Hoy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-5 md:p-8">
      <Link
        href="/hoy"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Atrás
      </Link>
      <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <div className="flex items-start gap-4">
          <Avatar nombre={cliente.nombre} size={48} />
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-[19px] font-semibold text-text">{cliente.nombre}</span>
            {cliente.empresa && <span className="text-sm text-text-muted">{cliente.empresa}</span>}
          </div>
          <Badge status={ESTADO_BADGE_STATUS[cliente.estado]}>
            {ESTADO_CLIENTE_LABEL[cliente.estado]}
          </Badge>
        </div>
      </div>
      <p className="mt-5 text-sm text-text-muted">
        Historial completo próximamente (WUA-11).
      </p>
    </div>
  );
}
