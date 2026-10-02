import handler, { createServerEntry } from "@tanstack/solid-start/server-entry";
import { paraglideMiddleware } from "@/paraglide/server";

export default createServerEntry({
  fetch(request, options) {
    return paraglideMiddleware(request, () => handler.fetch(request, options));
  },
});
