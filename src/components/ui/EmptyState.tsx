import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  helpText: string;
  action?: React.ReactNode;
}

/** Icono en cuadro surface-2 + título + una línea de ayuda + CTA (design.md §5, §8). */
export function EmptyState({ icon: Icon, title, helpText, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2">
        <Icon size={24} strokeWidth={1.5} className="text-text-subtle" />
      </div>
      <p className="text-[15px] font-semibold text-text">{title}</p>
      <p className="max-w-xs text-[13px] text-text-muted">{helpText}</p>
      {action}
    </div>
  );
}
