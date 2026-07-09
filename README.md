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

Abre http://localhost:3000 — redirige a `/login` si no hay sesión, o a
`/hoy` si ya la hay. Ya están construidas: login real con email+contraseña
(WUA-8, sesión persistente ~30 días, rutas protegidas por `src/middleware.ts`),
la pantalla "Hoy" (WUA-17/18, seguimientos atrasados/para hoy/próximas), la
navegación principal (WUA-23, sidebar escritorio / tab bar móvil, con
"Equipo" solo para el rol "propietaria") y los 4 overlays de accesos rápidos
(Nuevo cliente, Nueva tarea, Anotar interacción, Registrar venta —
WUA-10/62/12/13). `/clientes`, `/ventas` y `/equipo` son todavía rutas
"Próximamente" (stub) — sus pantallas reales (WUA-9/59/61) se irán
construyendo una a una siguiendo el backlog de Linear (proyecto CRM-MVP),
no todas de golpe.

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

**Configurar Convex Auth (WUA-8, paso obligatorio adicional)**: cada
deployment de Convex necesita sus propias claves de firma de JWT. Generarlas
localmente (sin CLI interactiva, con un script Node usando `jose`, ya
disponible como dependencia transitiva) y configurarlas una vez:

```bash
npx convex env set JWT_PRIVATE_KEY -- "$(cat tu-clave-privada.pem)"
npx convex env set JWKS -- "$(cat tu-jwks.json)"
npx convex env set SITE_URL http://localhost:3000
```

(Ver `convex/auth.config.ts`/`convex/auth.ts` para el resto de la config —
son fijos, no hace falta tocarlos.)

Luego siembra los datos de prueba:

```bash
npx convex run seed:seedDemo
```

`seedDemo` es idempotente — ejecutarlo varias veces no duplica datos — y crea
a Marta (propietaria) y Carlos (comercial) **con sus cuentas de acceso reales**
(email + contraseña `vibecrm-2026`, ver `convex/seed.ts` — cámbiala antes de
dar acceso real a usuarios finales) más varios clientes/seguimientos de
prueba para que la pantalla Hoy no esté siempre vacía.

## Estructura

```
src/
  proxy.ts                  → protege rutas (WUA-8): sin sesión → /login, con sesión en /login → /hoy
  app/
    page.tsx              → redirige a /hoy
    layout.tsx             → fuentes + ConvexAuthNextjsServerProvider + ConvexClientProvider
    globals.css            → tokens del Vibe CRM Design System (Tailwind v4 @theme)
    login/page.tsx          → pantalla de login (WUA-8/47)
    (app)/
      layout.tsx           → ToastProvider + AppShell (nav principal, WUA-23)
      hoy/page.tsx          → pantalla "Hoy" (WUA-17/18)
      clientes/page.tsx     → stub "Próximamente" (WUA-9)
      clientes/[id]/page.tsx → stub de ficha de cliente (WUA-11)
      ventas/page.tsx        → stub "Próximamente" (WUA-61)
      equipo/page.tsx         → gate de rol + stub "Próximamente" (WUA-59)
  components/
    auth/LoginForm.tsx      → formulario de login (4 estados: vacío/relleno/cargando/error)
    layout/AppShell.tsx     → sidebar/tab bar, badge de atrasados, botón "Cerrar sesión"
    hoy/                    → QuickActionsPanel, SeguimientoSection/Item, overlayState
    overlays/               → OverlayShell (Radix Dialog), ClienteSelect, los 4 formularios
    ui/                     → Avatar, Badge, Button, Card, EmptyState, Input, Select,
                              SegmentedControl, Toast, ComingSoon
    providers/              → ConvexClientProvider (envuelto con ConvexAuthNextjsProvider)
  hooks/useSeguimientosHoy.ts → wrapper compartido de listHoy (Hoy ↔ badge de nav)
  lib/
    session.ts              → useUsuarioActual() — sesión real sobre Convex Auth (WUA-8)
    toast.tsx                → ToastProvider/useToast
    seguimientoFecha.ts      → helpers de fecha puros (Europe/Madrid), compartidos con convex/*.ts
    seguimientoFechaLabel.ts → etiquetas relativas (usa date-fns, solo cliente)
    convexApi.ts             → re-exporta convex/_generated/api bajo el alias @/
  types/
    index.ts               → tipos compartidos, reflejan el PRD (sección "Datos")
convex/
  schema.ts                → esquema completo (...authTables + usuarios, clientes,
                              interacciones, seguimientos, ventasPuntuales, suscripciones)
  auth.config.ts, auth.ts, http.ts → configuración de Convex Auth (WUA-8)
  authGuard.ts              → requireAuthUserId/requireUsuarioActual
  functions.ts              → query/mutation envueltos que exigen sesión autenticada
  errors.ts, validation.ts  → helpers compartidos
  clientes.ts interacciones.ts seguimientos.ts ventas.ts suscripciones.ts usuarios.ts
                            → queries/mutations por entidad, con validación y
                              autorización server-side
  seed.ts                   → datos de prueba + cuentas de acceso idempotentes
                              (`npx convex run seed:seedDemo`)
```

Falta por construir, tarea a tarea según el backlog de Linear (proyecto
CRM-MVP): Lista de clientes (WUA-9), Ficha completa (WUA-11), Ventas (WUA-61),
Equipo (WUA-59), Perfil/Mi cuenta (WUA-60).

⚠️ **Gap conocido:** `suscripciones.ts` cubre el modelo de datos, pero la UI
para registrar suscripciones y sus alertas de renovación/impago todavía no
está diseñada (ver Linear WUA-15 / WUA-64) — no construir esas pantallas
hasta que exista el diseño.

## Autorización (WUA-8)

Todas las Convex queries/mutations exigen una sesión autenticada
(`convex/functions.ts` → `requireAuthUserId`, ver `convex/authGuard.ts`) —
sin sesión válida, rechazan. `usuarios.create/update/remove` exigen además
rol `"propietaria"`. `autorId`/`autor` de interacciones/ventas y el
`responsableId` por defecto de seguimientos se derivan siempre del usuario
autenticado en servidor, nunca de un argumento que mande el cliente.

`convex/seed.ts` es la única excepción deliberada: usa `internalMutation`/
`internalAction` (no pasa por `convex/functions.ts`) porque bootstrapea las
primeras cuentas antes de que pueda existir ninguna sesión — solo invocable
vía `npx convex run` (credenciales de admin/deploy-key), nunca desde el
cliente público.

El registro público está bloqueado a nivel de servidor (no solo omitido de
la UI): ver el `profile()` del provider Password en `convex/auth.ts`.

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
2. **Generar y configurar `JWT_PRIVATE_KEY`/`JWKS`/`SITE_URL` en ESE
   deployment de producción de Convex** (claves propias, distintas de las de
   dev — nunca reutilizar las mismas). `SITE_URL` debe ser la URL pública de
   Railway (`https://tu-servicio.up.railway.app`), no `localhost`.
3. **Configurar `NEXT_PUBLIC_CONVEX_URL`** en las variables de entorno del
   servicio en Railway, con la URL del deployment de producción de Convex.
4. **Ejecutar el seed contra producción** (`npx convex run seed:seedDemo
   --prod`) para crear las cuentas reales de Marta/Carlos — y **cambiar la
   contraseña compartida** (`SEED_PASSWORD` en `convex/seed.ts`) antes de
   dar acceso real a usuarios finales.
5. `git push` — con esto Railway construye y publica automáticamente.

Sin los pasos 1-3, la build de Next.js en Railway compila igual (los tipos de
`convex/_generated/` ya están commiteados), pero la app en producción no podrá
autenticar a nadie hasta que las claves de Convex Auth y
`NEXT_PUBLIC_CONVEX_URL` apunten al deployment de producción correcto.
