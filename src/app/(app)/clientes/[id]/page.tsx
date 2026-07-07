import { notFound } from "next/navigation";

/**
 * Pantalla 4 — Ficha de cliente (PRD "Pantallas"; Linear WUA-11).
 * TODO: `useQuery(api.clientes.get, { id })` + historial combinado
 * (interacciones + ventas + seguimientos completados), acciones rápidas
 * (Anotar interacción / Programar seguimiento / Registrar venta).
 */
export default async function FichaClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 md:px-8">
      <p className="text-sm text-text-muted">Ficha de cliente — id: {id}</p>
      <p className="mt-4 text-[15px] text-text-subtle">
        TODO: cabecera (avatar, nombre, chips de estado/canal), acciones
        rápidas, seguimientos pendientes e historial combinado. Ver Linear
        WUA-11 y components/clientes/README.md.
      </p>
    </div>
  );
}
