import { describe, expect, it } from "vite-plus/test";
import { localTime_format } from "@/client/ui/local-time";

describe("local time", () => {
  it("formats the time at a negative UTC offset", () => {
    expect(localTime_format(new Date("2026-10-02T20:05:00Z"), -3)).toBe("17:05");
  });

  it("wraps across midnight", () => {
    expect(localTime_format(new Date("2026-10-02T01:30:00Z"), -3)).toBe("22:30");
    expect(localTime_format(new Date("2026-10-02T23:15:00Z"), 2)).toBe("01:15");
  });
});
