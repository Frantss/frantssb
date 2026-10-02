import { profile } from "./portfolio.data";

export function SiteFooter() {
  return (
    <footer class="flex justify-between px-4 py-3 text-xs text-faint">
      <span>© 2026 {profile.name}</span>
      <span>Fig. 1.</span>
    </footer>
  );
}
