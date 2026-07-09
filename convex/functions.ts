import { mutation as rawMutation, query as rawQuery } from "./_generated/server";
import { requireAuthUserId } from "./authGuard";

/**
 * Envoltorios de `query`/`mutation` que exigen una sesión autenticada
 * (WUA-8) antes de cada handler. Todas las entidades (clientes, seguimientos,
 * interacciones, ventas, suscripciones, usuarios, seed) deben importar
 * `query`/`mutation` desde AQUÍ, no desde `./_generated/server` directamente
 * — así ninguna función nueva puede olvidarse del guard por accidente.
 *
 * Antes de WUA-8 este wrapper llamaba a un guard temporal
 * (`CRM_LOCAL_ONLY_MODE`, ver git history) que fallaba cerrado por defecto
 * porque no existía autenticación real. Ahora que sí existe, el guard es
 * "debe haber una identidad autenticada" — `convex/seed.ts` es la única
 * excepción deliberada (usa `internalMutation`/`internalAction` directos de
 * `./_generated/server`, no este wrapper, porque bootstrapea las primeras
 * cuentas antes de que pueda existir ninguna sesión).
 *
 * `rawQuery`/`rawMutation` son builders genéricos sobrecargados (aceptan
 * `handler` suelto o `{ args, handler }`); TypeScript no permite expresar un
 * envoltorio genérico de esa forma sin `any` en la implementación interna.
 * Se anota el tipo público como `typeof rawQuery`/`typeof rawMutation` para
 * que cada sitio de uso (`clientes.ts`, `seguimientos.ts`, etc.) siga teniendo
 * la inferencia de tipos completa de Convex.
 */
export const query: typeof rawQuery = ((config: {
  args?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ver comentario arriba
  handler: (...handlerArgs: any[]) => unknown;
}) =>
  rawQuery({
    ...config,
    handler: async (...handlerArgs: unknown[]) => {
      await requireAuthUserId(handlerArgs[0] as Parameters<typeof requireAuthUserId>[0]);
      return config.handler(...handlerArgs);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ver comentario arriba
  } as any)) as typeof rawQuery;

export const mutation: typeof rawMutation = ((config: {
  args?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ver comentario arriba
  handler: (...handlerArgs: any[]) => unknown;
}) =>
  rawMutation({
    ...config,
    handler: async (...handlerArgs: unknown[]) => {
      await requireAuthUserId(handlerArgs[0] as Parameters<typeof requireAuthUserId>[0]);
      return config.handler(...handlerArgs);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ver comentario arriba
  } as any)) as typeof rawMutation;
