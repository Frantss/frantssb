import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { client } from "@/client/orpc/orpc.transport";

export const orpc = createTanstackQueryUtils(client);
