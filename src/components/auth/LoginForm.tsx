"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { ConvexError } from "convex/values";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function esEmailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function errorMessage(e: unknown): string {
  if (e instanceof ConvexError && e.data && typeof e.data === "object" && "message" in e.data) {
    return String((e.data as { message: unknown }).message);
  }
  return "Email o contraseña incorrectos.";
}

/** Login (WUA-8/WUA-47): 4 estados — vacío, relleno, cargando, error. */
export function LoginForm() {
  const { signIn } = useAuthActions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOlvido, setShowOlvido] = useState(false);

  const puedeEnviar = esEmailValido(email) && password.length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeEnviar) return;
    setSubmitting(true);
    setError(null);
    try {
      await signIn("password", { email, password, flow: "signIn" });
      // Navegación completa (no router.push): garantiza que el middleware
      // vea la cookie de sesión recién creada en la siguiente petición,
      // evitando una carrera con la propagación cliente->servidor.
      window.location.href = "/hoy";
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div
          role="alert"
          className="rounded-md border border-error bg-error-bg px-3 py-2.5 text-[13px] font-medium text-error-text"
        >
          {error}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        autoFocus
        placeholder="tu@empresa.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={submitting}
      />

      <div className="relative">
        <Input
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={showPassword}
          className="absolute right-1.5 top-[30px] flex h-9 w-9 items-center justify-center rounded-md text-text-subtle hover:bg-surface-2"
        >
          {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
        </button>
      </div>

      <Button type="submit" className="w-full" loading={submitting} disabled={!puedeEnviar}>
        Entrar
      </Button>

      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => setShowOlvido((s) => !s)}
          className="text-sm font-medium text-primary hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
        {showOlvido && (
          <p className="text-center text-[13px] text-text-muted">
            Contacta con soporte para restablecer tu contraseña.
          </p>
        )}
      </div>
    </form>
  );
}
