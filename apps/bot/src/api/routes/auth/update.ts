import { Elysia, status } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { Colors } from "discord.js";
import config from "@/config";
import { giveRole } from "@/api/rest";
import Money from "@/util/Money";
import { prisma } from "@/util/db";
import { env } from "@/util/Env";

const updateAuth = new Elysia({ prefix: "/v3/auth/update" })
  .use(bearer())
  .post("/:session", async ({ query, bearer, params: { session } }) => {
    if (!bearer || bearer !== env.API_PASSWORD) return status(401, { error: "Unauthorized" });

    if (!session) return { error: "Session is required" };

    const dbsession = await prisma.webauth.findUnique({
      where: {
        id: session,
      },
    });

    if (!dbsession) return status(404, { error: "Session not found" });

    if (dbsession.createdAt < new Date(Date.now() - 1000 * 60 * 5))
      return status(400, { error: "Session expired" });

    if (query.ip) {
      const record = await prisma.userAddress.findUnique({
        where: {
          userId: dbsession.userId,
        },
      });

      if (record) {
        if (record.oldAddress === "none" || record.address === query.ip) {
          await prisma.userAddress.update({
            where: {
              userId: dbsession.userId,
            },
            data: {
              address: query.ip,
            },
          });
        }

        if (record.oldAddress !== "none" && record.address !== query.ip) {
          await prisma.userAddress.update({
            where: {
              userId: dbsession.userId,
            },
            data: {
              oldAddress: record.address,
              address: query.ip,
            },
          });
        }
      } else {
        await prisma.userAddress.create({
          data: {
            userId: dbsession.userId,
            address: query.ip,
          },
        });
      }
    }

    if (query.status === "fail") {
      if (dbsession.interactionWebhookId !== "") {
        await fetch(dbsession.interactionWebhookId, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [
              {
                color: Colors.Red,
                author: {
                  name: "認証に失敗しました",
                  icon_url: config.image.errorIcon,
                },
              },
            ],
            components: [],
          }),
        });
      }

      await prisma.webauth.delete({
        where: {
          id: session,
        },
      });
    }

    if (query.status === "success") {
      if (dbsession.type === "roleauth") {
        await giveRole(dbsession.userId, dbsession.roleId, dbsession.guildId);

        await fetch(dbsession.interactionWebhookId, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [
              {
                color: Colors.Green,
                author: {
                  name: "認証が完了しました",
                  icon_url: config.image.successIcon,
                },
              },
            ],
            components: [],
          }),
        });
      }

      if (dbsession.type === "register") {
        await prisma.$transaction(async (tx) => {
          await tx.account.create({
            data: {
              userId: dbsession.userId,
              lastAgreedAt: new Date(),
            },
          });

          await Money.add(dbsession.userId, 1000, "登録時の初期資金の付与", tx);
        });

        await fetch(dbsession.interactionWebhookId, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [
              {
                color: Colors.Green,
                author: {
                  name: "登録しました",
                  icon_url: config.image.successIcon,
                },
                description: "初期資金として1000コインが付与されました",
              },
            ],
            components: [],
          }),
        });
      }

      await prisma.webauth.delete({
        where: {
          id: session,
        },
      });
    }
  });

export default updateAuth;
