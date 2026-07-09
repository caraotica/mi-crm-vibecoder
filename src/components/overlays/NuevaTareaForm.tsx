"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api, type Id } from "@/lib/convexApi";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OverlayShell } from "./OverlayShell";
import { ClienteSelect } from "./ClienteSelect";
import { useToast } from "@/lib/toast";
import { useMockSession } from "@/lib/session";
import { dateStringToBusinessDayEpoch } from "@/lib/seguimientoFecha";

export interface NuevaTareaDraft {
  titulo?: string;
  clienteId?: Id<"clientes">;
  fecha?: string;
}

interface NuevaTareaFormProps {
  onClose: () => void;
  initialDraft?: NuevaTareaDraft;
  onOpenNuevoCliente: (draft: NuevaTareaDraft) => void;
}

/** Overlay "Nueva tarea" (WUA-62) — acción destacada del panel de accesos
 * rápidos de Hoy. El enlace "+ Nuevo cliente" abre NuevoClienteForm y, al
 * guardar, vuelve aquí con el cliente preseleccionado (ver HoyPage). */
export function NuevaTareaForm({ onClose, initialDraft, onOpenNuevoCliente }: NuevaTareaFormProps) {
  const crearSeguimiento = useMutation(api.seguimientos.create);
  const { showToast } = useToast();
  const { usuario } = useMockSession();

  const [titulo, setTitulo] = useState(initialDraft?.titulo ?? "");
  const [clienteId, setClienteId] = useState<Id<"clientes"> | "">(initialDraft?.clienteId ?? "");
  const [fecha, setFecha] = useState(initialDraft?.fecha ?? "");
  const [dirty, setDirty] = useState(!!initialDraft);
  const [submitting, setSubmitting] = useState(false);
  const [triedSave, setTriedSave] = useState(false);

  const tituloErr = triedSave && !titulo.trim() ? "Falta el título" : undefined;
  const clienteErr = triedSave && !clienteId ? "Selecciona un cliente" : undefined;
  const fechaErr = triedSave && !fecha ? "Falta la fecha" : undefined;

  function handleField<T>(setter: (v: T) => void, value: T) {
    setDirty(true);
    setter(value);
  }

  async function handleSave() {
    setTriedSave(true);
    if (!titulo.trim() || !clienteId || !fecha || !usuario) return;
    setSubmitting(true);
    try {
      await crearSeguimiento({
        clienteId,
        descripcion: titulo,
        responsableId: usuario._id,
        fechaProgramada: dateStringToBusinessDayEpoch(fecha),
        origen: "manual",
      });
      showToast({ message: "Tarea creada" });
      onClose();
    } catch (e) {
      showToast({
        message: e instanceof Error ? e.message : "No se pudo crear la tarea",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <OverlayShell
      open
      onClose={onClose}
      title="Nueva tarea"
      isDirty={dirty}
      isSubmitting={submitting}
      saveAction={
        <Button
          type="button"
          className="w-full"
          loading={submitting}
          disabled={!usuario}
          onClick={handleSave}
        >
          Guardar
        </Button>
      }
    >
      <Input
        label="Título"
        placeholder="Llamar para cierre"
        value={titulo}
        onChange={(e) => handleField(setTitulo, e.target.value)}
        error={tituloErr}
        autoFocus
      />
      <ClienteSelect
        value={clienteId}
        onChange={(v) => handleField(setClienteId, v)}
        error={clienteErr}
        headerAction={
          <button
            type="button"
            onClick={() => onOpenNuevoCliente({ titulo, fecha })}
            className="text-[13px] font-semibold text-primary hover:underline"
          >
            + Nuevo cliente
          </button>
        }
      />
      <Input
        label="Fecha"
        type="date"
        value={fecha}
        onChange={(e) => handleField(setFecha, e.target.value)}
        error={fechaErr}
      />
    </OverlayShell>
  );
}
