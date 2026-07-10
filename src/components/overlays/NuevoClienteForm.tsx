"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api, type Id } from "@/lib/convexApi";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { OverlayShell } from "./OverlayShell";
import { useToast } from "@/lib/toast";
import type { CanalOrigen } from "@/types";
import type { Doc } from "@/lib/convexApi";

const CANAL_OPTIONS: { value: CanalOrigen; label: string }[] = [
  { value: "web", label: "Web" },
  { value: "redes", label: "Redes" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
];

interface NuevoClienteFormProps {
  onClose: () => void;
  onCreated?: (id: Id<"clientes">) => void;
  /** Ficha de cliente (WUA-11): si se pasa, el formulario abre en modo edición
   * (precarga los campos y guarda con `clientes.update` en vez de `create`). */
  cliente?: Doc<"clientes">;
  onUpdated?: () => void;
}

/** Overlay "Nuevo cliente" (WUA-10) — alta rápida, también accesible desde
 * el flujo anidado de "Nueva tarea" (WUA-62), o en modo edición desde la
 * ficha de cliente (WUA-11, prop `cliente`). */
export function NuevoClienteForm({ onClose, onCreated, cliente, onUpdated }: NuevoClienteFormProps) {
  const crearCliente = useMutation(api.clientes.create);
  const actualizarCliente = useMutation(api.clientes.update);
  const { showToast } = useToast();

  const [nombre, setNombre] = useState(cliente?.nombre ?? "");
  const [empresa, setEmpresa] = useState(cliente?.empresa ?? "");
  const [telefono, setTelefono] = useState(cliente?.telefono ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [canalOrigen, setCanalOrigen] = useState<CanalOrigen | null>(cliente?.canalOrigen ?? null);
  const [nota, setNota] = useState(cliente?.nota ?? "");
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [triedSave, setTriedSave] = useState(false);

  const nombreErr = triedSave && !nombre.trim() ? "El nombre es obligatorio" : undefined;
  const contactoErr =
    triedSave && !telefono.trim() && !email.trim() ? "Añade al menos un teléfono o un email" : undefined;

  function handleField<T>(setter: (v: T) => void, value: T) {
    setDirty(true);
    setter(value);
  }

  async function handleSave() {
    setTriedSave(true);
    if (!nombre.trim() || (!telefono.trim() && !email.trim())) return;
    setSubmitting(true);
    try {
      if (cliente) {
        await actualizarCliente({
          id: cliente._id,
          nombre,
          empresa: empresa || undefined,
          telefono: telefono || undefined,
          email: email || undefined,
          nota: nota || undefined,
          canalOrigen: canalOrigen ?? undefined,
        });
        showToast({ message: "Cliente actualizado" });
        onUpdated?.();
      } else {
        const id = await crearCliente({
          nombre,
          empresa: empresa || undefined,
          telefono: telefono || undefined,
          email: email || undefined,
          nota: nota || undefined,
          canalOrigen: canalOrigen ?? undefined,
        });
        showToast({ message: "Cliente añadido" });
        onCreated?.(id);
      }
    } catch (e) {
      showToast({
        message: e instanceof Error ? e.message : "No se pudo guardar el cliente",
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
      title={cliente ? "Editar cliente" : "Nuevo cliente"}
      isDirty={dirty}
      isSubmitting={submitting}
      saveAction={
        <Button type="button" className="w-full" loading={submitting} onClick={handleSave}>
          Guardar
        </Button>
      }
    >
      <Input
        label="Nombre"
        placeholder="Marta López"
        value={nombre}
        onChange={(e) => handleField(setNombre, e.target.value)}
        error={nombreErr}
        autoFocus
      />
      <Input
        label="Empresa"
        placeholder="Acme S.L."
        value={empresa}
        onChange={(e) => handleField(setEmpresa, e.target.value)}
      />
      <Input
        label="Teléfono"
        type="tel"
        placeholder="+34 600 000 000"
        value={telefono}
        onChange={(e) => handleField(setTelefono, e.target.value)}
        error={contactoErr}
      />
      <Input
        label="Email"
        type="email"
        placeholder="nombre@empresa.es"
        value={email}
        onChange={(e) => handleField(setEmail, e.target.value)}
      />
      <SegmentedControl
        label="Canal de origen"
        options={CANAL_OPTIONS}
        value={canalOrigen}
        onChange={(v) => handleField(setCanalOrigen, v)}
        allowDeselect
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text" htmlFor="nota-cliente">
          Nota
        </label>
        <textarea
          id="nota-cliente"
          rows={3}
          placeholder="Detalle del primer contacto, necesidades…"
          value={nota}
          onChange={(e) => handleField(setNota, e.target.value)}
          className="min-h-[84px] resize-y rounded-md border border-border-strong bg-surface px-3.5 py-3 text-[15px] text-text placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        />
      </div>
    </OverlayShell>
  );
}
