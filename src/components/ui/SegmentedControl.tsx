import clsx from "clsx";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  label?: string;
  options: SegmentedOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  allowDeselect?: boolean;
  error?: string;
}

/** Grupo de chips reutilizable — Canal (interacción), Estado (venta), Canal de origen (cliente). */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  allowDeselect = false,
  error,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-text">{label}</span>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(active && allowDeselect ? null : opt.value)}
              aria-pressed={active}
              className={clsx(
                "h-9 rounded-full border px-3.5 text-[13px] font-medium transition-colors duration-150",
                active
                  ? "border-primary bg-primary-subtle text-primary"
                  : "border-border-strong bg-surface text-text-muted hover:bg-surface-2",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-[13px] text-error-text">{error}</p>}
    </div>
  );
}
