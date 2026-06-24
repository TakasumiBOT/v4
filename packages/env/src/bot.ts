import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const botEnv = createEnv({
  server: {
    SHARDS: z.string().optional(),
    BOT_TOKEN: z.string(),
    NOTICE_WEBHOOK: z.string(),
    TZ: z.string(),
    SHARD_COUNT: z.string().default("16"),
    STATUS_WEBHOOK: z.string(),
    MACHINE_ID: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: true,
  emptyStringAsUndefined: true,
});
