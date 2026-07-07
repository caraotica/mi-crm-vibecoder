import clsx from "clsx";

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/);
  return (partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "");
}

interface AvatarProps {
  nombre: string;
  size?: number;
  className?: string;
}

/** Avatar de iniciales — verde sobre primary-subtle (design.md §8). */
export function Avatar({ nombre, size = 40, className }: AvatarProps) {
  return (
    <div
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full bg-primary-subtle font-semibold text-primary",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {iniciales(nombre).toUpperCase()}
    </div>
  );
}
