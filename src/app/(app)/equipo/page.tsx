"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Lock, Plus } from "lucide-react";
import { api, type Doc } from "@/lib/convexApi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useUsuarioActual } from "@/lib/session";
import { EquipoRow } from "@/components/equipo/EquipoRow";
import { EquipoForm } from "@/components/equipo/EquipoForm";
import { ConfirmarEliminarUsuario } from "@/components/equipo/ConfirmarEliminarUsuario";

type Overlay =
  | { kind: "nuevo" }
  | { kind: "editar"; usuario: Doc<"usuarios"> }
  | { kind: "eliminar"; usuario: Doc<"usuarios"> }
  | null;

/**
 * Pantalla "Equipo" (WUA-59): alta/edición/baja de usuarios reales, solo
 * para rol `propietaria`. El gate de rol es UX (evita el parpadeo/flash de
 * contenido) — la autorización real ya está verificada en servidor
 * (`convex/usuarios.ts`: create/update/remove exigen rol "propietaria").
 */
export default function EquipoPage() {
  const { usuario, isLoading } = useUsuarioActual();
  const usuarios = useQuery(api.usuarios.list, {});
  const [overlay, setOverlay] = useState<Overlay>(null);

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
    <div className="mx-auto flex max-w-3xl flex-col gap-5 p-5 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-text">Equipo</h1>
        <Button onClick={() => setOverlay({ kind: "nuevo" })}>
          <Plus size={18} strokeWidth={2} />
          Añadir usuario
        </Button>
      </div>

      {usuarios === undefined ? (
        <div />
      ) : (
        <Card padded={false} className="divide-y divide-border px-4">
          {usuarios.map((u) => (
            <EquipoRow
              key={u._id}
              nombre={u.nombre}
              email={u.email}
              rol={u.rol}
              esUsuarioActual={u._id === usuario._id}
              onEditar={() => setOverlay({ kind: "editar", usuario: u })}
              onEliminar={() => setOverlay({ kind: "eliminar", usuario: u })}
            />
          ))}
        </Card>
      )}

      {overlay?.kind === "nuevo" && <EquipoForm onClose={() => setOverlay(null)} />}
      {overlay?.kind === "editar" && (
        <EquipoForm usuario={overlay.usuario} onClose={() => setOverlay(null)} />
      )}
      {overlay?.kind === "eliminar" && (
        <ConfirmarEliminarUsuario
          id={overlay.usuario._id}
          nombre={overlay.usuario.nombre}
          onClose={() => setOverlay(null)}
        />
      )}
    </div>
  );
}
