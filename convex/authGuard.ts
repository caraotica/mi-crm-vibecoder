import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * WUA-8: reemplaza el guard temporal `CRM_LOCAL_ONLY_MODE` (ver git history,
 * convex/functions.ts) — ahora que existe login real, cada query/mutation
 * exige una sesión válida en vez de una variable de entorno "modo local".
 */
export async function requireAuthUserId(ctx: QueryCtx | MutationCtx) {
  const authUserId = await getAuthUserId(ctx);
  if (!authUserId) throw new Error("No autenticado");
  return authUserId;
}

/** Como `requireAuthUserId`, pero además resuelve la fila de `usuarios`
 * vinculada (nombre/rol/etc.) — falla explícitamente en vez de con un null-deref
 * si alguna vez hay una identidad autenticada sin fila de `usuarios` enlazada
 * (no debería pasar tras el seed, pero no es una situación en la que "seguir
 * sin más" sea seguro). */
export async function requireUsuarioActual(ctx: QueryCtx | MutationCtx) {
  const authUserId = await requireAuthUserId(ctx);
  const usuario = await ctx.db
    .query("usuarios")
    .withIndex("by_authId", (q) => q.eq("authId", authUserId))
    .unique();
  if (!usuario) {
    throw new Error("Tu cuenta de acceso no está vinculada a un perfil de usuario");
  }
  return usuario;
}
