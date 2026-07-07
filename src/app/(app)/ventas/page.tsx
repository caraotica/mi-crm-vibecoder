import { TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Pantalla 9 — Ventas (PRD "Pantallas"; Linear WUA-61).
 * TODO: métricas En marcha/Ganado con `useQuery(api.ventas.list)`, filtro
 * segmentado por estado, lista de operaciones.
 */
export default function VentasPage() {
  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 md:px-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-text">Ventas</h1>
        <Button>Añadir venta</Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Card>
          <p className="text-[13px] text-text-muted">En marcha</p>
          <p className="mt-1 font-mono text-3xl font-medium tabular-nums text-text">€0</p>
        </Card>
        <Card>
          <p className="text-[13px] text-text-muted">Ganado</p>
          <p className="mt-1 font-mono text-3xl font-medium tabular-nums text-success">€0</p>
        </Card>
      </div>

      <div className="mt-6">
        <EmptyState
          icon={TrendingUp}
          title="Todavía no hay ventas registradas"
          helpText="En cuanto conectes Convex, verás aquí el pipeline completo."
        />
      </div>
    </div>
  );
}
