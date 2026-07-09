"use client";

import { CalendarPlus, MessageSquare, CircleDollarSign, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

export type QuickActionKind = "tarea" | "interaccion" | "venta" | "cliente";

interface Tile {
  kind: QuickActionKind;
  label: string;
  icon: LucideIcon;
  destacada?: boolean;
}

const TILES: Tile[] = [
  { kind: "tarea", label: "Nueva tarea", icon: CalendarPlus, destacada: true },
  { kind: "interaccion", label: "Anotar interacción", icon: MessageSquare },
  { kind: "venta", label: "Registrar venta", icon: CircleDollarSign },
  { kind: "cliente", label: "Nuevo cliente", icon: UserPlus },
];

interface QuickActionsPanelProps {
  onOpen: (kind: QuickActionKind) => void;
}

/** Panel de accesos rápidos de Hoy (WUA-17): 4 tiles, 4 col escritorio / 2×2 móvil. */
export function QuickActionsPanel({ onOpen }: QuickActionsPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {TILES.map(({ kind, label, icon: Icon, destacada }) => (
        <button
          key={kind}
          type="button"
          onClick={() => onOpen(kind)}
          className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-5 text-center shadow-xs transition-colors duration-150 hover:border-border-strong hover:bg-surface-2"
        >
          <span
            className={clsx(
              "flex h-11 w-11 items-center justify-center rounded-full",
              destacada ? "bg-primary text-on-primary" : "bg-primary-subtle text-primary",
            )}
          >
            <Icon size={20} strokeWidth={1.5} />
          </span>
          <span className="text-[13px] font-medium text-text">{label}</span>
        </button>
      ))}
    </div>
  );
}
