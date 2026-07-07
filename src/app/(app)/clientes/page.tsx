import { Search, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

/**
 * Pantalla 2 — Lista de clientes (PRD "Pantallas"; Linear WUA-9).
 * TODO: `useQuery(api.clientes.list, { query })` + <ClienteListItem> por fila
 * (crear en components/clientes, ver README de esa carpeta).
 */
export default function ClientesPage() {
  return (
    <div className="mx-auto max-w-[860px] px-4 py-6 md:px-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-text">Clientes</h1>
        <Button className="hidden md:inline-flex">+ Nuevo cliente</Button>
      </div>

      <div className="relative mt-4">
        <Search
          size={16}
          strokeWidth={1.5}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle"
        />
        <input
          type="search"
          placeholder="Buscar por nombre, teléfono o email..."
          className="h-12 w-full rounded-md border border-border-strong bg-surface pl-10 pr-3.5 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        />
      </div>

      <div className="mt-6">
        <EmptyState
          icon={Users}
          title="Aún no tienes clientes"
          helpText="Toca + para añadir el primero en cuanto conectes Convex."
          action={<Button className="mt-2">Añadir cliente</Button>}
        />
      </div>
    </div>
  );
}
