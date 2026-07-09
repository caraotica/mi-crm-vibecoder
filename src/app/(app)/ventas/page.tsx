import { TrendingUp } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";

export default function VentasPage() {
  return (
    <div className="mx-auto max-w-3xl p-5 md:p-8">
      <ComingSoon
        icon={TrendingUp}
        helpText="Las métricas y el pipeline de ventas todavía no están construidos"
        ticket="WUA-61"
      />
    </div>
  );
}
