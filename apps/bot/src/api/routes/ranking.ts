import { Elysia } from "elysia";
import { prisma } from "@/util/db";
import { fetchAndCacheUser } from "@/util/getDiscordUser";

const ranking = new Elysia({ prefix: "/v3/ranking" }).get(
  "/",
  async () => {
    const profiles = await prisma.account.findMany({
      orderBy: {
        assets: "desc",
      },
      take: 50,
    });

    const result = [];

    for (const profile of profiles) {
      const userData = await fetchAndCacheUser(profile.userId);

      result.push({
        id: profile.userId,
        username: userData?.username,
        avatarURL: userData?.avatarURL,
        assets: profile.assets,
        chips: profile.chip,
        jobType: profile.jobType,
      });
    }

    return result;
  },
  {
    detail: {
      description: "資産ランキング上位50名の情報を返します。パラメータは不要です。",
    },
  },
);

export default ranking;
