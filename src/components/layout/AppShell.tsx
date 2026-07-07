"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, TrendingUp, UserCog } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "@/components/ui/Avatar";
import { getMockSession } from "@/lib/session";

/**
 * Navegación principal (PRD "Pantallas", pantalla 12; Linear WUA-23).
 * Móvil: bottom tab bar. Escritorio (md+): sidebar izquierda.
 * "Equipo" solo se muestra si el rol es "propietaria". Perfil se abre desde
 * el avatar (aún por construir, ver components/perfil).
 */
const NAV_ITEMS = [
  { href: "/hoy", label: "Hoy", icon: Calendar, ownerOnly: false },
  { href: "/clientes", label: "Clientes", icon: Users, ownerOnly: false },
  { href: "/ventas", label: "Ventas", icon: TrendingUp, ownerOnly: false },
  { href: "/equipo", label: "Equipo", icon: UserCog, ownerOnly: true },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // TODO(WUA-8): sustituir por la sesión real.
  const session = getMockSession();
  const items = NAV_ITEMS.filter((i) => !i.ownerOnly || session.user.rol === "propietaria");

  return (
    <div className="flex min-h-screen flex-col bg-bg md:flex-row">
      {/* Sidebar — escritorio */}
      <aside className="hidden w-[240px] shrink-0 border-r border-border bg-surface md:flex md:flex-col md:gap-1 md:p-4">
        <div className="mb-4 flex items-center gap-2 px-2">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-primary font-semibold text-on-primary">
            V
          </div>
          <span className="font-semibold text-text">Vibe CRM</span>
        </div>
        {items.map((item) => (
          <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} />
        ))}
        <div className="mt-auto flex items-center gap-2 rounded-md p-2 hover:bg-surface-2">
          <Avatar nombre={session.user.nombre} size={32} />
          <span className="text-sm text-text">{session.user.nombre}</span>
        </div>
      </aside>

      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Bottom tab bar — móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex h-16 items-stretch border-t border-border bg-surface md:hidden">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[11px]",
                active ? "font-semibold text-primary" : "font-medium text-text-subtle",
              )}
            >
              <Icon size={22} strokeWidth={1.5} />
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
}: (typeof NAV_ITEMS)[number] & { active: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px]",
        active ? "bg-primary-subtle font-medium text-primary" : "text-text-muted hover:bg-surface-2",
      )}
    >
      <Icon size={20} strokeWidth={1.5} />
      {label}
    </Link>
  );
}
