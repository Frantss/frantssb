import { Link } from "@tanstack/solid-router";
import { ThemeToggle } from "@/client/features/theme/theme-toggle";
import { LocaleToggle } from "@/client/features/localization/locale-toggle";
import { ButtonLink } from "@/client/ui/button-link";
import { portfolio_resume, profile } from "./portfolio.data";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { analytics_capture } from "@/client/analytics/analytics";

export function SiteHeader() {
  // Phones drop the file extension so the header fits at 320px.
  const resume = () => m.header_resume().replace(/\.pdf$/, "");

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
          href={portfolio_resume(getLocale()).href}
          download={portfolio_resume(getLocale()).filename}
          onClick={() =>
            analytics_capture("resume_download_clicked", {
              locale: getLocale(),
              resume_locale: getLocale(),
              placement: "header",
            })
          }
        >
          {resume()}
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
