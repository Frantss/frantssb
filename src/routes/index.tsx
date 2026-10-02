import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "frantssb" }] }),
  component: Home,
});

function Home() {
  return (
    <main class="mx-auto max-w-3xl px-4 py-16">
      <h1 class="text-3xl font-semibold">frantssb</h1>
    </main>
  );
}
