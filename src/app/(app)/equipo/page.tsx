import { UserCog } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { getMockSession } from "@/lib/session";

/**
 * Pantalla 10 — Equipo (PRD "Pantallas"; Linear WUA-59). Solo accesible con
 * rol "propietaria" — TODO: mover esta comprobación a un guard real de auth
 * (WUA-8) en cuanto exista sesión de verdad.
 */
export default function EquipoPage() {
  const session = getMockSession();
  if (session.user.rol !== "propietaria") {
    return (
      <div className="mx-auto max-w-[860px] px-4 py-6 md:px-8">
        <p className="text-[15px] font-semibold text-text">Acceso restringido</p>
        <p className="mt-1 text-sm text-text-muted">
          Solo la propietaria del negocio puede gestionar el equipo.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 md:px-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-text">Equipo</h1>
        <Button>+ Añadir usuario</Button>
      </div>

      <div className="mt-6">
        <EmptyState
          icon={UserCog}
          title="Solo estás tú en el equipo"
          helpText="En cuanto conectes Convex, verás aquí la lista real de usuarios."
        />
      </div>
    </div>
  );
}
