"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { TrendingUp, Plus } from "lucide-react";
import { api } from "@/lib/convexApi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { VentaMetricas } from "@/components/ventas/VentaMetricas";
import { VentaRow } from "@/components/ventas/VentaRow";
import { RegistrarVentaForm } from "@/components/overlays/RegistrarVentaForm";
import { ESTADO_VENTA_LABEL, type EstadoVenta } from "@/types";

type Filtro = "todas" | EstadoVenta;

const EMPTY_STATE_POR_FILTRO: Record<Filtro, { title: string; helpText: string }> = {
  todas: {
    title: "Sin ventas todavía",
    helpText: "Toca \"Añadir venta\" para registrar la primera.",
  },
  abierta: { title: "No hay oportunidades en marcha", helpText: "Las nuevas oportunidades aparecerán aquí." },
  ganada: { title: "No hay ventas ganadas todavía", helpText: "Las ventas cerradas aparecerán aquí." },
  perdida: { title: "No hay ventas perdidas", helpText: "Las oportunidades perdidas aparecerán aquí." },
};

/** Pantalla "Ventas" (WUA-61): métricas agregadas y pipeline de todas las
 * ventas puntuales del negocio, filtrable por estado. */
export default function VentasPage() {
  const ventas = useQuery(api.ventas.list, {});
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [showRegistrarVenta, setShowRegistrarVenta] = useState(false);

  const { metricas, conteos, filtradas } = useMemo(() => {
    const todas = ventas ?? [];
    const abiertas = todas.filter((v) => v.estado === "abierta");
    const ganadas = todas.filter((v) => v.estado === "ganada");
    const perdidas = todas.filter((v) => v.estado === "perdida");
    return {
      metricas: {
        enMarchaTotal: abiertas.reduce((sum, v) => sum + v.monto, 0),
        enMarchaConteo: abiertas.length,
        ganadoTotal: ganadas.reduce((sum, v) => sum + v.monto, 0),
        ganadoConteo: ganadas.length,
      },
      conteos: { todas: todas.length, abierta: abiertas.length, ganada: ganadas.length, perdida: perdidas.length },
      filtradas:
        filtro === "todas" ? todas : filtro === "abierta" ? abiertas : filtro === "ganada" ? ganadas : perdidas,
    };
  }, [ventas, filtro]);

  const cargando = ventas === undefined;

  const FILTRO_OPTIONS: { value: Filtro; label: string }[] = [
    { value: "todas", label: `Todas (${conteos.todas})` },
    { value: "abierta", label: `${ESTADO_VENTA_LABEL.abierta} (${conteos.abierta})` },
    { value: "ganada", label: `${ESTADO_VENTA_LABEL.ganada} (${conteos.ganada})` },
    { value: "perdida", label: `${ESTADO_VENTA_LABEL.perdida} (${conteos.perdida})` },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 p-5 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-text">Ventas</h1>
        <Button onClick={() => setShowRegistrarVenta(true)}>
          <Plus size={18} strokeWidth={2} />
          Añadir venta
        </Button>
      </div>

      {cargando ? (
        <div />
      ) : (
        <>
          <VentaMetricas {...metricas} />

          <SegmentedControl label="Filtrar por estado" options={FILTRO_OPTIONS} value={filtro} onChange={(v) => v && setFiltro(v)} />

          {filtradas.length === 0 ? (
            <Card>
              <EmptyState
                icon={TrendingUp}
                title={EMPTY_STATE_POR_FILTRO[filtro].title}
                helpText={EMPTY_STATE_POR_FILTRO[filtro].helpText}
                action={
                  filtro === "todas" ? (
                    <Button onClick={() => setShowRegistrarVenta(true)}>
                      <Plus size={18} strokeWidth={2} />
                      Añadir venta
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <Card padded={false} className="divide-y divide-border px-4">
              {filtradas.map((v) => (
                <VentaRow
                  key={v._id}
                  clienteId={v.clienteId}
                  clienteNombre={v.clienteNombre}
                  producto={v.producto}
                  monto={v.monto}
                  estado={v.estado}
                  fecha={v.fecha}
                />
              ))}
            </Card>
          )}
        </>
      )}

      {showRegistrarVenta && <RegistrarVentaForm onClose={() => setShowRegistrarVenta(false)} />}
    </div>
  );
}
