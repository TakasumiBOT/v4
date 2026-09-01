import { Elysia, status, t } from "elysia";
import { prisma } from "@takasumibot-v4/db";
import { bearer } from "@elysiajs/bearer";
import { botEnv as env } from "@takasumibot-v4/env/bot";

const pushNotifications = new Elysia({ prefix: "/v3/notifications" })
  .use(bearer())
  .post(
    "/:userId",
    async ({ bearer, params: { userId }, query }) => {
      if (!bearer || bearer !== env.API_PASSWORD) return status(401, { error: "Unauthorized" });

      if (!userId) return { error: "User ID is required" };

      const { enabled } = query as { enabled?: string };

      if (enabled === undefined) return { error: "enabled parameter is required" };

      const account = await prisma.account.findUnique({
        where: {
          userId,
        },
      });

      if (!account) return status(404, { error: "User not found" });

      await prisma.account.update({
        where: {
          userId,
        },
        data: {
          pushNotifications: enabled === "true",
        },
      });

      return { success: true, pushNotifications: enabled === "true" };
    },
    {
      params: t.Object({
        userId: t.String({
          description: "DiscordユーザーID",
        }),
      }),
      query: t.Object({
        enabled: t.String({
          description: "プッシュ通知を有効にするか (true/false)",
        }),
      }),
      detail: {
        description: "指定したユーザーのプッシュ通知設定を更新します。Bearer認証が必要です。",
      },
    },
  )
  .post(
    "/:userId/register",
    async ({ bearer, params: { userId }, query }) => {
      if (!bearer || bearer !== env.API_PASSWORD) return status(401, { error: "Unauthorized" });

      if (!userId) return { error: "User ID is required" };

      const { token } = query as { token?: string };

      if (!token) return { error: "token parameter is required" };

      const account = await prisma.account.findUnique({
        where: {
          userId,
        },
      });

      if (!account) return status(404, { error: "User not found" });

      await prisma.account.update({
        where: {
          userId,
        },
        data: {
          pushNotificationTokens: {
            push: token,
          },
        },
      });

      return { success: true, token };
    },
    {
      params: t.Object({
        userId: t.String({
          description: "DiscordユーザーID",
        }),
      }),
      query: t.Object({
        token: t.String({
          description: "プッシュ通知トークン",
        }),
      }),
      detail: {
        description: "指定したユーザーにプッシュ通知トークンを追加します。Bearer認証が必要です。",
      },
    },
  )
  .delete("/:userId/deregister", async ({ bearer, params: { userId }, query }) => {
    if (!bearer || bearer !== env.API_PASSWORD) return status(401, { error: "Unauthorized" });

    if (!userId) return { error: "User ID is required" };

    const { token } = query as { token?: string };

    if (!token) return { error: "token parameter is required" };

    const account = await prisma.account.findUnique({
      where: {
        userId,
      },
    });

    if (!account) return status(404, { error: "User not found" });

    let tokens = account.pushNotificationTokens || [];

    tokens = tokens.filter((t) => t !== token);

    await prisma.account.update({
      where: {
        userId,
      },
      data: {
        pushNotificationTokens: {
          set: tokens,
        },
      },
    });
  });

export default pushNotifications;
