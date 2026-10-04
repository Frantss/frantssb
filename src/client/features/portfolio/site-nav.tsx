import { useLocation } from "@tanstack/solid-router";
import { For } from "solid-js";
import { LocaleToggle } from "@/client/features/localization/locale-toggle";
import { ThemeToggle } from "@/client/features/theme/theme-toggle";
import { Dock } from "@/client/ui/dock";
import { Rail } from "@/client/ui/rail";
import { m } from "@/paraglide/messages";
import { analytics_autocapture } from "@/client/analytics/analytics";

const pages = [
  { to: "/", label: m.nav_about },
  { to: "/work", label: m.nav_work },
  { to: "/education", label: m.nav_education },
  { to: "/projects", label: m.nav_projects },
  { to: "/writing", label: m.nav_writing },
] as const;

export function SiteNav() {
  return (
    <Rail.Nav label={m.nav_pages()}>
      <For each={pages}>
        {(page) => (
          <Rail.Link
            to={page.to}
            activeOptions={{ exact: page.to === "/" }}
            {...analytics_autocapture({
              id: "nav-link",
              destination: page.to,
              placement: "sidebar",
            })}
          >
            {page.label()}
          </Rail.Link>
        )}
      </For>
    </Rail.Nav>
  );
}

export function SiteDock() {
  const location = useLocation();
  const current = () =>
    pages.find((page) =>
      page.to === "/"
        ? location().pathname === "/"
        : location().pathname === page.to || location().pathname.startsWith(`${page.to}/`),
    );

  return (
    <Dock.Root>
      <Dock.Bar>
        <Dock.Trigger
          {...analytics_autocapture({ id: "mobile-menu-toggle" })}
          menuLabel={m.dock_menu()}
          closeLabel={m.dock_close()}
        >
          ▸ {current()?.label()}
        </Dock.Trigger>
      </Dock.Bar>
      <Dock.Sheet label={m.nav_pages()}>
        <Dock.List>
          <For each={pages}>
            {(page) => (
              <Dock.Link
                to={page.to}
                activeOptions={{ exact: page.to === "/" }}
                {...analytics_autocapture({
                  id: "nav-link",
                  destination: page.to,
                  placement: "dock",
                })}
              >
                {page.label()}
              </Dock.Link>
            )}
          </For>
        </Dock.List>
        <Dock.Footer>
          <LocaleToggle class="size-11" placement="dock" />
          <ThemeToggle class="size-11" />
        </Dock.Footer>
      </Dock.Sheet>
    </Dock.Root>
  );
}
