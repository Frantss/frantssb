import { Rail } from "@/client/ui/rail";
import { useLocale } from "@/client/features/localization/locale.context";
import { m } from "@/paraglide/messages";

export function SiteNav() {
  const locale = useLocale();
  return (
    <Rail.Nav label={m.nav_pages({}, { locale: locale() })}>
      <Rail.Link to="/" activeOptions={{ exact: true }}>
        {m.nav_about({}, { locale: locale() })}
      </Rail.Link>
      <Rail.Link to="/work">{m.nav_work({}, { locale: locale() })}</Rail.Link>
      <Rail.Link to="/projects">{m.nav_projects({}, { locale: locale() })}</Rail.Link>
      <Rail.Link to="/writing">{m.nav_writing({}, { locale: locale() })}</Rail.Link>
    </Rail.Nav>
  );
}
