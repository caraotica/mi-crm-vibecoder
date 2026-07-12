"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation } from "convex/react";
import { api, type Id } from "@/lib/convexApi";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast";

interface ConfirmarEliminarUsuarioProps {
  id: Id<"usuarios">;
  nombre: string;
  onClose: () => void;
}

/** Confirmación de baja de usuario (WUA-59) — confirm puro, no reutiliza
 * `OverlayShell` porque este no tiene formulario ni estado "sucio". El
 * backend (`usuarios.remove`) ya valida no-auto-eliminación y que quede al
 * menos una propietaria; el mensaje de error de esa regla se muestra vía
 * toast si salta (p. ej. al eliminar a la única otra propietaria). */
export function ConfirmarEliminarUsuario({ id, nombre, onClose }: ConfirmarEliminarUsuarioProps) {
  const eliminar = useMutation(api.usuarios.remove);
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await eliminar({ id });
      showToast({ message: "Usuario eliminado" });
      onClose();
    } catch (e) {
      showToast({
        message: e instanceof Error ? e.message : "No se pudo eliminar el usuario",
        variant: "error",
      });
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open onOpenChange={(next) => !next && !submitting && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(16,24,32,.45)]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 m-auto flex h-fit w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-lg outline-none"
        >
          <Dialog.Title className="text-lg font-semibold text-text">Eliminar a {nombre}</Dialog.Title>
          <p className="text-sm text-text-muted">
            Perderá el acceso al CRM. Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2.5 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              loading={submitting}
              onClick={handleConfirm}
            >
              Eliminar
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
