"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/**
 * Pantalla 0 — Inicio de sesión (PRD "Pantallas"; Linear WUA-8/WUA-47).
 * TODO(WUA-8): conectar con el proveedor de auth real. Por ahora el submit
 * es un placeholder que valida el formulario pero no autentica de verdad.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // PUNTO DE INTEGRACIÓN: signIn({ email, password }) del proveedor real.
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    router.push("/hoy");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-primary font-semibold text-on-primary">
            V
          </div>
          <span className="font-semibold text-text">Vibe CRM</span>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
          <h1 className="text-xl font-semibold text-text">Inicia sesión</h1>
          <p className="mt-1 text-sm text-text-muted">
            Organiza tus clientes. No pierdas ninguna venta.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && (
              <p role="alert" className="rounded-md bg-error-bg px-3 py-2 text-[13px] text-error-text">
                {error}
              </p>
            )}
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <Input
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-9 flex h-6 w-6 items-center justify-center text-text-subtle"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Entrar
            </Button>
            <a href="#" className="text-center text-[13px] text-primary">
              ¿Olvidaste tu contraseña?
            </a>
          </form>
        </div>
      </div>
    </div>
  );
}
