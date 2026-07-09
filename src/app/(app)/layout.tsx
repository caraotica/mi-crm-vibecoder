import { ToastProvider } from "@/lib/toast";
import { AppShell } from "@/components/layout/AppShell";

// Todas las pantallas bajo (app) dependen de datos en vivo de Convex y de la
// sesión (mock) actual vía AppShell — no tiene sentido pre-renderizarlas como
// contenido estático en build time, y hacerlo además es frágil: si
// NEXT_PUBLIC_CONVEX_URL no está disponible en ese momento (p. ej. build en
// un entorno donde aún no se configuró), ConvexClientProvider no monta
// ConvexProvider y useQuery lanza en vez de quedarse en estado "cargando".
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
