import { SelectHTMLAttributes, forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

/** `<select>` estilado a mano siguiendo los tokens de Input (design.md §8). */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? props.name ?? generatedId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-text">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              "h-12 w-full appearance-none rounded-md border bg-surface px-3.5 pr-10 text-[15px] text-text",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              error ? "border-error" : "border-border-strong",
              className,
            )}
            aria-invalid={!!error}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            size={18}
            strokeWidth={1.5}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle"
          />
        </div>
        {error && <p className="text-[13px] text-error-text">{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";
