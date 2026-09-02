import { Client } from "discord.js";
import { shardRedis } from "@/util/redis";
import config from "@/config";

const getUserCount = async (client: Client): Promise<number> => {
  if (client.shard) {
    const keys = Array.from({ length: config.shardCount }, (_, i) => `shard:status:user:${i}`);
    try {
      return (await shardRedis.mget(keys))
        .map((s: string | null | number) => parseInt(String(s), 10) || 0)
        .reduce((sum, n) => sum + n, 0);
    } catch (error) {
      console.error(error);
      return -1;
    }
  } else {
    return client.guilds.cache.filter((g) => g.available).reduce((a, g) => a + g.memberCount, 0);
  }
};

export default getUserCount;
