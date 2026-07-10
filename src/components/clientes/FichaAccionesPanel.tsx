"use client";

import { MessageSquare, CalendarPlus, CircleDollarSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type FichaAccionKind = "interaccion" | "seguimiento" | "venta";

interface Tile {
  kind: FichaAccionKind;
  label: string;
  icon: LucideIcon;
}

const TILES: Tile[] = [
  { kind: "interaccion", label: "Anotar interacción", icon: MessageSquare },
  { kind: "seguimiento", label: "Programar seguimiento", icon: CalendarPlus },
  { kind: "venta", label: "Registrar venta", icon: CircleDollarSign },
];

interface FichaAccionesPanelProps {
  onOpen: (kind: FichaAccionKind) => void;
}

/** Panel de acciones rápidas de la ficha de cliente (WUA-11): 3 tiles, fila
 * en escritorio / columna en móvil (mismo lenguaje visual que QuickActionsPanel de Hoy). */
export function FichaAccionesPanel({ onOpen }: FichaAccionesPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {TILES.map(({ kind, label, icon: Icon }) => (
        <button
          key={kind}
          type="button"
          onClick={() => onOpen(kind)}
          className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-5 text-center shadow-xs transition-colors duration-150 hover:border-border-strong hover:bg-surface-2"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-subtle text-primary">
            <Icon size={20} strokeWidth={1.5} />
          </span>
          <span className="text-[13px] font-medium text-text">{label}</span>
        </button>
      ))}
    </div>
  );
}
