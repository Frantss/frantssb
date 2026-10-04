import { ORPCError } from "@orpc/client";
import { createSignal, onCleanup } from "solid-js";
import * as v from "valibot";
import { rateLimitData } from "@/shared/orpc/orpc-errors.contract";
import { useToast } from "@/client/ui/toast";
import { m } from "@/paraglide/messages";

export function createRateLimitCooldown() {
  const toaster = useToast();
  const [remaining, setRemaining] = createSignal(0);
  const [limited, setLimited] = createSignal(false);
  let reset = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => clearTimeout(timer));

  function update() {
    clearTimeout(timer);
    const milliseconds = Math.max(0, reset - Date.now());

    setRemaining(Math.ceil(milliseconds / 1000));
    if (milliseconds) timer = setTimeout(update, Math.min(1000, milliseconds));
  }

  function handle(error: unknown) {
    setLimited(false);
    if (!(error instanceof ORPCError) || error.code !== "TOO_MANY_REQUESTS") return false;
    const parsed = v.safeParse(rateLimitData, error.data);

    if (!parsed.success) return false;
    setLimited(true);
    reset = Math.max(reset, parsed.output.reset);
    update();
    toaster.create({
      id: "api-rate-limit",
      type: "warning",
      title: m.api_rate_limited({ seconds: Math.ceil(Math.max(0, reset - Date.now()) / 1000) }),
    });

    return true;
  }

  return { remaining, limited, handle };
}
