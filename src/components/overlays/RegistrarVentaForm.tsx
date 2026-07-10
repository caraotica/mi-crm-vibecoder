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
import { dateStringToBusinessDayEpoch, todayDateInputValue } from "@/lib/seguimientoFecha";
import { ESTADO_VENTA_LABEL, type EstadoVenta } from "@/types";

const ESTADO_OPTIONS: { value: EstadoVenta; label: string }[] = (
  ["abierta", "ganada", "perdida"] as const
).map((value) => ({ value, label: ESTADO_VENTA_LABEL[value] }));

interface ClienteFijo {
  id: Id<"clientes">;
  nombre: string;
}

interface RegistrarVentaFormProps {
  onClose: () => void;
  /** Ficha de cliente (WUA-11): cliente ya fijado, sin selector. */
  clienteFijo?: ClienteFijo;
}

/** Overlay "Registrar venta" (WUA-13), abierto desde Hoy (sin cliente de
 * contexto) o desde la ficha de un cliente (con `clienteFijo`, sin selector). */
export function RegistrarVentaForm({ onClose, clienteFijo }: RegistrarVentaFormProps) {
  const crearVenta = useMutation(api.ventas.create);
  const { showToast } = useToast();

  const [clienteId, setClienteId] = useState<Id<"clientes"> | "">(clienteFijo?.id ?? "");
  const [producto, setProducto] = useState("");
  const [importe, setImporte] = useState("");
  const [estado, setEstado] = useState<EstadoVenta>("abierta");
  const [fecha, setFecha] = useState(todayDateInputValue());
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [triedSave, setTriedSave] = useState(false);

  const monto = Number(importe.replace(",", "."));
  const montoValido = Number.isFinite(monto) && monto > 0;

  const clienteErr = triedSave && !clienteId ? "Selecciona un cliente" : undefined;
  const productoErr = triedSave && !producto.trim() ? "Falta el producto/concepto" : undefined;
  const importeErr = triedSave && !montoValido ? "El importe debe ser mayor que 0" : undefined;

  function handleField<T>(setter: (v: T) => void, value: T) {
    setDirty(true);
    setter(value);
  }

  async function handleSave() {
    setTriedSave(true);
    if (!clienteId || !producto.trim() || !montoValido) return;
    setSubmitting(true);
    try {
      await crearVenta({
        clienteId,
        producto,
        monto,
        estado,
        fecha: fecha ? dateStringToBusinessDayEpoch(fecha) : undefined,
      });
      showToast({ message: "Venta registrada" });
      onClose();
    } catch (e) {
      showToast({
        message: e instanceof Error ? e.message : "No se pudo registrar la venta",
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
      title="Registrar venta"
      isDirty={dirty}
      isSubmitting={submitting}
      saveAction={
        <Button type="button" className="w-full" loading={submitting} onClick={handleSave}>
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
      <Input
        label="Qué se vende"
        placeholder="Licencia anual, servicio…"
        value={producto}
        onChange={(e) => handleField(setProducto, e.target.value)}
        error={productoErr}
        autoFocus
      />
      <Input
        label="Importe (€)"
        type="text"
        inputMode="decimal"
        placeholder="1200"
        value={importe}
        onChange={(e) => handleField(setImporte, e.target.value)}
        error={importeErr}
      />
      <SegmentedControl label="Estado" options={ESTADO_OPTIONS} value={estado} onChange={(v) => v && handleField(setEstado, v)} />
      <Input
        label="Fecha"
        type="date"
        value={fecha}
        onChange={(e) => handleField(setFecha, e.target.value)}
      />
    </OverlayShell>
  );
}
