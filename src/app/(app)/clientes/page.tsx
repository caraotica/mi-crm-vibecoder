import { Users } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";

export default function ClientesPage() {
  return (
    <div className="mx-auto max-w-3xl p-5 md:p-8">
      <ComingSoon
        icon={Users}
        helpText="La lista de clientes con buscador todavía no está construida"
        ticket="WUA-9"
      />
    </div>
  );
}
