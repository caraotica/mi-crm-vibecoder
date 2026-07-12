"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ROL_LABEL, type Rol } from "@/types";

interface EquipoRowProps {
  nombre: string;
  email: string;
  rol: Rol;
  esUsuarioActual: boolean;
  onEditar: () => void;
  onEliminar: () => void;
}

/** Fila de la pantalla Equipo (WUA-59): avatar, nombre/email, chip de rol y
 * acciones Editar/Eliminar — sin botón Eliminar en la propia fila (regla de
 * negocio: no auto-eliminación). */
export function EquipoRow({ nombre, email, rol, esUsuarioActual, onEditar, onEliminar }: EquipoRowProps) {
  return (
    <div className="flex min-h-[44px] items-center gap-3 py-2.5">
      <Avatar nombre={nombre} size={40} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="truncate text-[15px] font-semibold text-text">{nombre}</span>
          <Badge status={rol === "propietaria" ? "primary" : "neutral"} dot={false} className="shrink-0">
            {ROL_LABEL[rol]}
          </Badge>
        </div>
        <span className="truncate text-[13px] text-text-muted">{email}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onEditar}
          aria-label={`Editar a ${nombre}`}
          className="flex h-9 w-9 items-center justify-center rounded-md text-text-subtle hover:bg-surface-2"
        >
          <Pencil size={18} strokeWidth={1.5} />
        </button>
        {!esUsuarioActual && (
          <button
            type="button"
            onClick={onEliminar}
            aria-label={`Eliminar a ${nombre}`}
            className="flex h-9 w-9 items-center justify-center rounded-md text-text-subtle hover:bg-error-bg hover:text-error-text"
          >
            <Trash2 size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}
