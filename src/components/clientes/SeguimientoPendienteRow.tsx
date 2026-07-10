import clsx from "clsx";
import { Avatar } from "@/components/ui/Avatar";
import { etiquetaFechaRelativa } from "@/lib/seguimientoFechaLabel";
import { diasDeAtraso } from "@/lib/seguimientoFecha";

interface SeguimientoPendienteRowProps {
  descripcion: string;
  responsableNombre: string;
  fechaProgramada: number;
  pendingAction: boolean;
  onMarcarHecho: () => void;
}

/** Fila de seguimiento pendiente dentro de la ficha de cliente (WUA-11) — a
 * diferencia de `SeguimientoItem` (Hoy), no muestra avatar/nombre de cliente
 * ni navega a su ficha, porque ya estamos dentro de ella. */
export function SeguimientoPendienteRow({
  descripcion,
  responsableNombre,
  fechaProgramada,
  pendingAction,
  onMarcarHecho,
}: SeguimientoPendienteRowProps) {
  const atrasado = diasDeAtraso(fechaProgramada) > 0;
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
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[15px] font-semibold text-text">{descripcion}</span>
        <span className={clsx("text-xs", atrasado ? "font-medium text-error-text" : "text-text-subtle")}>
          {etiquetaFechaRelativa(fechaProgramada)}
        </span>
      </div>
      <span title={responsableNombre} className="inline-flex shrink-0">
        <Avatar nombre={responsableNombre} size={22} />
      </span>
    </div>
  );
}
