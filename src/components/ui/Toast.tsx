import { Check, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface ToastProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "success" | "error";
}

/** Chrome oscuro intencional, independiente del tema claro/oscuro (ver prototipo de diseño). */
export function Toast({ message, actionLabel, onAction, variant = "success" }: ToastProps) {
  const Icon = variant === "error" ? AlertCircle : Check;
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[var(--neutral-900)] px-4 py-3 shadow-lg">
      <Icon
        size={18}
        strokeWidth={1.5}
        className={clsx("shrink-0", variant === "error" ? "text-error" : "text-primary")}
      />
      <span className="flex-1 text-sm text-white">{message}</span>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 whitespace-nowrap px-2 py-1 text-sm font-semibold text-primary hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
