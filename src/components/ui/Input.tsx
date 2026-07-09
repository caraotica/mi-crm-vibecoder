import { InputHTMLAttributes, forwardRef, useId } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/** Input con label arriba, helper/error, ring de foco verde (design.md §8). */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    // Fallback a useId(): sin id/name explícitos, <label htmlFor> quedaba sin
    // pareja (htmlFor={undefined}), rompiendo la asociación label↔input.
    const generatedId = useId();
    const inputId = id ?? props.name ?? generatedId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "h-12 rounded-md border bg-surface px-3.5 text-[15px] text-text placeholder:text-text-subtle",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
            error ? "border-error" : "border-border-strong",
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="text-[13px] text-error-text">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
