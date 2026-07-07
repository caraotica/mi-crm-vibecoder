import { redirect } from "next/navigation";

/** La app abre siempre en Hoy (PRD, Navegación). TODO(WUA-8): si no hay
 * sesión, redirigir a /login en su lugar. */
export default function RootPage() {
  redirect("/hoy");
}
