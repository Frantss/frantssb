import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "frantssb" }] }),
  component: Home,
});

function Home() {
  return (
    <main>
      <h1>frantssb</h1>
    </main>
  );
}
