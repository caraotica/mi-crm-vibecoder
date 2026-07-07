import { AppShell } from "@/components/layout/AppShell";

/** Layout compartido por Hoy/Clientes/Ventas/Equipo — todo lo que vive
 * dentro de la navegación principal (ver PRD, pantalla 12). */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
