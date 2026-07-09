import clsx from "clsx";
import { Card } from "@/components/ui/Card";

type SectionTone = "error" | "primary" | "neutral";

const dotClasses: Record<SectionTone, string> = {
  error: "bg-error",
  primary: "bg-primary",
  neutral: "bg-text-subtle",
};

interface SeguimientoSectionProps {
  title: string;
  count: number;
  tone?: SectionTone;
  children: React.ReactNode;
}

/** Card con punto de color + título + contador — Atrasados/Para hoy/Próximas (WUA-17/18). */
export function SeguimientoSection({ title, count, tone = "neutral", children }: SeguimientoSectionProps) {
  return (
    <Card padded={false} className={tone === "error" ? "border-error/40" : undefined}>
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <span className={clsx("h-2 w-2 rounded-full", dotClasses[tone])} aria-hidden />
        <span className="text-[15px] font-semibold text-text">{title}</span>
        <span className="text-sm text-text-subtle">{count}</span>
      </div>
      <div className="flex flex-col divide-y divide-border px-5">{children}</div>
    </Card>
  );
}
