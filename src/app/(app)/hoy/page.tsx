"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarCheck } from "lucide-react";
import { api, type Id } from "@/lib/convexApi";
import { useSeguimientosHoy } from "@/hooks/useSeguimientosHoy";
import { useToast } from "@/lib/toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { QuickActionsPanel, type QuickActionKind } from "@/components/hoy/QuickActionsPanel";
import { SeguimientoSection } from "@/components/hoy/SeguimientoSection";
import { SeguimientoItem } from "@/components/hoy/SeguimientoItem";
import { NuevaTareaForm } from "@/components/overlays/NuevaTareaForm";
import { NuevoClienteForm } from "@/components/overlays/NuevoClienteForm";
import { AnotarInteraccionForm } from "@/components/overlays/AnotarInteraccionForm";
import { RegistrarVentaForm } from "@/components/overlays/RegistrarVentaForm";
import { closeClienteOverlay, clienteCreatedOverlay, type OverlayState } from "@/components/hoy/overlayState";

function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof ConvexError && e.data && typeof e.data === "object" && "message" in e.data) {
    return String((e.data as { message: unknown }).message);
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

/** Pantalla "Hoy" (WUA-17/18) — pantalla inicial de la app tras "login". */
export default function HoyPage() {
  const { atrasados, paraHoy, proximas, isLoading } = useSeguimientosHoy();
  const { showToast } = useToast();
  const marcarHecho = useMutation(api.seguimientos.marcarHecho).withOptimisticUpdate(
    (localStore, args) => {
      if (!args.completado) return; // el "Deshacer" espera a la reactividad real, ver decisión 8 del plan
      const current = localStore.getQuery(api.seguimientos.listHoy, {});
      if (!current) return;
      const sinItem = (arr: typeof current.atrasados) => arr.filter((s) => s._id !== args.id);
      localStore.setQuery(api.seguimientos.listHoy, {}, {
        atrasados: sinItem(current.atrasados),
        paraHoy: sinItem(current.paraHoy),
        proximas: sinItem(current.proximas),
      });
    },
  );

  const [overlay, setOverlay] = useState<OverlayState>({ kind: null });
  const [pendingIds, setPendingIds] = useState<ReadonlySet<Id<"seguimientos">>>(new Set());

  function setPending(id: Id<"seguimientos">, pending: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleMarcarHecho(id: Id<"seguimientos">, expectedActualizadoEn: number) {
    if (pendingIds.has(id)) return;
    setPending(id, true);
    try {
      const result = await marcarHecho({ id, completado: true, expectedActualizadoEn });
      showToast({
        message: "Seguimiento completado",
        action: { label: "Deshacer", onClick: () => handleDeshacer(id, result.actualizadoEn) },
      });
    } catch (e) {
      showToast({ message: errorMessage(e, "No se pudo actualizar"), variant: "error" });
    } finally {
      setPending(id, false);
    }
  }

  async function handleDeshacer(id: Id<"seguimientos">, expectedActualizadoEn: number) {
    if (pendingIds.has(id)) return;
    setPending(id, true);
    try {
      await marcarHecho({ id, completado: false, expectedActualizadoEn });
    } catch (e) {
      showToast({ message: errorMessage(e, "No se pudo deshacer"), variant: "error" });
    } finally {
      setPending(id, false);
    }
  }

  function handleOpenQuickAction(kind: QuickActionKind) {
    if (kind === "tarea") setOverlay({ kind: "tarea" });
    else if (kind === "cliente") setOverlay({ kind: "cliente" });
    else setOverlay({ kind });
  }

  const totalPendientes = (atrasados?.length ?? 0) + (paraHoy?.length ?? 0) + (proximas?.length ?? 0);
  const showEmpty = !isLoading && totalPendientes === 0;
  const eyebrow = format(new Date(), "EEEE, d 'de' MMMM", { locale: es }).toUpperCase();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 p-5 md:p-8">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-subtle">{eyebrow}</span>
        <h1 className="text-2xl font-semibold text-text">
          {isLoading ? "Cargando…" : `${totalPendientes} seguimientos pendientes`}
        </h1>
      </div>

      <QuickActionsPanel onOpen={handleOpenQuickAction} />

      {atrasados && atrasados.length > 0 && (
        <SeguimientoSection title="Atrasados" count={atrasados.length} tone="error">
          {atrasados.map((s) => (
            <SeguimientoItem
              key={s._id}
              clienteId={s.clienteId}
              clienteNombre={s.clienteNombre}
              clienteEstado={s.clienteEstado}
              descripcion={s.descripcion}
              responsableNombre={s.responsableNombre}
              fechaProgramada={s.fechaProgramada}
              atrasado
              pendingAction={pendingIds.has(s._id)}
              onMarcarHecho={() => handleMarcarHecho(s._id, s.actualizadoEn)}
            />
          ))}
        </SeguimientoSection>
      )}

      {paraHoy && paraHoy.length > 0 && (
        <SeguimientoSection title="Para hoy" count={paraHoy.length} tone="primary">
          {paraHoy.map((s) => (
            <SeguimientoItem
              key={s._id}
              clienteId={s.clienteId}
              clienteNombre={s.clienteNombre}
              clienteEstado={s.clienteEstado}
              descripcion={s.descripcion}
              responsableNombre={s.responsableNombre}
              fechaProgramada={s.fechaProgramada}
              atrasado={false}
              pendingAction={pendingIds.has(s._id)}
              onMarcarHecho={() => handleMarcarHecho(s._id, s.actualizadoEn)}
            />
          ))}
        </SeguimientoSection>
      )}

      {proximas && proximas.length > 0 && (
        <SeguimientoSection title="Próximas" count={proximas.length} tone="neutral">
          {proximas.map((s) => (
            <SeguimientoItem
              key={s._id}
              clienteId={s.clienteId}
              clienteNombre={s.clienteNombre}
              clienteEstado={s.clienteEstado}
              descripcion={s.descripcion}
              responsableNombre={s.responsableNombre}
              fechaProgramada={s.fechaProgramada}
              atrasado={false}
              pendingAction={pendingIds.has(s._id)}
              onMarcarHecho={() => handleMarcarHecho(s._id, s.actualizadoEn)}
            />
          ))}
        </SeguimientoSection>
      )}

      {showEmpty && (
        <EmptyState
          icon={CalendarCheck}
          title="No hay seguimientos para hoy"
          helpText="Estás al día. Disfruta del día o añade un nuevo seguimiento."
          action={
            <button
              type="button"
              onClick={() => setOverlay({ kind: "tarea" })}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Nueva tarea
            </button>
          }
        />
      )}

      {overlay.kind === "tarea" && (
        <NuevaTareaForm
          initialDraft={overlay.draft}
          onClose={() => setOverlay({ kind: null })}
          onOpenNuevoCliente={(draft) => setOverlay({ kind: "cliente", returnTo: { draft } })}
        />
      )}
      {overlay.kind === "cliente" && (
        <NuevoClienteForm
          onClose={() => setOverlay(closeClienteOverlay(overlay))}
          onCreated={(id) => setOverlay(clienteCreatedOverlay(overlay, id))}
        />
      )}
      {overlay.kind === "interaccion" && (
        <AnotarInteraccionForm onClose={() => setOverlay({ kind: null })} />
      )}
      {overlay.kind === "venta" && <RegistrarVentaForm onClose={() => setOverlay({ kind: null })} />}
    </div>
  );
}
