import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 h-12 md:h-11 rounded-md px-5 text-[15px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active disabled:bg-surface-2 disabled:text-text-subtle",
  secondary:
    "bg-surface border border-border-strong text-text font-medium hover:bg-surface-2",
  ghost: "bg-transparent text-text-muted font-medium hover:bg-surface-2",
  destructive: "bg-error text-white hover:brightness-90",
};

export function Button({
  variant = "primary",
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}
