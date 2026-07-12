import { Card } from "@/components/ui/Card";

const formatoImporte = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

interface VentaMetricasProps {
  enMarchaTotal: number;
  enMarchaConteo: number;
  ganadoTotal: number;
  ganadoConteo: number;
}

/** Métricas agregadas de la pantalla Ventas (WUA-61): suma + conteo de oportunidades
 * abiertas y de ventas ganadas. */
export function VentaMetricas({ enMarchaTotal, enMarchaConteo, ganadoTotal, ganadoConteo }: VentaMetricasProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-text-muted">En marcha</span>
          <span className="text-2xl font-semibold text-info-text">{formatoImporte.format(enMarchaTotal)}</span>
          <span className="text-xs text-text-subtle">
            {enMarchaConteo} {enMarchaConteo === 1 ? "oportunidad" : "oportunidades"}
          </span>
        </div>
      </Card>
      <Card>
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-text-muted">Ganado</span>
          <span className="text-2xl font-semibold text-success-text">{formatoImporte.format(ganadoTotal)}</span>
          <span className="text-xs text-text-subtle">
            {ganadoConteo} {ganadoConteo === 1 ? "venta" : "ventas"}
          </span>
        </div>
      </Card>
    </div>
  );
}
