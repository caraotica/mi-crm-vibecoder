import clsx from "clsx";

export type BadgeStatus =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

const statusClasses: Record<BadgeStatus, string> = {
  primary: "bg-primary-subtle text-primary",
  success: "bg-success-bg text-success-text",
  warning: "bg-warning-bg text-warning-text",
  error: "bg-error-bg text-error-text",
  info: "bg-info-bg text-info-text",
  neutral: "bg-surface-2 text-text-muted",
};

const dotClasses: Record<BadgeStatus, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
  neutral: "bg-text-subtle",
};

interface BadgeProps {
  status?: BadgeStatus;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Pill de estado — ver design.md §8 "Badge / pill de estado". */
export function Badge({ status = "neutral", dot = true, children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium",
        statusClasses[status],
        className,
      )}
    >
      {dot && <span className={clsx("h-[7px] w-[7px] rounded-full", dotClasses[status])} />}
      {children}
    </span>
  );
}
