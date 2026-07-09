"use client";

import { useId, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { api, type Id } from "@/lib/convexApi";
import { Select } from "@/components/ui/Select";

interface ClienteSelectProps {
  value: Id<"clientes"> | "";
  onChange: (id: Id<"clientes"> | "") => void;
  error?: string;
  /** p. ej. el enlace "+ Nuevo cliente" de Nueva tarea (WUA-62). */
  headerAction?: ReactNode;
}

/**
 * Selector de cliente reutilizado por los 3 overlays que se abren fuera de
 * una ficha (WUA-62 Nueva tarea, WUA-12 interacción, WUA-13 venta).
 * Alcance: lista plana sin buscador/paginación — aceptable para el volumen
 * esperado del MVP, revisar si el número de clientes crece mucho.
 */
export function ClienteSelect({ value, onChange, error, headerAction }: ClienteSelectProps) {
  const clientes = useQuery(api.clientes.list, {});
  const selectId = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={selectId} className="text-sm font-medium text-text">
          Cliente
        </label>
        {headerAction}
      </div>
      <Select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value as Id<"clientes"> | "")}
        error={error}
        disabled={clientes === undefined}
      >
        <option value="">Selecciona un cliente</option>
        {clientes?.map((c) => (
          <option key={c._id} value={c._id}>
            {c.nombre}
          </option>
        ))}
      </Select>
    </div>
  );
}
