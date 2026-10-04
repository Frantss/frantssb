import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { WorkPage } from "@/client/features/portfolio/work-page";
import { ProjectsPage } from "@/client/features/portfolio/projects-page";
import { WritingPage } from "@/client/features/portfolio/writing-page";
import { portfolio_bio, portfolio_jobs } from "@/client/features/portfolio/portfolio.data";
import { article_list } from "@/lib/articles/article-metadata";
import { setLocale } from "@/paraglide/runtime";

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

afterEach(() => {
  dispose?.();
  document.cookie = "x-frantss-locale=; Path=/; Max-Age=0";
});

describe("localized portfolio", () => {
  it.each(["en", "es"] as const)("renders sibling pages using the %s cookie", async (locale) => {
    await setLocale(locale, { reload: false });
    const container = mount(() => (
      <>
        <WorkPage />
        <ProjectsPage />
      </>
    ));

    expect(container.textContent).toContain("Guildara");
    if (locale === "en") {
      expect(container.textContent).toContain("Product Engineer");
      expect(container.textContent).toContain("1y 8m");
      expect(container.textContent).toContain(
        "TypeScript error handling with typed success and error results.",
      );

      expect(container.querySelectorAll("h1")[0]?.textContent).toBe("Work");
      expect(container.querySelectorAll("h1")[1]?.textContent).toBe("Projects");

      return;
    }
    expect(container.textContent).toContain("Ingeniero de producto");
    expect(container.textContent).toContain("Líder técnico");
    expect(container.textContent).toContain("1a 8m");
    expect(container.textContent).not.toContain("1y 8m");
    expect(container.textContent).toContain("Manejo de errores en TypeScript");
    expect(container.textContent).not.toContain("Product Engineer");
    expect(container.querySelectorAll("h1")[0]?.textContent).toBe("Experiencia");
    expect(container.querySelectorAll("h1")[1]?.textContent).toBe("Proyectos");
  });

  it("preserves profile facts and work identities across locales", async () => {
    await setLocale("en", { reload: false });
    const english = portfolio_jobs();

    expect(portfolio_bio().location).toBe("🇺🇾 Uruguay");
    await setLocale("es", { reload: false });
    const spanish = portfolio_jobs();

    expect(english).toHaveLength(7);
    expect(
      spanish.map(({ company, start, end, stack }) => ({ company, start, end, stack })),
    ).toEqual(english.map(({ company, start, end, stack }) => ({ company, start, end, stack })));
    expect(portfolio_bio().location).toBe("🇺🇾 Uruguay");
    expect(portfolio_bio().about[1]).toContain("Guildara");
    for (const [index, job] of spanish.entries()) {
      expect(job.role).not.toBe(english[index]?.role);
      expect(job.type).not.toBe(english[index]?.type);
      expect(job.bullets).toHaveLength(english[index]!.bullets.length);
      job.bullets.forEach((bullet, bulletIndex) => {
        expect(bullet).not.toBe(english[index]?.bullets[bulletIndex]);
      });
    }
  });

  it.each(["en", "es"] as const)(
    "localizes the %s writing empty state without placeholder links",
    async (locale) => {
      await setLocale(locale, { reload: false });
      const container = mount(() => <WritingPage />);

      expect(article_list()).toEqual([]);
      expect(container.querySelector("h1")?.textContent).toBe(
        locale === "en" ? "Writing" : "Artículos",
      );
      expect(container.querySelector("p")?.textContent).toBe(
        locale === "en"
          ? "Still thinking of something to write."
          : "Todavía estoy pensando qué escribir.",
      );
      expect(container.querySelector("ul, a")).toBeNull();
    },
  );
});
