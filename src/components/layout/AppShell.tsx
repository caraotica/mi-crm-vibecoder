"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, TrendingUp, UserCog, LogOut } from "lucide-react";
import clsx from "clsx";
import { useAuthActions } from "@convex-dev/auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { useUsuarioActual } from "@/lib/session";
import { useSeguimientosHoy } from "@/hooks/useSeguimientosHoy";

const NAV_ITEMS = [
  { href: "/hoy", label: "Hoy", icon: Calendar, ownerOnly: false },
  { href: "/clientes", label: "Clientes", icon: Users, ownerOnly: false },
  { href: "/ventas", label: "Ventas", icon: TrendingUp, ownerOnly: false },
  { href: "/equipo", label: "Equipo", icon: UserCog, ownerOnly: true },
] as const;

/**
 * Navegación principal (WUA-23). Sidebar 240px en escritorio (≥768px),
 * bottom tab bar en móvil. "Equipo" solo si rol === "propietaria" — mientras
 * la sesión carga, se trata como no-propietaria para evitar que el ítem
 * aparezca y desaparezca (parpadeo). Este filtro es solo de navegación/UX —
 * la autorización real se verifica en servidor (`convex/usuarios.ts`).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { usuario } = useUsuarioActual();
  const { signOut } = useAuthActions();
  const { atrasadosCount } = useSeguimientosHoy();
  const esPropietaria = usuario?.rol === "propietaria";
  const items = NAV_ITEMS.filter((i) => !i.ownerOnly || esPropietaria);

  async function handleLogout() {
    await signOut();
    // Navegación completa (no router.push): garantiza que el middleware vea
    // la sesión ya invalidada en la siguiente petición.
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg md:flex-row">
      <aside className="hidden w-[240px] shrink-0 border-r border-border bg-surface md:flex md:flex-col md:gap-1 md:p-4">
        <div className="mb-4 flex items-center gap-2 px-2">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-primary font-semibold text-on-primary">
            V
          </div>
          <span className="font-semibold text-text">Vibe CRM</span>
        </div>
        {items.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={pathname.startsWith(item.href)}
            badge={item.href === "/hoy" ? atrasadosCount : 0}
          />
        ))}
        <div className="mt-auto flex items-center gap-2 rounded-md p-2">
          <Avatar nombre={usuario?.nombre ?? "?"} size={32} />
          <span className="flex-1 truncate text-sm text-text">{usuario?.nombre ?? "Cargando…"}</span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-subtle hover:bg-surface-2"
          >
            <LogOut size={18} strokeWidth={1.5} />
          </button>
        </div>
      </aside>

      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex h-16 items-stretch border-t border-border bg-surface md:hidden">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          const badge = item.href === "/hoy" ? atrasadosCount : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px]",
                active ? "font-semibold text-primary" : "font-medium text-text-subtle",
              )}
            >
              <span className="relative inline-flex">
                <Icon size={22} strokeWidth={1.5} />
                {badge > 0 && <NavBadge count={badge} />}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  badge = 0,
}: (typeof NAV_ITEMS)[number] & { active: boolean; badge?: number }) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px]",
        active ? "bg-primary-subtle font-medium text-primary" : "text-text-muted hover:bg-surface-2",
      )}
    >
      <Icon size={20} strokeWidth={1.5} />
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="rounded-full bg-error px-1.5 py-0.5 text-xs font-semibold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

/** Punto rojo sobre el icono (móvil) — el conteo completo va aparte en el sidebar. */
function NavBadge({ count }: { count: number }) {
  return (
    <span
      className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-white"
      aria-label={`${count} atrasados`}
    >
      {count}
    </span>
  );
}
