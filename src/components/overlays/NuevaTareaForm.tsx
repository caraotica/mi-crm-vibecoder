"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api, type Id } from "@/lib/convexApi";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { OverlayShell } from "./OverlayShell";
import { ClienteSelect } from "./ClienteSelect";
import { useToast } from "@/lib/toast";
import { useUsuarioActual } from "@/lib/session";
import { dateStringToBusinessDayEpoch, mananaDateInputValue } from "@/lib/seguimientoFecha";

export interface NuevaTareaDraft {
  titulo?: string;
  clienteId?: Id<"clientes">;
  fecha?: string;
}

interface ClienteFijo {
  id: Id<"clientes">;
  nombre: string;
}

interface NuevaTareaFormProps {
  onClose: () => void;
  initialDraft?: NuevaTareaDraft;
  onOpenNuevoCliente?: (draft: NuevaTareaDraft) => void;
  /** Ficha de cliente (WUA-11/WUA-19): cliente ya fijado, sin selector. */
  clienteFijo?: ClienteFijo;
}

/** Overlay "Nueva tarea"/"Programar seguimiento" (WUA-62/WUA-19) — acción
 * destacada del panel de accesos rápidos de Hoy, o de la ficha de cliente
 * (con `clienteFijo`, sin selector). El enlace "+ Nuevo cliente" abre
 * NuevoClienteForm y, al guardar, vuelve aquí con el cliente preseleccionado
 * (ver HoyPage) — no aplica cuando el cliente ya está fijado. */
export function NuevaTareaForm({ onClose, initialDraft, onOpenNuevoCliente, clienteFijo }: NuevaTareaFormProps) {
  const crearSeguimiento = useMutation(api.seguimientos.create);
  const { showToast } = useToast();
  const { usuario: usuarioActual } = useUsuarioActual();
  const usuarios = useQuery(api.usuarios.list, clienteFijo ? {} : "skip");

  const [titulo, setTitulo] = useState(initialDraft?.titulo ?? "");
  const [clienteId, setClienteId] = useState<Id<"clientes"> | "">(
    clienteFijo?.id ?? initialDraft?.clienteId ?? "",
  );
  const [fecha, setFecha] = useState(initialDraft?.fecha ?? (clienteFijo ? mananaDateInputValue() : ""));
  const [responsableIdElegido, setResponsableIdElegido] = useState<Id<"usuarios"> | "">("");
  const [dirty, setDirty] = useState(!!initialDraft);
  const [submitting, setSubmitting] = useState(false);
  const [triedSave, setTriedSave] = useState(false);

  // Sin elección explícita, el responsable por defecto es el usuario de sesión
  // (WUA-19) — se deriva en cada render en vez de sincronizarse con un efecto,
  // porque `usuarioActual` llega async y no hay nada que "suscribir".
  const responsableId = responsableIdElegido || usuarioActual?._id || "";

  const tituloErr = triedSave && !titulo.trim() ? "Falta el título" : undefined;
  const clienteErr = triedSave && !clienteId ? "Selecciona un cliente" : undefined;
  const fechaErr = triedSave && !fecha ? "Falta la fecha" : undefined;
  const responsableErr = triedSave && clienteFijo && !responsableId ? "Selecciona un responsable" : undefined;

  function handleField<T>(setter: (v: T) => void, value: T) {
    setDirty(true);
    setter(value);
  }

  async function handleSave() {
    setTriedSave(true);
    if (!titulo.trim() || !clienteId || !fecha || (clienteFijo && !responsableId)) return;
    setSubmitting(true);
    try {
      await crearSeguimiento({
        clienteId,
        descripcion: titulo,
        fechaProgramada: dateStringToBusinessDayEpoch(fecha),
        origen: "manual",
        responsableId: clienteFijo && responsableId ? responsableId : undefined,
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
        <Button type="button" className="w-full" loading={submitting} onClick={handleSave}>
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
      {clienteFijo ? (
        <p className="text-sm text-text-muted">
          Cliente: <span className="font-medium text-text">{clienteFijo.nombre}</span>
        </p>
      ) : (
        <ClienteSelect
          value={clienteId}
          onChange={(v) => handleField(setClienteId, v)}
          error={clienteErr}
          headerAction={
            <button
              type="button"
              onClick={() => onOpenNuevoCliente?.({ titulo, fecha })}
              className="text-[13px] font-semibold text-primary hover:underline"
            >
              + Nuevo cliente
            </button>
          }
        />
      )}
      <Input
        label="Fecha"
        type="date"
        value={fecha}
        onChange={(e) => handleField(setFecha, e.target.value)}
        error={fechaErr}
      />
      {clienteFijo && (
        <SegmentedControl
          label="Responsable"
          options={(usuarios ?? []).map((u) => ({ value: u._id, label: u.nombre }))}
          value={responsableId || null}
          onChange={(v) => v && handleField(setResponsableIdElegido, v)}
          error={responsableErr}
        />
      )}
    </OverlayShell>
  );
}
