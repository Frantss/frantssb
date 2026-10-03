import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { createSignal, type JSX } from "solid-js";
import { render } from "solid-js/web";
import { LocaleProvider } from "../locale.context";
import { WorkPage } from "@/client/features/portfolio/work-page";
import { ProjectsPage } from "@/client/features/portfolio/projects-page";
import { WritingPage } from "@/client/features/portfolio/writing-page";
import { portfolio_bio, portfolio_jobs } from "@/client/features/portfolio/portfolio.data";
import { article_list } from "@/lib/articles/article-metadata";
import type { Locale } from "@/paraglide/runtime";

vi.mock("@/lib/articles/article-metadata", () => ({ article_list: () => [] }));

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

    expect(container.textContent).toContain("Guildara");
    expect(container.textContent).toContain("Product Engineer");
    expect(container.textContent).toContain("1y 8m");
    expect(container.textContent).toContain(
      "TypeScript error handling with typed success and error results.",
    );

    setLocale("es");

    expect(container.textContent).toContain("Guildara");
    expect(container.textContent).toContain("Ingeniero de producto");
    expect(container.textContent).toContain("Líder técnico");
    expect(container.textContent).toContain("1a 8m");
    expect(container.textContent).not.toContain("1y 8m");
    expect(container.textContent).toContain("Manejo de errores en TypeScript");
    expect(container.textContent).not.toContain("Product Engineer");
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

    expect(container.querySelector('[data-locale="en"]')?.textContent).toContain(
      "Product Engineer",
    );
    expect(container.querySelector('[data-locale="es"]')?.textContent).toContain(
      "Ingeniero de producto",
    );
  });

  it("preserves profile facts and work identities across locales", () => {
    const english = portfolio_jobs("en");
    const spanish = portfolio_jobs("es");
    expect(english).toHaveLength(7);
    expect(
      spanish.map(({ company, start, end, stack }) => ({ company, start, end, stack })),
    ).toEqual(english.map(({ company, start, end, stack }) => ({ company, start, end, stack })));
    expect(portfolio_bio("en").location).toBe("🇺🇾 Uruguay");
    expect(portfolio_bio("es").location).toBe("🇺🇾 Uruguay");
    expect(portfolio_bio("es").about[1]).toContain("Guildara");
    for (const [index, job] of spanish.entries()) {
      expect(job.role).not.toBe(english[index]?.role);
      expect(job.type).not.toBe(english[index]?.type);
      expect(job.bullets).toHaveLength(english[index]!.bullets.length);
      job.bullets.forEach((bullet, bulletIndex) => {
        expect(bullet).not.toBe(english[index]?.bullets[bulletIndex]);
      });
    }
  });

  it("localizes the writing empty state without rendering placeholder links", () => {
    const [locale, setLocale] = createSignal<Locale>("en");
    const container = mount(() => (
      <LocaleProvider locale={locale}>
        <WritingPage />
      </LocaleProvider>
    ));

    expect(article_list("en")).toEqual([]);
    expect(article_list("es")).toEqual([]);
    expect(container.querySelector("h1")?.textContent).toBe("Writing");
    expect(container.querySelector("p")?.textContent).toBe("Still thinking of something to write.");
    expect(container.querySelector("ul, a")).toBeNull();

    setLocale("es");

    expect(container.querySelector("h1")?.textContent).toBe("Artículos");
    expect(container.querySelector("p")?.textContent).toBe("Todavía estoy pensando qué escribir.");
    expect(container.textContent).not.toContain("Still thinking of something to write.");
    expect(container.querySelector("ul, a")).toBeNull();
  });
});
