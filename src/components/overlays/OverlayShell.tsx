"use client";

import { useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface OverlayShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  isDirty: boolean;
  isSubmitting: boolean;
  children: ReactNode;
  /** Botón de acción principal (p. ej. "Guardar") — "Cancelar" lo provee este componente. */
  saveAction: ReactNode;
}

/**
 * Overlay compartido por los 4 formularios de accesos rápidos (WUA-62/12/13/10):
 * bottom sheet en móvil / modal centrado en escritorio, sobre
 * @radix-ui/react-dialog en vez de una trampa de foco hecha a mano — resuelve
 * `aria-labelledby`, foco inicial en el primer campo, restauración de foco al
 * disparador, y distinción correcta entre clic en el contenido y en el scrim.
 *
 * `open` es siempre controlado por quien lo usa (máquina OverlayState de
 * HoyPage): Radix nunca cierra por su cuenta, solo pide cerrar vía
 * onOpenChange — así se puede interceptar con la confirmación de "¿descartar
 * cambios?" cuando el formulario está sucio.
 */
export function OverlayShell({
  open,
  onClose,
  title,
  isDirty,
  isSubmitting,
  children,
  saveAction,
}: OverlayShellProps) {
  // Cada overlay se monta/desmonta por completo al abrirse/cerrarse (ver
  // HoyPage), así que `open` nunca pasa a `false` con el componente todavía
  // montado — no hace falta un efecto para reiniciar este estado.
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  function requestClose() {
    if (isSubmitting) return;
    if (isDirty && !confirmingDiscard) {
      setConfirmingDiscard(true);
      return;
    }
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && requestClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(16,24,32,.45)]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col gap-4 overflow-y-auto rounded-t-2xl border-t border-border bg-surface p-5 shadow-lg outline-none md:inset-0 md:m-auto md:h-fit md:max-h-[85vh] md:w-full md:max-w-md md:rounded-xl md:border"
        >
          <div className="mx-auto -mt-1 mb-1 h-1 w-9 shrink-0 rounded-full bg-border-strong md:hidden" aria-hidden />
          <div className="flex items-center justify-between gap-3">
            <Dialog.Title className="text-lg font-semibold text-text">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Cerrar"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-text-subtle hover:bg-surface-2"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </div>

          {confirmingDiscard ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-text-muted">¿Descartar los cambios?</p>
              <div className="flex gap-2.5 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setConfirmingDiscard(false)}
                >
                  Cancelar
                </Button>
                <Button type="button" variant="destructive" className="flex-1" onClick={onClose}>
                  Descartar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3.5">{children}</div>
              <div className="flex gap-2.5 pt-1">
                <Button type="button" variant="secondary" onClick={requestClose} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <div className="flex-1">{saveAction}</div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
