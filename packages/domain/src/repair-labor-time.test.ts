import { describe, expect, it } from "vitest";
import { laborDateTimeMilliseconds, laborDuration, laborDurationDisplay, laborStateHistory, laborSumHours, laborWithinClosure, OPEN_LABOR_FINISH } from "./repair-labor-time";

describe("source labor datetime arithmetic and display", () => {
  it("subtracts Gregorian values exactly across leap/day/year boundaries without timezone parsing", () => {
    expect(laborDuration("20240228235959999", "2024-02-29 00:00:00.001")).toEqual({ count: "2", unit: "milliseconds" });
    expect(laborDuration("00010101000000000", "99991231235959999")).toEqual({ count: "315537897599999", unit: "milliseconds" });
    expect(laborDuration("20260329010000000", "20260329030000000")).toEqual({ count: "7200000", unit: "milliseconds" });
    expect(laborDuration("20240101000100", "20240101000000")).toEqual({ count: "-60000", unit: "milliseconds" });
  });
  it("keeps zero17/open, NULL, empty and unsupported invalid dates distinct from a duration", () => {
    for (const value of [OPEN_LABOR_FINISH, null, "", "20260230000000000", "opaque"]) expect(laborDateTimeMilliseconds(value)).toBeNull();
    expect(laborDuration("20240101000000000", OPEN_LABOR_FINISH)).toBeNull();
  });
  it("translates the source exact constants and rounds each row before its displayed-hour sum", () => {
    expect(laborDurationDisplay({ count: "1", unit: "milliseconds" })).toBe("00:01");
    expect(laborDurationDisplay({ count: "60000", unit: "milliseconds" })).toBe("00:01");
    expect(laborDurationDisplay({ count: "3600000", unit: "milliseconds" })).toBe("01:00");
    expect(laborDurationDisplay({ count: "3599999", unit: "milliseconds" })).toBe("00:60");
    expect(laborDurationDisplay({ count: "-3660000", unit: "milliseconds" })).toBe("-1:00");
    expect(laborSumHours(["00:60", "01:01", "00:01"])).toBe("02:02");
  });
  it("uses source cached history/date-minute/four spaces and CR separators", () => {
    expect(laborStateHistory("", "20261025123456789", "Em reparação", "Açores ' ")).toBe("25/10/2026 12:34    Em reparação\r\nAçores ' ");
    expect(laborStateHistory("ANTIGO", "20261025123456789", "Fechada", "")).toBe("ANTIGO\r\n\r\n25/10/2026 12:34    Fechada\r\n");
    expect(laborStateHistory(null, "20261025123456789", "Fechada", "")).toBeNull();
  });
  it("preserves inclusive closure windows and source time-day wrap rather than inventing overnight comparison", () => {
    expect(laborWithinClosure("20261025120000000", "120000", "180000")).toBe(true);
    expect(laborWithinClosure("20261025123000000", "120000", "180000")).toBe(true);
    expect(laborWithinClosure("20261025123000001", "120000", "180000")).toBe(false);
    expect(laborWithinClosure("20261025235000000", "234000", null)).toBe(false);
    expect(laborWithinClosure("opaque", "120000", "180000")).toBe(false);
  });
});
