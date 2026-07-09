import { describe, it, expect } from "vitest";
import {
  dateStringToBusinessDayEpoch,
  todayBusinessDayEpoch,
  toBusinessDayEpoch,
  diasDeAtraso,
} from "./seguimientoFecha";

describe("dateStringToBusinessDayEpoch", () => {
  it("convierte YYYY-MM-DD a medianoche UTC del mismo día civil", () => {
    expect(dateStringToBusinessDayEpoch("2026-07-09")).toBe(Date.UTC(2026, 6, 9));
  });
});

describe("toBusinessDayEpoch", () => {
  it("reduce cualquier instante UTC a la medianoche UTC de su día civil", () => {
    const mediodia = Date.UTC(2026, 6, 9, 15, 30);
    expect(toBusinessDayEpoch(mediodia)).toBe(Date.UTC(2026, 6, 9));
  });
});

describe("todayBusinessDayEpoch — zona horaria Europe/Madrid", () => {
  it("una madrugada en Madrid (tarde en UTC del día anterior) cuenta como el día siguiente", () => {
    // 23:30 UTC del 8 de julio = 01:30 CEST (UTC+2) del 9 de julio en Madrid.
    const instante = Date.UTC(2026, 6, 8, 23, 30);
    expect(todayBusinessDayEpoch(instante)).toBe(Date.UTC(2026, 6, 9));
  });

  it("una mañana en UTC sigue cayendo en el mismo día civil en Madrid", () => {
    const instante = Date.UTC(2026, 6, 9, 8, 0);
    expect(todayBusinessDayEpoch(instante)).toBe(Date.UTC(2026, 6, 9));
  });

  // Cambios de horario de Europe/Madrid en 2026: adelanto el 29 de marzo,
  // atraso el 25 de octubre — la ventana donde más suelen aparecer falsos
  // positivos si el desfase UTC↔Madrid se asume fijo en vez de calcularse.
  it("adelanto de horario (29 marzo 2026): ya en CEST (UTC+2), un instante nocturno cruza a la fecha siguiente", () => {
    // 22:30 UTC → 00:30 CEST del día siguiente. Con el desfase antiguo (CET,
    // UTC+1) daría 23:30 del mismo día — el test falla si se usa el desfase
    // equivocado.
    const instante = Date.UTC(2026, 2, 29, 22, 30);
    expect(todayBusinessDayEpoch(instante)).toBe(Date.UTC(2026, 2, 30));
  });

  it("atraso de horario (25 octubre 2026): ya en CET (UTC+1), el mismo instante NO cruza a la fecha siguiente", () => {
    // 22:30 UTC → 23:30 CET del mismo día. Con el desfase antiguo (CEST,
    // UTC+2) cruzaría a las 00:30 del día siguiente — el test falla si se
    // usa el desfase equivocado.
    const instante = Date.UTC(2026, 9, 25, 22, 30);
    expect(todayBusinessDayEpoch(instante)).toBe(Date.UTC(2026, 9, 25));
  });
});

describe("diasDeAtraso", () => {
  it("devuelve 0 cuando la fecha programada es hoy", () => {
    const hoy = Date.UTC(2026, 6, 9);
    expect(diasDeAtraso(hoy, hoy)).toBe(0);
  });

  it("devuelve un positivo cuando la fecha programada ya pasó", () => {
    const hoy = Date.UTC(2026, 6, 9);
    const hace2dias = Date.UTC(2026, 6, 7);
    expect(diasDeAtraso(hace2dias, hoy)).toBe(2);
  });

  it("devuelve un negativo cuando la fecha programada es futura", () => {
    const hoy = Date.UTC(2026, 6, 9);
    const en3dias = Date.UTC(2026, 6, 12);
    expect(diasDeAtraso(en3dias, hoy)).toBe(-3);
  });
});
