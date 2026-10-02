import { afterEach, describe, expect, it } from "vite-plus/test";
import { createSignal, type JSX } from "solid-js";
import { render } from "solid-js/web";
import { LocaleProvider } from "../locale.context";
import { WorkPage } from "@/client/features/portfolio/work-page";
import { ProjectsPage } from "@/client/features/portfolio/projects-page";
import { portfolio_posts } from "@/client/features/portfolio/portfolio.data";
import type { Locale } from "@/paraglide/runtime";

let dispose: (() => void) | undefined;

function mount(ui: () => JSX.Element) {
  const container = document.createElement("div");
  document.body.append(container);
  const stop = render(ui, container);
  dispose = () => {
    stop();
    container.remove();
  };
  return container;
}

afterEach(() => dispose?.());

describe("localized portfolio", () => {
  it("updates sibling pages when the shared locale changes", () => {
    const [locale, setLocale] = createSignal<Locale>("en");
    const container = mount(() => (
      <LocaleProvider locale={locale}>
        <WorkPage />
        <ProjectsPage />
      </LocaleProvider>
    ));

    expect(container.textContent).toContain("Company One");
    expect(container.textContent).toContain("Open-source CLI for scaffolding typed APIs.");

    setLocale("es");

    expect(container.textContent).toContain("Empresa Uno");
    expect(container.textContent).toContain("Ingeniero de software sénior");
    expect(container.textContent).toContain("CLI de código abierto");
    expect(container.textContent).not.toContain("Company One");
    expect(container.querySelectorAll("h1")[0]?.textContent).toBe("Experiencia");
    expect(container.querySelectorAll("h1")[1]?.textContent).toBe("Proyectos");
  });

  it("keeps independent locale providers isolated", () => {
    const container = mount(() => (
      <>
        <section data-locale="en">
          <LocaleProvider locale={() => "en"}>
            <WorkPage />
          </LocaleProvider>
        </section>
        <section data-locale="es">
          <LocaleProvider locale={() => "es"}>
            <WorkPage />
          </LocaleProvider>
        </section>
      </>
    ));

    expect(container.querySelector('[data-locale="en"]')?.textContent).toContain("Company One");
    expect(container.querySelector('[data-locale="es"]')?.textContent).toContain("Empresa Uno");
  });

  it("localizes article titles and bodies without changing route identities", () => {
    const english = portfolio_posts("en");
    const spanish = portfolio_posts("es");

    expect(spanish.map(({ slug, date }) => ({ slug, date }))).toEqual(
      english.map(({ slug, date }) => ({ slug, date })),
    );
    for (const [index, post] of spanish.entries()) {
      expect(post.title).toContain("Texto de ejemplo:");
      expect(post.title).not.toBe(english[index]?.title);
      expect(post.body).toHaveLength(3);
      expect(post.body.every((paragraph) => paragraph.startsWith("Texto de ejemplo:"))).toBe(true);
    }
  });
});
