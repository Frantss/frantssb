import { Link } from "@tanstack/solid-router";
import { ThemeToggle } from "@/client/features/theme/theme-toggle";
import { LocaleToggle } from "@/client/features/localization/locale-toggle";
import { ButtonLink } from "@/client/ui/button-link";
import { portfolio_cv, profile } from "./portfolio.data";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { analytics_capture } from "@/client/analytics/analytics";

export function SiteHeader() {
  // Phones drop the file extension so the header fits at 320px.
  const cv = () => m.header_cv().replace(/\.pdf$/, "");

  return (
    <header class="flex items-center justify-between gap-2 px-4 py-3 sm:gap-4">
      <Link to="/" class="group flex shrink-0 items-center gap-3 text-fg no-underline">
        <span class="grid size-11 shrink-0 place-items-center border border-line-strong text-xs font-bold transition-colors group-hover:border-faint group-focus-visible:border-faint sm:size-9">
          FB
        </span>
        <span class="font-bold transition-colors group-hover:text-link group-focus-visible:text-link max-sm:hidden">
          {profile.handle}
        </span>
      </Link>
      <div class="flex flex-wrap justify-end gap-2">
        <ThemeToggle class="max-sm:hidden" />
        <LocaleToggle class="max-sm:hidden" placement="header" />
        <ButtonLink.Outline
          href={portfolio_cv(getLocale()).href}
          download={portfolio_cv(getLocale()).filename}
          onClick={() =>
            analytics_capture("cv_download_clicked", {
              locale: getLocale(),
              cv_locale: getLocale(),
              placement: "header",
            })
          }
        >
          {cv()}
          <span class="max-sm:hidden">.pdf</span>
        </ButtonLink.Outline>
        <ButtonLink.Solid
          href={`mailto:${profile.email}`}
          onClick={() =>
            analytics_capture("contact_clicked", { locale: getLocale(), placement: "header" })
          }
        >
          {m.header_contact()}
        </ButtonLink.Solid>
      </div>
    </header>
  );
}
