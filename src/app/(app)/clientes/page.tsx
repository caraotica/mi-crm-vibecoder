"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { Users, Plus } from "lucide-react";
import { api } from "@/lib/convexApi";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClienteRow } from "@/components/clientes/ClienteRow";
import { NuevoClienteForm } from "@/components/overlays/NuevoClienteForm";

/** Pantalla "Clientes" (WUA-9): lista con buscador en tiempo real. */
export default function ClientesPage() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [showNuevoCliente, setShowNuevoCliente] = useState(false);
  const clientes = useQuery(api.clientes.list, { query: busqueda });

  const cargando = clientes === undefined;
  const sinClientesEnAbsoluto = !cargando && clientes.length === 0 && busqueda.trim() === "";
  const sinResultadosDeBusqueda = !cargando && clientes.length === 0 && busqueda.trim() !== "";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 p-5 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-text">Clientes</h1>
        <Button onClick={() => setShowNuevoCliente(true)}>
          <Plus size={18} strokeWidth={2} />
          Nuevo cliente
        </Button>
      </div>

      <Input
        aria-label="Buscar cliente"
        placeholder="Buscar por nombre, teléfono o email..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {sinClientesEnAbsoluto && (
        <Card>
          <EmptyState
            icon={Users}
            title="No hay clientes todavía"
            helpText="Añade tu primer cliente para empezar a hacerle seguimiento."
            action={
              <Button onClick={() => setShowNuevoCliente(true)}>
                <Plus size={18} strokeWidth={2} />
                Nuevo cliente
              </Button>
            }
          />
        </Card>
      )}

      {sinResultadosDeBusqueda && (
        <Card>
          <EmptyState
            icon={Users}
            title="No se encontró ningún cliente"
            helpText="¿Quieres añadirlo?"
            action={
              <button
                type="button"
                onClick={() => setShowNuevoCliente(true)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                + Nuevo cliente
              </button>
            }
          />
        </Card>
      )}

      {!cargando && clientes.length > 0 && (
        <Card padded={false} className="divide-y divide-border px-4">
          {clientes.map((c) => (
            <ClienteRow
              key={c._id}
              id={c._id}
              nombre={c.nombre}
              estado={c.estado}
              ultimoContacto={c.ultimoContacto}
            />
          ))}
        </Card>
      )}

      {showNuevoCliente && (
        <NuevoClienteForm
          onClose={() => setShowNuevoCliente(false)}
          onCreated={(id) => router.push(`/clientes/${id}`)}
        />
      )}
    </div>
  );
}
