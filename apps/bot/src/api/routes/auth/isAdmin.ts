import { Elysia, status, t } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { prisma } from "@takasumibot-v4/db";
import { botEnv as env } from "@takasumibot-v4/env/bot";

const isAdmin = new Elysia({ prefix: "/v3/auth/isAdmin" }).use(bearer()).get(
  "/",
  async ({ bearer, query }) => {
    if (!bearer || bearer !== env.API_PASSWORD) return status(401, { error: "Unauthorized" });

    const { id } = query;

    if (!id) return status(400, { error: "ID is required" });

    const adminData = await prisma.admin.findUnique({
      where: {
        userId: id,
      },
    });

    return { isAdmin: !!adminData };
  },
  {
    query: t.Object({
      id: t.String({
        description: "DiscordユーザーID",
      }),
    }),
    detail: {
      description: "指定したユーザーIDがシステム管理者かどうかを返します。Bearer認証が必要です。",
    },
  },
);

export default isAdmin;
