import { CalendarCheck, MessageSquarePlus, TrendingUp, UserPlus, ListPlus } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Pantalla 1 — Hoy (PRD "Pantallas"; Linear WUA-17/18/62).
 * TODO: reemplazar el estado vacío por `useQuery(api.seguimientos.listHoy)`
 * una vez enlazado Convex (ver README → "Conectar Convex").
 * TODO: panel de accesos rápidos → 4 tiles (Nueva tarea, Anotar interacción,
 * Registrar venta, Nuevo cliente), cada uno abriendo su overlay
 * (components/overlays, ver README de esa carpeta).
 */
export default function HoyPage() {
  const quickActions = [
    { label: "Nueva tarea", icon: ListPlus },
    { label: "Anotar interacción", icon: MessageSquarePlus },
    { label: "Registrar venta", icon: TrendingUp },
    { label: "Nuevo cliente", icon: UserPlus },
  ];

  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 md:px-8">
      <p className="text-xs font-medium uppercase tracking-[.06em] text-text-subtle">
        Hoy
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-text">
        0 seguimientos pendientes
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {quickActions.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center shadow-xs hover:bg-surface-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-subtle text-primary">
              <Icon size={18} strokeWidth={1.5} />
            </div>
            <span className="text-[13px] font-medium text-text">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <EmptyState
          icon={CalendarCheck}
          title="No hay seguimientos para hoy"
          helpText="En cuanto conectes Convex, aquí aparecerán los atrasados, los de hoy y los próximos."
        />
      </div>
    </div>
  );
}
