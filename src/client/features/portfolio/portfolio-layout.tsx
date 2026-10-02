import type { ParentProps } from "solid-js";
import { Frame } from "@/client/ui/frame";
import { Rail } from "@/client/ui/rail";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { SiteDock, SiteNav } from "./site-nav";

export function PortfolioLayout(props: ParentProps) {
  return (
    <Frame.Root>
      <Frame.Band>
        <SiteHeader />
      </Frame.Band>
      <Frame.Fill>
        <Rail.Root>
          <SiteNav />
          <Rail.Content>{props.children}</Rail.Content>
        </Rail.Root>
      </Frame.Fill>
      <Frame.Band>
        <SiteFooter />
      </Frame.Band>
      <SiteDock />
    </Frame.Root>
  );
}
