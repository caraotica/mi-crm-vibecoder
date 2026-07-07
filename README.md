# Vibe CRM

CRM web responsive (PWA, móvil-primero) para un pequeño negocio de venta
digital. Ver el PRD completo en Notion ("CRM-PRD") y el backlog en Linear
(proyecto **CRM-MVP**, equipo Wuary).

## Stack

- **Next.js 16** (App Router, TypeScript, `src/` dir) — react-dom 19.
- **Tailwind CSS v4** — tokens del Vibe CRM Design System portados a
  `src/app/globals.css` (`@theme inline`), copiados de
  `desing/extracted/design_handoff_crm_pwa/_ds/.../tokens/*.css`. Usar
  siempre los tokens semánticos (`bg-primary`, `text-text-muted`,
  `bg-error-bg`, etc.), nunca colores sueltos.
- **Convex** — base de datos + backend reactivo. Esquema en `convex/schema.ts`.
- **Railway** — hosting de producción (ver "Desplegar en Railway" abajo).
- **lucide-react** — iconografía (trazo 1.5px, tal como pide el design system).
- **date-fns**, **clsx** — utilidades de fecha y de clases condicionales.

Por qué este stack: es el pedido explícitamente en `design.md` ("Stack
objetivo: React + Tailwind CSS v4, móvil-primero, PWA") y en el PRD. Convex se
eligió como BaaS para no tener que levantar un backend propio ni gestionar
migraciones a mano — encaja con un equipo pequeño que necesita moverse rápido.

## Arrancar en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000 — de momento solo hay una pantalla de
"estructura base lista". Las pantallas reales (Login, Hoy, Clientes, Ventas,
Equipo...) se van a construir una a una siguiendo las tareas del backlog en
Linear (proyecto CRM-MVP), no todas de golpe.

## Conectar Convex (paso manual obligatorio)

Este paso requiere tu cuenta de Convex, así que no se ha podido automatizar
desde aquí:

```bash
npx convex dev
```

La primera vez te pedirá iniciar sesión en el navegador y crear/enlazar un
proyecto de Convex. Esto genera `convex/_generated/` (con los tipos de la API)
y escribe `NEXT_PUBLIC_CONVEX_URL` en `.env.local` automáticamente. **Hasta que
no corras este comando, `npm run build` fallará** con un error de "Cannot find
module './_generated/server'" — es esperado, no es un bug del scaffolding.

Deja `npx convex dev` corriendo en una terminal aparte mientras desarrollas
(sincroniza `convex/*.ts` en caliente, como el `next dev` de al lado).

## Estructura

```
src/
  app/
    page.tsx              → placeholder ("estructura base lista"), sin pantallas todavía
    layout.tsx             → fuentes (Inter/JetBrains Mono) + ConvexClientProvider
    globals.css            → tokens del Vibe CRM Design System (Tailwind v4 @theme)
  components/
    providers/             → ConvexClientProvider
  types/
    index.ts               → tipos compartidos, reflejan el PRD (sección "Datos")
convex/
  schema.ts                → esquema completo (usuarios, clientes, interacciones,
                              seguimientos, ventasPuntuales, suscripciones)
  clientes.ts interacciones.ts seguimientos.ts ventas.ts suscripciones.ts usuarios.ts
                            → queries/mutations por entidad, ya con la validación
                              básica del PRD (p. ej. "al menos un teléfono o email")
```

Todavía no hay rutas ni componentes de pantalla — se irán añadiendo tarea a
tarea según el backlog de Linear (proyecto CRM-MVP), no todos de una vez.

⚠️ **Gap conocido:** `suscripciones.ts` cubre el modelo de datos, pero la UI
para registrar suscripciones y sus alertas de renovación/impago todavía no
está diseñada (ver Linear WUA-15 / WUA-64) — no construir esas pantallas
hasta que exista el diseño.

## Desplegar en Railway

Railway detecta Next.js automáticamente (Nixpacks) con:

- Build: `npm run build`
- Start: `npm run start`

Antes de desplegar: crear el proyecto en https://railway.app, conectar este
repo de GitHub, y configurar la variable de entorno `NEXT_PUBLIC_CONVEX_URL`
con la URL del **deployment de producción** de Convex (`npx convex deploy`
genera una distinta a la de `convex dev`). Este paso no se ha hecho todavía
— pendiente de que subas el repo a GitHub y crees la cuenta/proyecto en Railway.
