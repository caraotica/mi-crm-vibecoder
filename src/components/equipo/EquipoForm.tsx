"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import type { Doc } from "@/lib/convexApi";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { OverlayShell } from "@/components/overlays/OverlayShell";
import { useToast } from "@/lib/toast";
import { esEmailValido } from "@/lib/email";
import { ROL_LABEL, type Rol } from "@/types";

const ROL_OPTIONS: { value: Rol; label: string }[] = [
  { value: "propietaria", label: ROL_LABEL.propietaria },
  { value: "comercial", label: ROL_LABEL.comercial },
];

interface EquipoFormProps {
  onClose: () => void;
  /** Pantalla Equipo (WUA-59): sin `usuario`, alta; con `usuario`, edición. */
  usuario?: Doc<"usuarios">;
}

export function EquipoForm({ onClose, usuario }: EquipoFormProps) {
  const crear = useMutation(api.usuarios.create);
  const actualizar = useMutation(api.usuarios.update);
  const { showToast } = useToast();

  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [rol, setRol] = useState<Rol | null>(usuario?.rol ?? "comercial");
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [triedSave, setTriedSave] = useState(false);

  const nombreErr = triedSave && !nombre.trim() ? "El nombre es obligatorio" : undefined;
  const emailErr = triedSave && !esEmailValido(email) ? "Introduce un email válido" : undefined;

  function handleField<T>(setter: (v: T) => void, value: T) {
    setDirty(true);
    setter(value);
  }

  async function handleSave() {
    setTriedSave(true);
    if (!nombre.trim() || !esEmailValido(email) || !rol) return;
    setSubmitting(true);
    try {
      if (usuario) {
        await actualizar({ id: usuario._id, nombre, email, rol });
        showToast({ message: "Usuario actualizado" });
      } else {
        await crear({ nombre, email, rol });
        showToast({ message: "Usuario añadido" });
      }
      onClose();
    } catch (e) {
      showToast({
        message: e instanceof Error ? e.message : "No se pudo guardar el usuario",
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
      title={usuario ? "Editar usuario" : "Añadir usuario"}
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
        placeholder="Carlos Ruiz"
        value={nombre}
        onChange={(e) => handleField(setNombre, e.target.value)}
        error={nombreErr}
        autoFocus
      />
      <Input
        label="Email"
        type="email"
        placeholder="carlos@empresa.es"
        value={email}
        onChange={(e) => handleField(setEmail, e.target.value)}
        error={emailErr}
      />
      <SegmentedControl
        label="Rol"
        options={ROL_OPTIONS}
        value={rol}
        onChange={(v) => v && handleField(setRol, v)}
      />
      {!usuario && (
        <p className="text-[13px] text-text-muted">
          Esta persona aparecerá en el equipo, pero todavía no podrá iniciar sesión con este email.
        </p>
      )}
    </OverlayShell>
  );
}
