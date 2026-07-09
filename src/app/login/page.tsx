import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5">
      <div className="flex w-full max-w-[400px] flex-col gap-5">
        <div className="flex items-center justify-center gap-2.5">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-primary text-[19px] font-semibold text-on-primary">
            V
          </span>
          <span className="text-xl font-semibold tracking-tight text-text">Vibe CRM</span>
        </div>
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-text">Inicia sesión</h1>
            <p className="text-sm text-text-muted">
              Accede a tu CRM para gestionar clientes y seguimientos.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
