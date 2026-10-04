import { afterEach, describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({ capture: vi.fn(), setLocale: vi.fn() }));

vi.mock("@/client/analytics/analytics", () => ({ analytics_capture: mocks.capture }));
vi.mock("@/paraglide/runtime", async (original) => ({
  ...(await original<typeof import("@/paraglide/runtime")>()),
  getLocale: () => "en",
  setLocale: mocks.setLocale,
}));

type Api = Record<"help" | "contact" | "resume" | "theme" | "lang" | "stack", undefined>;
const api = () => (window as unknown as { frantss: Api }).frantss;
const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
const run = (command: keyof Api) => api()[command];
const logged = () => log.mock.calls.map(([message]) => String(message)).join("\n");

afterEach(() => {
  vi.clearAllMocks();
  document.cookie = "theme=; Path=/; Max-Age=0";
  delete document.documentElement.dataset.theme;
});

describe("console easter egg", () => {
  // Runs first: the API is non-configurable, so installation happens once per test file.
  it("greets once on install without running commands", async () => {
    const { console_install } = await import("@/client/features/console/console");

    console_install();
    expect(logged()).toContain("frantss.help");
    expect(log).toHaveBeenCalledTimes(2);
    expect(mocks.capture).not.toHaveBeenCalled();

    const installed = api();

    console_install();
    expect(api()).toBe(installed);
    expect(log).toHaveBeenCalledTimes(2);
  });

  it("lists every command from help", () => {
    run("help");
    for (const name of Object.keys(api())) expect(logged()).toContain(`frantss.${name}`);
    expect(mocks.capture).toHaveBeenCalledWith("console_command_used", { command: "help" });
  });

  it("prints contact details", () => {
    run("contact");
    expect(logged()).toContain("frantss.bongiovanni@gmail.com");
    expect(logged()).toContain("https://github.com/Frantss/");
  });

  it("downloads the resume for the current locale", () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    run("resume");
    const anchor = click.mock.contexts[0] as HTMLAnchorElement;

    expect(anchor.getAttribute("href")).toBe("/resume-en.pdf");
    expect(anchor.download).toBe("frantssb-resume-en.pdf");
    click.mockRestore();
  });

  it("toggles the theme", () => {
    document.documentElement.dataset.theme = "dark";
    run("theme");
    expect(document.documentElement.dataset.theme).toBe("light");
    run("theme");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("switches to the other locale", () => {
    run("lang");
    expect(mocks.setLocale).toHaveBeenCalledWith("es");
  });

  it("cannot be overwritten", () => {
    expect(() => {
      (window as unknown as { frantss: unknown }).frantss = {};
    }).toThrow();
    expect(() => {
      (api() as Record<string, unknown>).help = 1;
    }).toThrow();
  });
});
