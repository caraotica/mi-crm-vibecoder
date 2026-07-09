import { describe, it, expect } from "vitest";
import { closeClienteOverlay, clienteCreatedOverlay } from "./overlayState";
import type { Id } from "@/lib/convexApi";

const CLIENTE_ID = "cliente-123" as unknown as Id<"clientes">;

describe("closeClienteOverlay", () => {
  it("sin returnTo, cierra del todo", () => {
    expect(closeClienteOverlay({ kind: "cliente" })).toEqual({ kind: null });
  });

  it("con returnTo, vuelve a 'tarea' preservando el draft", () => {
    const draft = { titulo: "Llamar", fecha: "2026-07-10" };
    expect(closeClienteOverlay({ kind: "cliente", returnTo: { draft } })).toEqual({
      kind: "tarea",
      draft,
    });
  });
});

describe("clienteCreatedOverlay", () => {
  it("sin returnTo, cierra del todo (no debería pasar en la práctica, pero no debe explotar)", () => {
    expect(clienteCreatedOverlay({ kind: "cliente" }, CLIENTE_ID)).toEqual({ kind: null });
  });

  it("con returnTo, vuelve a 'tarea' con el draft preservado y el cliente preseleccionado", () => {
    const draft = { titulo: "Llamar", fecha: "2026-07-10" };
    expect(clienteCreatedOverlay({ kind: "cliente", returnTo: { draft } }, CLIENTE_ID)).toEqual({
      kind: "tarea",
      draft: { titulo: "Llamar", fecha: "2026-07-10", clienteId: CLIENTE_ID },
    });
  });
});
