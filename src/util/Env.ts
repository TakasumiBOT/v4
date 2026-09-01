import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    API_PASSWORD: z.string(),
    SHARDS: z.string().optional(),
    BOT_TOKEN: z.string(),
    NOTICE_WEBHOOK: z.string(),
    TZ: z.string(),
    SHARD_COUNT: z.string().default("16"),
    STATUS_WEBHOOK: z.string(),
    SHARD_LIST: z.string(),
    MACHINE_ID: z.string(),
    DATABASE_URL: z.string().min(1),
    SHARD_REDIS: z.string(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
