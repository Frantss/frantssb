import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { render } from "solid-js/web";
import { JobDuration, jobDuration_format } from "../job-duration";
import { setLocale } from "@/paraglide/runtime";

let dispose: (() => void) | undefined;

afterEach(() => {
  dispose?.();
  dispose = undefined;
  vi.useRealTimers();
  document.cookie = "x-frantss-locale=; Path=/; Max-Age=0";
});

describe("job duration", () => {
  it("counts both endpoint months for completed roles", () => {
    expect(jobDuration_format("06.2021", "09.2021")).toBe("4m");
    expect(jobDuration_format("09.2019", "11.2019")).toBe("3m");
    expect(jobDuration_format("10.2026", "10.2026")).toBe("1m");
  });

  it("formats durations across year boundaries without empty units", () => {
    expect(jobDuration_format("01.2022", "08.2023")).toBe("1y 8m");
    expect(jobDuration_format("02.2020", "08.2023")).toBe("3y 7m");
    expect(jobDuration_format("04.2020", "10.2022")).toBe("2y 7m");
    expect(jobDuration_format("12.2025", "11.2026")).toBe("1y");
    expect(jobDuration_format("12.2025", "01.2026")).toBe("2m");
  });

  it("uses the current month for ongoing roles and waits for a client clock", () => {
    expect(jobDuration_format("08.2023", "∞")).toBe("--");
    expect(jobDuration_format("08.2023", "∞", new Date(2026, 9, 2))).toBe("3y 3m");
    expect(jobDuration_format("08.2023", "∞", new Date(2026, 10, 1))).toBe("3y 4m");
  });

  it("formats calculated durations in the cookie locale", async () => {
    await setLocale("es", { reload: false });
    expect(jobDuration_format("01.2022", "08.2023")).toBe("1a 8m");
    expect(jobDuration_format("12.2025", "11.2026")).toBe("1a");
    expect(jobDuration_format("06.2021", "09.2021")).toBe("4m");
    expect(jobDuration_format("08.2023", "∞", new Date(2026, 9, 2))).toBe("3a 3m");
  });

  it("refreshes an ongoing role across a month boundary and clears its timer", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 31, 23, 59, 30));
    const container = document.createElement("div");

    document.body.append(container);
    const stop = render(() => <JobDuration start="08.2023" end="∞" />, container);

    dispose = () => {
      stop();
      container.remove();
    };

    expect(container.textContent).toBe("3y 3m");
    vi.advanceTimersByTime(60_000);
    expect(container.textContent).toBe("3y 4m");
    dispose();
    dispose = undefined;
    expect(vi.getTimerCount()).toBe(0);
  });
});
