import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

/**
 * WUA-8: login real de Marta/Carlos. Solo el provider Password, sin login
 * social ni verificación de email (no requeridos por el ticket).
 *
 * Sesión: 30 días por defecto (`session.totalDurationMs`/`inactiveDurationMs`
 * de Convex Auth) — cumple el requisito de "sesión que dure días o semanas"
 * sin necesidad de configurarlo a mano.
 *
 * Registro público bloqueado a nivel de servidor (no solo omitido de la UI):
 * `profile()` se ejecuta para TODOS los flujos del provider Password
 * (signUp/signIn/reset/...), así que rechazar aquí cuando `flow === "signUp"`
 * cierra la puerta incluso si alguien llama a `signIn("password", {flow:
 * "signUp", ...})` directamente contra el deployment público, sin pasar por
 * nuestro formulario de login. Esto NO afecta a `convex/seed.ts`, que usa
 * `createAccount()` — un primitivo distinto que no pasa por este callback.
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        if (params.flow === "signUp") {
          throw new Error("El registro público no está permitido.");
        }
        return { email: params.email as string };
      },
    }),
  ],
});
