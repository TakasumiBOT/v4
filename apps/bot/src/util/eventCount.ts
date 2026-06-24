import { EventType } from "@takasumibot-v4/db";
import { shardRedis } from "@/util/redis";
import { botEnv as env } from "@takasumibot-v4/env/bot";
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
