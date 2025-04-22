import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // ... existing env vars ...
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  },
  client: {
    // ... existing client env vars ...
  },
  runtimeEnv: {
    // ... existing runtime env vars ...
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
}); 