import { Elysia, status, t } from "elysia";
import { prisma } from "@/util/db";

const userSearch = new Elysia({ prefix: "/v3/discord/usersearch" }).get(
  "/:name",
  async ({ params: { name } }) => {
    if (!name) return { error: "name is required" };

    const user = await prisma.userCache.findMany({
      where: {
        username: name,
      },
    });

    if (user.length === 0) return status(404, { error: "User not found" });

    return user[0];
  },
  {
    params: t.Object({
      name: t.String({
        description: "Discordユーザー名",
      }),
    }),
    detail: {
      description: "指定したユーザー名のキャッシュされたDiscordユーザー情報を返します。",
    },
  },
);

export default userSearch;
