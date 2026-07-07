import clsx from "clsx";

interface CardProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}

/** Tarjeta base — surface blanca + borde 1px + shadow-xs (design.md §8). */
export function Card({ title, action, children, className, padded = true }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-border bg-surface shadow-xs",
        padded && "p-5",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="text-[15px] font-semibold text-text">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
