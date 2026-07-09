"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Toast as ToastPresentational } from "@/components/ui/Toast";

interface ToastOptions {
  message: string;
  variant?: "success" | "error";
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastState extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  dismissToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Un único toast activo a la vez. Llamar showToast() mientras hay uno en
 * curso lo reemplaza (p. ej. un toast de éxito optimista que luego se
 * sustituye por uno de error si la mutation falla — ver optimistic update
 * de marcarHecho).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const id = ++idRef.current;
    setToast({ id, ...options });
    const duration = options.duration ?? 3800;
    timerRef.current = setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-6">
          <div className="pointer-events-auto w-full max-w-sm">
            <ToastPresentational
              message={toast.message}
              variant={toast.variant}
              actionLabel={toast.action?.label}
              onAction={
                toast.action
                  ? () => {
                      toast.action!.onClick();
                      dismissToast();
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
