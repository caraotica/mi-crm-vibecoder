/**
 * Interruptor técnico de "este backend no está listo para tráfico real".
 *
 * Ninguna Convex function de este proyecto verifica identidad todavía
 * (WUA-8 no existe). Documentarlo en el README no es un control — así que
 * cada query/mutation (ver convex/functions.ts) llama a assertLocalOnly()
 * y falla CERRADO por defecto: si la variable de entorno
 * CRM_LOCAL_ONLY_MODE no vale exactamente "true" en ese deployment de
 * Convex, se rechaza. Esto evita que un deployment de producción sin
 * configurar sirva datos o acepte escrituras sin querer.
 *
 * Configurar una vez por deployment de desarrollo:
 *   npx convex env set CRM_LOCAL_ONLY_MODE true
 *
 * Retirar este guard cuando WUA-8 (auth real) lo reemplace por
 * autorización basada en identidad.
 */
export function assertLocalOnly(): void {
  if (process.env.CRM_LOCAL_ONLY_MODE !== "true") {
    throw new Error(
      "Vibe CRM: esta función está deshabilitada hasta que exista autenticación real (WUA-8). " +
        "Si esto es un deployment de desarrollo, configura CRM_LOCAL_ONLY_MODE=true " +
        "(`npx convex env set CRM_LOCAL_ONLY_MODE true`). Ver README.md.",
    );
  }
}
