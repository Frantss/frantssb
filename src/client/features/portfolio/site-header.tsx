import { Link } from "@tanstack/solid-router";
import { ThemeToggle } from "@/client/features/theme/theme-toggle";
import { LocaleToggle } from "@/client/features/localization/locale-toggle";
import { ButtonLink } from "@/client/ui/button-link";
import { profile } from "./portfolio.data";
import { useLocale } from "@/client/features/localization/locale.context";
import { m } from "@/paraglide/messages";

export function SiteHeader() {
  const locale = useLocale();
  // Phones drop the file extension so the header fits at 320px.
  const resume = () => m.header_resume({}, { locale: locale() }).replace(/\.pdf$/, "");
  return (
    <header class="flex items-center justify-between gap-2 px-4 py-3 sm:gap-4">
      <Link to="/" class="flex shrink-0 items-center gap-3 text-fg no-underline">
        <span class="grid size-11 shrink-0 place-items-center border border-line-strong text-xs font-bold sm:size-9">
          FB
        </span>
        <span class="font-bold max-sm:hidden">{profile.handle}</span>
      </Link>
      <div class="flex flex-wrap justify-end gap-2">
        <ThemeToggle class="max-sm:hidden" />
        <LocaleToggle class="max-sm:hidden" />
        <ButtonLink.Outline href={profile.resumeHref}>
          {resume()}
          <span class="max-sm:hidden">.pdf</span>
        </ButtonLink.Outline>
        <ButtonLink.Solid href={`mailto:${profile.email}`}>
          {m.header_contact({}, { locale: locale() })}
        </ButtonLink.Solid>
      </div>
    </header>
  );
}
