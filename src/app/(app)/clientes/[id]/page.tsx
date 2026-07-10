"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Phone, Mail, Pencil, Inbox } from "lucide-react";
import { api, type Id } from "@/lib/convexApi";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ESTADO_CLIENTE_LABEL, CANAL_ORIGEN_LABEL, type EstadoCliente } from "@/types";
import { ESTADO_BADGE_STATUS } from "@/lib/clienteEstado";
import { useToast } from "@/lib/toast";
import { FichaAccionesPanel, type FichaAccionKind } from "@/components/clientes/FichaAccionesPanel";
import { SeguimientoPendienteRow } from "@/components/clientes/SeguimientoPendienteRow";
import { HistorialItem } from "@/components/clientes/HistorialItem";
import { NuevoClienteForm } from "@/components/overlays/NuevoClienteForm";
import { NuevaTareaForm } from "@/components/overlays/NuevaTareaForm";
import { AnotarInteraccionForm } from "@/components/overlays/AnotarInteraccionForm";
import { RegistrarVentaForm } from "@/components/overlays/RegistrarVentaForm";

type FichaOverlay = "editar" | FichaAccionKind | null;

const ESTADO_OPTIONS: { value: EstadoCliente; label: string }[] = (
  ["nuevo_lead", "en_negociacion", "pendiente", "ganado", "perdido"] as const
).map((value) => ({ value, label: ESTADO_CLIENTE_LABEL[value] }));

/** Ficha de cliente (WUA-11): datos, acciones rápidas, seguimientos
 * pendientes e historial combinado (interacciones + ventas + seguimientos
 * completados). `clientes.getFicha` usa normalizeId internamente, así que un
 * id con formato inválido y uno bien formado pero inexistente devuelven
 * ambos `null` — mismo mensaje de "no encontrado". */
export default function FichaClientePage() {
  const { id } = useParams<{ id: string }>();
  const ficha = useQuery(api.clientes.getFicha, { id });
  const { showToast } = useToast();
  const [overlay, setOverlay] = useState<FichaOverlay>(null);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<Id<"seguimientos">>>(new Set());
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const actualizarEstado = useMutation(api.clientes.update);

  const marcarHecho = useMutation(api.seguimientos.marcarHecho).withOptimisticUpdate(
    (localStore, args) => {
      if (!args.completado) return;
      const current = localStore.getQuery(api.clientes.getFicha, { id });
      if (!current) return;
      localStore.setQuery(api.clientes.getFicha, { id }, {
        ...current,
        seguimientosPendientes: current.seguimientosPendientes.filter((s) => s._id !== args.id),
      });
    },
  );

  function setPending(sid: Id<"seguimientos">, pending: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(sid);
      else next.delete(sid);
      return next;
    });
  }

  async function handleMarcarHecho(sid: Id<"seguimientos">, expectedActualizadoEn: number) {
    if (pendingIds.has(sid)) return;
    setPending(sid, true);
    try {
      const result = await marcarHecho({ id: sid, completado: true, expectedActualizadoEn });
      showToast({
        message: "Seguimiento completado",
        action: {
          label: "Deshacer",
          onClick: () => marcarHecho({ id: sid, completado: false, expectedActualizadoEn: result.actualizadoEn }),
        },
      });
    } catch (e) {
      showToast({ message: e instanceof Error ? e.message : "No se pudo actualizar", variant: "error" });
    } finally {
      setPending(sid, false);
    }
  }

  if (ficha === undefined) {
    return <div className="mx-auto max-w-3xl p-5 md:p-8" />;
  }

  if (ficha === null) {
    return (
      <div className="mx-auto max-w-3xl p-5 md:p-8">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-8 text-center shadow-xs">
          <p className="text-[15px] font-semibold text-text">Cliente no encontrado</p>
          <p className="max-w-xs text-[13px] text-text-muted">
            Puede que el enlace sea incorrecto o que el cliente se haya eliminado.
          </p>
          <Link href="/clientes" className="text-sm font-medium text-primary hover:underline">
            Volver a Clientes
          </Link>
        </div>
      </div>
    );
  }

  const { cliente, seguimientosPendientes, historial } = ficha;
  const clienteFijo = { id: cliente._id, nombre: cliente.nombre };

  async function handleCambiarEstado(estado: EstadoCliente | null) {
    if (!estado || estado === cliente.estado || guardandoEstado) return;
    setGuardandoEstado(true);
    try {
      await actualizarEstado({ id: cliente._id, estado });
    } catch (e) {
      showToast({ message: e instanceof Error ? e.message : "No se pudo actualizar el estado", variant: "error" });
    } finally {
      setGuardandoEstado(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 p-5 md:p-8">
      <Link
        href="/clientes"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-text-muted hover:text-text"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Atrás
      </Link>

      <Card>
        <div className="flex items-start gap-4">
          <Avatar nombre={cliente.nombre} size={48} />
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-[19px] font-semibold text-text">{cliente.nombre}</span>
            {cliente.empresa && <span className="text-sm text-text-muted">{cliente.empresa}</span>}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <Badge status={ESTADO_BADGE_STATUS[cliente.estado]}>{ESTADO_CLIENTE_LABEL[cliente.estado]}</Badge>
              {cliente.canalOrigen && (
                <Badge status="neutral">Origen: {CANAL_ORIGEN_LABEL[cliente.canalOrigen]}</Badge>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOverlay("editar")}
            aria-label="Editar cliente"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-subtle hover:bg-surface-2"
          >
            <Pencil size={18} strokeWidth={1.5} />
          </button>
        </div>

        {(cliente.telefono || cliente.email) && (
          <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4">
            {cliente.telefono && (
              <a
                href={`tel:${cliente.telefono}`}
                className="flex min-h-[44px] items-center gap-2.5 text-[15px] text-text hover:text-primary"
              >
                <Phone size={16} strokeWidth={1.5} className="text-text-subtle" />
                {cliente.telefono}
              </a>
            )}
            {cliente.email && (
              <a
                href={`mailto:${cliente.email}`}
                className="flex min-h-[44px] items-center gap-2.5 text-[15px] text-text hover:text-primary"
              >
                <Mail size={16} strokeWidth={1.5} className="text-text-subtle" />
                {cliente.email}
              </a>
            )}
          </div>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <SegmentedControl
            label="Estado"
            options={ESTADO_OPTIONS}
            value={cliente.estado}
            onChange={handleCambiarEstado}
            disabled={guardandoEstado}
          />
        </div>
      </Card>

      <FichaAccionesPanel onOpen={setOverlay} />

      {seguimientosPendientes.length > 0 && (
        <Card padded={false} className="px-5">
          <div className="border-b border-border py-3.5">
            <span className="text-[15px] font-semibold text-text">Seguimientos pendientes</span>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {seguimientosPendientes.map((s) => (
              <SeguimientoPendienteRow
                key={s._id}
                descripcion={s.descripcion}
                responsableNombre={s.responsableNombre}
                fechaProgramada={s.fechaProgramada}
                pendingAction={pendingIds.has(s._id)}
                onMarcarHecho={() => handleMarcarHecho(s._id, s.actualizadoEn)}
              />
            ))}
          </div>
        </Card>
      )}

      <Card padded={false} className="px-5">
        <div className="border-b border-border py-3.5">
          <span className="text-[15px] font-semibold text-text">Historial</span>
        </div>
        {historial.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Sin actividad todavía"
            helpText="Las interacciones, ventas y seguimientos completados aparecerán aquí."
          />
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {historial.map((entry) => (
              <HistorialItem key={`${entry.tipo}-${entry.id}`} entry={entry} />
            ))}
          </div>
        )}
      </Card>

      {overlay === "editar" && (
        <NuevoClienteForm cliente={cliente} onClose={() => setOverlay(null)} onUpdated={() => setOverlay(null)} />
      )}
      {overlay === "interaccion" && (
        <AnotarInteraccionForm clienteFijo={clienteFijo} onClose={() => setOverlay(null)} />
      )}
      {overlay === "seguimiento" && (
        <NuevaTareaForm clienteFijo={clienteFijo} onClose={() => setOverlay(null)} />
      )}
      {overlay === "venta" && <RegistrarVentaForm clienteFijo={clienteFijo} onClose={() => setOverlay(null)} />}
    </div>
  );
}
