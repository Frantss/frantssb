import { Link } from "@tanstack/solid-router";
import { ThemeToggle } from "@/client/features/theme/theme-toggle";
import { ButtonLink } from "@/client/ui/button-link";
import { profile } from "./portfolio.data";

export function SiteHeader() {
  return (
    <header class="flex items-center justify-between gap-4 px-4 py-3">
      <Link to="/" class="flex items-center gap-3 text-fg no-underline">
        <span class="grid size-9 shrink-0 place-items-center border border-line-strong text-xs font-bold">
          FB
        </span>
        <span class="font-bold max-sm:hidden">{profile.handle}</span>
      </Link>
      <div class="flex gap-2">
        <ThemeToggle />
        <ButtonLink.Outline href={profile.resumeHref}>Résumé.pdf</ButtonLink.Outline>
        <ButtonLink.Solid href={`mailto:${profile.email}`}>Get in touch</ButtonLink.Solid>
      </div>
    </header>
  );
}
