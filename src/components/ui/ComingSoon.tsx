import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";

interface ComingSoonProps {
  icon: LucideIcon;
  title?: string;
  helpText: string;
  ticket: string;
}

/** Placeholder para pantallas todavía no construidas (rutas de la navegación que aún no tienen su propia tarea implementada). */
export function ComingSoon({ icon, title = "Próximamente", helpText, ticket }: ComingSoonProps) {
  return (
    <Card padded={false}>
      <EmptyState icon={icon} title={title} helpText={`${helpText} (${ticket})`} />
    </Card>
  );
}
