import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { client } from "@/integrations/orpc/orpc-client";

export const orpc = createTanstackQueryUtils(client);
