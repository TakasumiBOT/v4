import { EventType } from "@takasumibot-v4/db";
import { prisma } from "@takasumibot-v4/db";
import { shardRedis } from "@/util/redis";

type redisUserType = "bot" | "user";

async function eventCountApplyToSql() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cursor = "0";
  const scantmp: Set<string> = new Set();

  do {
    let tmp = await shardRedis.scan(cursor, "MATCH", `eventCounter:*`, "COUNT", "500");
    cursor = tmp[0];
    for (const key of tmp[1]) {
      scantmp.add(key);
    }
  } while (cursor != "0");

  if (!(scantmp.size > 0)) return false;

  const keys = [...scantmp];
  const values = await shardRedis.mget(keys);
  await shardRedis.del(keys);

  const eventCount: Partial<Record<EventType, Record<redisUserType, number>>> = {};

  keys.map((key, i) => {
    const t = key.split(":");
    const userType = t[1] as redisUserType;
    const eventType = t[2] as EventType;

    eventCount[eventType] ??= { bot: 0, user: 0 };
    eventCount[eventType][userType] = Number(values[i] ?? 0);
  });

  await Promise.all(
    (Object.keys(eventCount) as EventType[]).map((eventType) => {
      const count = {
        user: eventCount?.[eventType]?.user ?? 0,
        bot: eventCount?.[eventType]?.bot ?? 0,
      };

      return prisma.eventStatistics.upsert({
        where: {
          event_aggregatedAt: {
            event: eventType,
            aggregatedAt: today,
          },
        },
        update: {
          botCount: { increment: count.bot },
          userCount: { increment: count.user },
        },
        create: {
          event: eventType,
          aggregatedAt: today,
          userCount: count.user,
          botCount: count.bot,
        },
      });
    }),
  );
}

export default eventCountApplyToSql;
