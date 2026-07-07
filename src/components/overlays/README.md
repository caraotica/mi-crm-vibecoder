# Overlays

Formularios y diálogos que se abren como bottom sheet (móvil) / modal centrado
(escritorio) sobre la pantalla de fondo, tal como describe el PRD ("Formularios
como overlays"). Cierran con botón, scrim, swipe o Esc; foco atrapado
(`role="dialog"`, `aria-modal`).

Componentes a crear aquí, cada uno mapeado a su tarea de Linear:

- `NuevoClienteForm.tsx` — alta/edición de cliente (WUA-10).
- `NuevaTareaForm.tsx` — seguimiento con selector de cliente, desde Hoy (WUA-62).
- `RegistrarInteraccionForm.tsx` — canal + nota (WUA-12).
- `RegistrarVentaForm.tsx` — selector pago único/suscripción (WUA-13/14; la
  parte de suscripción está bloqueada por el gap de diseño WUA-64).
- `ProgramarSeguimientoForm.tsx` — desde la ficha de cliente (WUA-19).
- `UsuarioForm.tsx` — añadir/editar usuario del equipo (WUA-59).
- `PerfilModal.tsx` — editar datos / cambiar contraseña / cerrar sesión (WUA-60).
- `ConfirmDialog.tsx` — confirmación genérica (eliminar cliente, eliminar
  usuario, cerrar sesión).

Un patrón sencillo para manejar cuál overlay está abierto: un solo estado
`overlay: string | null` en el layout o en un context, en vez de un componente
de estado por pantalla (así es como lo hace el prototipo de diseño).
