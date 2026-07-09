/** Recorta y valida un campo de texto obligatorio. Lanza si queda vacío o excede el límite. */
export function requireTrimmed(value: string, field: string, maxLen = 120): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`Falta ${field}`);
  if (trimmed.length > maxLen) {
    throw new Error(`${field} no puede superar ${maxLen} caracteres`);
  }
  return trimmed;
}

/** Recorta un campo de texto opcional; vacío tras el recorte se guarda como ausente. */
export function optionalTrimmed(
  value: string | undefined,
  field: string,
  maxLen = 120,
): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > maxLen) {
    throw new Error(`${field} no puede superar ${maxLen} caracteres`);
  }
  return trimmed;
}

/** Valida un importe/monto: finito y mayor que 0. */
export function requirePositiveAmount(value: number, field: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${field} debe ser mayor que 0`);
  }
  return value;
}
