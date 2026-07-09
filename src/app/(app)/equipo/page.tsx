"use client";

import { UserCog, Lock } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { useMockSession } from "@/lib/session";

/**
 * Gate de rol para /equipo (WUA-23/WUA-59). Es un filtro de navegación —
 * defensa en caso de visita directa por URL, igual que el filtro de
 * AppShell — NO es autorización real: la Convex function subyacente no
 * verifica rol (ver frontera de autorización en el README).
 */
export default function EquipoPage() {
  const { usuario, isLoading } = useMockSession();

  if (isLoading) return null;

  if (usuario?.rol !== "propietaria") {
    return (
      <div className="mx-auto max-w-3xl p-5 md:p-8">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-8 text-center shadow-xs">
          <Lock size={24} strokeWidth={1.5} className="text-text-subtle" />
          <p className="text-[15px] font-semibold text-text">Acceso restringido</p>
          <p className="max-w-xs text-[13px] text-text-muted">
            Solo la Dueña puede gestionar el equipo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-5 md:p-8">
      <ComingSoon
        icon={UserCog}
        helpText="La gestión de usuarios y roles todavía no está construida"
        ticket="WUA-59"
      />
    </div>
  );
}
