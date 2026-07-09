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

Abre http://localhost:3000 — redirige a `/hoy`. Ya están construidas: la
pantalla "Hoy" (WUA-17/18, seguimientos atrasados/para hoy/próximas), la
navegación principal (WUA-23, sidebar escritorio / tab bar móvil) y los 4
overlays de accesos rápidos (Nuevo cliente, Nueva tarea, Anotar interacción,
Registrar venta — WUA-10/62/12/13). `/clientes`, `/ventas` y `/equipo` son
todavía rutas "Próximamente" (stub) — sus pantallas reales y el login
(WUA-8/9/59/61) se irán construyendo una a una siguiendo el backlog de
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

**Paso obligatorio adicional** (ver "No desplegar todavía" abajo): sin esto,
todas las queries/mutations rechazan.

```bash
npx convex env set CRM_LOCAL_ONLY_MODE true
npx convex run seed:seedDemo
```

`seedDemo` es idempotente — ejecutarlo varias veces no duplica datos — y crea
a Marta (propietaria) y Carlos (comercial) más varios clientes/seguimientos
de prueba para que la pantalla Hoy no esté siempre vacía.

## Estructura

```
src/
  app/
    page.tsx              → redirige a /hoy
    layout.tsx             → fuentes (Inter/JetBrains Mono) + ConvexClientProvider
    globals.css            → tokens del Vibe CRM Design System (Tailwind v4 @theme)
    (app)/
      layout.tsx           → ToastProvider + AppShell (nav principal, WUA-23)
      hoy/page.tsx          → pantalla "Hoy" (WUA-17/18)
      clientes/page.tsx     → stub "Próximamente" (WUA-9)
      clientes/[id]/page.tsx → stub de ficha de cliente (WUA-11)
      ventas/page.tsx        → stub "Próximamente" (WUA-61)
      equipo/page.tsx         → gate de rol + stub "Próximamente" (WUA-59)
  components/
    layout/AppShell.tsx     → sidebar/tab bar, badge de atrasados
    hoy/                    → QuickActionsPanel, SeguimientoSection/Item, overlayState
    overlays/               → OverlayShell (Radix Dialog), ClienteSelect, los 4 formularios
    ui/                     → Avatar, Badge, Button, Card, EmptyState, Input, Select,
                              SegmentedControl, Toast, ComingSoon
    providers/              → ConvexClientProvider
  hooks/useSeguimientosHoy.ts → wrapper compartido de listHoy (Hoy ↔ badge de nav)
  lib/
    session.ts              → sesión mock (TODO WUA-8)
    toast.tsx                → ToastProvider/useToast
    seguimientoFecha.ts      → helpers de fecha puros (Europe/Madrid), compartidos con convex/*.ts
    seguimientoFechaLabel.ts → etiquetas relativas (usa date-fns, solo cliente)
    convexApi.ts             → re-exporta convex/_generated/api bajo el alias @/
  types/
    index.ts               → tipos compartidos, reflejan el PRD (sección "Datos")
convex/
  schema.ts                → esquema completo (usuarios, clientes, interacciones,
                              seguimientos, ventasPuntuales, suscripciones)
  functions.ts              → query/mutation envueltos con el guard CRM_LOCAL_ONLY_MODE
  localOnlyGuard.ts, errors.ts, validation.ts → helpers compartidos
  clientes.ts interacciones.ts seguimientos.ts ventas.ts suscripciones.ts usuarios.ts
                            → queries/mutations por entidad, con validación server-side
  seed.ts                   → datos de prueba idempotentes (`npx convex run seed:seedDemo`)
```

Falta por construir, tarea a tarea según el backlog de Linear (proyecto
CRM-MVP): login real (WUA-8), Lista de clientes (WUA-9), Ficha completa
(WUA-11), Ventas (WUA-61), Equipo (WUA-59).

⚠️ **Gap conocido:** `suscripciones.ts` cubre el modelo de datos, pero la UI
para registrar suscripciones y sus alertas de renovación/impago todavía no
está diseñada (ver Linear WUA-15 / WUA-64) — no construir esas pantallas
hasta que exista el diseño.

## ⚠️ No desplegar todavía (frontera de autorización)

Las Convex queries/mutations actuales (`seguimientos`, `interacciones`, `ventasPuntuales`,
`usuarios`, etc.) **no verifican identidad en el servidor**: `responsableId`/`autorId` se
reciben tal cual del cliente, y no hay ningún guard de rol en las funciones — solo la UI
decide qué mostrar. Cualquiera con la URL pública del deployment de Convex podría llamarlas
directamente y suplantar a Marta o Carlos, o leer el listado de usuarios/clientes.

Esto **no se deja solo documentado**: `convex/localOnlyGuard.ts` + `convex/functions.ts`
hacen que TODA query/mutation rechace por defecto a menos que la variable de entorno
`CRM_LOCAL_ONLY_MODE` valga `"true"` en ese deployment de Convex (falla cerrado, no abierto).
Configúrala una vez en tu deployment de desarrollo con
`npx convex env set CRM_LOCAL_ONLY_MODE true` (ver "Conectar Convex" arriba).

**No desplegar este repo a Railway (ni compartir la URL de Convex fuera del equipo, ni poner
`CRM_LOCAL_ONLY_MODE=true` en un deployment de producción) hasta que exista WUA-8** (login/auth
real) y las mutations deriven `responsableId`/`autorId` de la identidad autenticada en
servidor, no de argumentos del cliente. Hasta entonces, uso estrictamente local/desarrollo
con la sesión mock de `src/lib/session.ts`.

## Desplegar en Railway

Railway detecta Next.js automáticamente (Nixpacks) con:

- Build: `npm run build`
- Start: `npm run start`
- Node: fijado en `package.json` (`engines.node >= 20.9.0`)

Railway ya está conectado a este repo de GitHub para despliegue automático
(cada `git push` dispara un intento de deploy). **Checklist antes del primer
push** — en este orden:

1. **Crear el deployment de producción de Convex** (distinto del de `convex
   dev`): `npx convex deploy`. Guarda la URL que te da.
2. **Configurar `NEXT_PUBLIC_CONVEX_URL`** en las variables de entorno del
   servicio en Railway, con la URL de ese deployment de producción.
3. **NO configurar `CRM_LOCAL_ONLY_MODE` en ese deployment de Convex de
   producción** (dejarla sin definir). Por diseño, todas las queries/
   mutations rechazan si no vale `"true"` — así el backend queda
   inutilizable-pero-seguro en producción hasta que exista WUA-8 (login real),
   en vez de aceptar tráfico sin autenticación. Ver "No desplegar todavía"
   arriba.
4. `git push` — con esto Railway construye y publica automáticamente.

Sin el paso 1-2, la build de Next.js en Railway compila igual (los tipos de
`convex/_generated/` ya están commiteados), pero la app en producción no
podrá hablar con ningún Convex deployment real hasta que `NEXT_PUBLIC_CONVEX_URL`
apunte a uno.
