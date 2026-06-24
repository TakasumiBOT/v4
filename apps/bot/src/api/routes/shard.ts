import { Elysia } from "elysia";
import { shardRedis } from "@/util/redis";
import config from "@/config";

const statusInfo = new Elysia({ prefix: "/v3/shard" }).get(
  "/",
  async () => {
    const keys = Array.from({ length: config.shardCount }, (_, i) => `shard:status:<id>:${i}`);
    // <id>は有効なIDに置き換えられます。typeが置き換え先のIDです。
    const tmpArr: Record<string, string | null>[] = Array.from(
      { length: config.shardCount },
      (_, i) => {
        return { shardId: String(i) };
      },
    );
    /** [i][0]がredis key、[i][1]がjson key */
    const type = [
      ["guild", "guildCount"],
      ["user", "userCount"],
      ["ping", "ping"],
    ];

    for (let i = 0; i < type.length; i++) {
      const tmpKeys = keys.map((k) => k.replace("<id>", type[i][0]));
      const response = await shardRedis.mget(tmpKeys);
      for (let ri = 0; ri < response.length; ri++) {
        tmpArr[ri][type[i][1]] = response[ri] ?? null;
      }
    }

    return {
      data: tmpArr.filter((obj) => ![obj.guildCount, obj.userCount, obj.ping].includes(null)),
      loggedAt: new Date(),
    };
  },
  {
    detail: {
      description: "シャードの情報を返します。パラメータは不要。",
    },
  },
);

export default statusInfo;
