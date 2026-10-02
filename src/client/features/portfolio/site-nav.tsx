import { Rail } from "@/client/ui/rail";

export function SiteNav() {
  return (
    <Rail.Nav label="Pages">
      <Rail.Link to="/" activeOptions={{ exact: true }}>
        about
      </Rail.Link>
      <Rail.Link to="/work">work</Rail.Link>
    </Rail.Nav>
  );
}
