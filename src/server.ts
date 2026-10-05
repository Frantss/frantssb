import handler, { createServerEntry } from "@tanstack/solid-start/server-entry";
import { paraglideMiddleware } from "@/paraglide/server";
import { html_compressResponse } from "@/server/features/compression/html-response";

export default createServerEntry({
  async fetch(request, options) {
    const response = await paraglideMiddleware(request, () => handler.fetch(request, options));

    return html_compressResponse(request, response);
  },
});
