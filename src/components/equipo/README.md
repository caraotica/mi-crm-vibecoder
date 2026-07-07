# Equipo

- `UsuarioListItem.tsx` — avatar, nombre + email, chip de rol, acciones
  Editar/Eliminar (WUA-59). Sin botón Eliminar en la fila propia ni cuando
  dejaría el equipo sin ninguna propietaria (la regla ya se valida también en
  `convex/usuarios.ts`, pero conviene reflejarla en la UI para no dar a elegir
  una acción que el backend va a rechazar).
