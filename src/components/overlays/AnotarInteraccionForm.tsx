"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api, type Id } from "@/lib/convexApi";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { OverlayShell } from "./OverlayShell";
import { ClienteSelect } from "./ClienteSelect";
import { useToast } from "@/lib/toast";
import { useUsuarioActual } from "@/lib/session";
import { dateStringToBusinessDayEpoch, todayDateInputValue } from "@/lib/seguimientoFecha";
import type { CanalInteraccion } from "@/types";

const CANAL_OPTIONS: { value: CanalInteraccion; label: string }[] = [
  { value: "llamada", label: "Llamada" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "en_persona", label: "En persona" },
];

interface ClienteFijo {
  id: Id<"clientes">;
  nombre: string;
}

interface AnotarInteraccionFormProps {
  onClose: () => void;
  /** Ficha de cliente (WUA-11): cliente ya fijado, sin selector. */
  clienteFijo?: ClienteFijo;
}

/** Overlay "Anotar interacción" (WUA-12), abierto desde Hoy (sin cliente de
 * contexto) o desde la ficha de un cliente (con `clienteFijo`, sin selector). */
export function AnotarInteraccionForm({ onClose, clienteFijo }: AnotarInteraccionFormProps) {
  const crearInteraccion = useMutation(api.interacciones.create);
  const { showToast } = useToast();
  const { usuario } = useUsuarioActual();

  const [clienteId, setClienteId] = useState<Id<"clientes"> | "">(clienteFijo?.id ?? "");
  const [canal, setCanal] = useState<CanalInteraccion | null>(null);
  const [fecha, setFecha] = useState(todayDateInputValue());
  const [contenido, setContenido] = useState("");
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [triedSave, setTriedSave] = useState(false);

  const clienteErr = triedSave && !clienteId ? "Selecciona un cliente" : undefined;
  const canalErr = triedSave && !canal ? "Selecciona un canal" : undefined;
  const contenidoErr = triedSave && !contenido.trim() ? "La nota no puede estar vacía" : undefined;

  function handleField<T>(setter: (v: T) => void, value: T) {
    setDirty(true);
    setter(value);
  }

  async function handleSave() {
    setTriedSave(true);
    if (!clienteId || !canal || !contenido.trim() || !usuario) return;
    setSubmitting(true);
    try {
      await crearInteraccion({
        clienteId,
        canal,
        contenido,
        fecha: fecha ? dateStringToBusinessDayEpoch(fecha) : undefined,
      });
      showToast({ message: "Interacción registrada" });
      onClose();
    } catch (e) {
      showToast({
        message: e instanceof Error ? e.message : "No se pudo registrar la interacción",
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
      title="Anotar interacción"
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
      {clienteFijo ? (
        <p className="text-sm text-text-muted">
          Cliente: <span className="font-medium text-text">{clienteFijo.nombre}</span>
        </p>
      ) : (
        <ClienteSelect value={clienteId} onChange={(v) => handleField(setClienteId, v)} error={clienteErr} />
      )}
      <SegmentedControl
        label="Canal"
        options={CANAL_OPTIONS}
        value={canal}
        onChange={(v) => handleField(setCanal, v)}
        error={canalErr}
      />
      <Input
        label="Fecha"
        type="date"
        value={fecha}
        onChange={(e) => handleField(setFecha, e.target.value)}
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text" htmlFor="nota-interaccion">
          Nota
        </label>
        <textarea
          id="nota-interaccion"
          rows={3}
          autoFocus
          placeholder="Qué se ha hablado, próximos pasos…"
          value={contenido}
          onChange={(e) => handleField(setContenido, e.target.value)}
          className="min-h-[84px] resize-y rounded-md border border-border-strong bg-surface px-3.5 py-3 text-[15px] text-text placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        />
        {contenidoErr && <p className="text-[13px] text-error-text">{contenidoErr}</p>}
      </div>
      {usuario && (
        <p className="text-[13px] text-text-muted">Se registrará como {usuario.nombre}</p>
      )}
    </OverlayShell>
  );
}
