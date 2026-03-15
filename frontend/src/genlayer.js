import { createClient, simulator } from "@genlayer/js";

export const client = createClient({
  ...simulator,
});
