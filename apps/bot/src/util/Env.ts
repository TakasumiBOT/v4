import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    SHARDS: z.string().optional(),
    API_PASSWORD: z.string(),
    API_PORT: z.string().default("3000"),
    BOT_TOKEN: z.string(),
    DATABASE_URL: z.string(),
    GIF_KEY: z.string(),
    IP_KEY: z.string(),
    LOTTERY_WEBHOOK: z.string(),
    NOTICE_WEBHOOK: z.string(),
    TZ: z.string(),
    AI_GATEWAY_API_KEY: z.string(),
    SHARD_COUNT: z.string().default("16"),
    TURNSTILE_SECRET: z.string(),
    SHARD_REDIS: z.string(),
    SHARD_LIST: z.string(),
    STATUS_WEBHOOK: z.string(),
    MACHINE_ID: z.string(),
  },
  runtimeEnv: process.env,
});
