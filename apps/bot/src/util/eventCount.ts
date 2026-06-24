import { EventType } from "@/generated/prisma/client";
import { shardRedis } from "@/util/redis";
import { env } from "@/util/Env";
import eventCountApplyToSql from "@/util/eventCountApplyToSql";

const eventCount = async (eventType: EventType, isBot: boolean) => {
  shardRedis.incr(`eventCounter:${isBot ? "bot" : "user"}:${String(eventType)}`);
};

export default eventCount;

if (env.SHARDS === "0") {
  setInterval(async () => {
    await eventCountApplyToSql();
  }, 15 * 1000);
}
