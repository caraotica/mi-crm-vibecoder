import { mutation as rawMutation, query as rawQuery } from "./_generated/server";
import { assertLocalOnly } from "./localOnlyGuard";

/**
 * Envoltorios de `query`/`mutation` que llaman assertLocalOnly() antes de
 * cada handler. Todas las entidades (clientes, seguimientos, interacciones,
 * ventas, suscripciones, usuarios, seed) deben importar `query`/`mutation`
 * desde AQUÍ, no desde `./_generated/server` directamente — así ninguna
 * función nueva puede olvidarse del guard por accidente.
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
    handler: (...handlerArgs: unknown[]) => {
      assertLocalOnly();
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
    handler: (...handlerArgs: unknown[]) => {
      assertLocalOnly();
      return config.handler(...handlerArgs);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ver comentario arriba
  } as any)) as typeof rawMutation;
