import { Outlet, createFileRoute } from "@tanstack/solid-router";
import { PortfolioLayout } from "@/client/features/portfolio/portfolio-layout";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <PortfolioLayout>
      <Outlet />
    </PortfolioLayout>
  );
}
