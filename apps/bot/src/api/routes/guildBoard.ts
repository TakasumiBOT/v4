import { APIGuild } from "discord.js";
import { Elysia, redirect } from "elysia";
import { guildBoard, guildCache } from "@takasumibot-v4/db";
import { validateTurnstileToken } from "next-turnstile";
import { prisma } from "@/util/db";
import { env } from "@/util/Env";

type guildBoardResponse = Omit<guildBoard, "inviteUrl"> & {
  guild: {
    id: string;
    name: string;
    iconURL: string | null;
    icon: string | null;
    onlineCount: number | null;
    memberCount: number | null;
    ownerID: string;
    nitro: number;
  } | null;
};

const guildBoard = new Elysia({ prefix: "/v3/guildBoard" })
  .get("/", async () => {
    const guildBoardData = await prisma.guildBoard.findMany();
    const guildsData = await prisma.guildCache.findMany();

    const guildBoardResponse: guildBoardResponse[] = [];
    for (const board of guildBoardData) {
      const cachedGuild = guildsData.find((guild) => guild.id === board.guildId);

      if (cachedGuild) {
        const { inviteUrl, ...boardWithoutInvite } = board;
        guildBoardResponse.push({
          ...boardWithoutInvite,
          guild: {
            id: cachedGuild.id,
            name: cachedGuild.name,
            iconURL: cachedGuild.icon
              ? `https://cdn.discordapp.com/icons/${cachedGuild.id}/${cachedGuild.icon}.png`
              : null,
            icon: cachedGuild.icon,
            onlineCount: cachedGuild.onlineCount,
            memberCount: cachedGuild.memberCount,
            ownerID: cachedGuild.ownerId,
            nitro: cachedGuild.boostCount,
          },
        });
      } else {
        const discordRes = await fetch(
          `https://discord.com/api/v10/guilds/${board.guildId}?with_counts=true`,
          {
            method: "GET",
            headers: {
              Authorization: `Bot ${env.BOT_TOKEN}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!discordRes.ok) {
          const { inviteUrl, ...boardWithoutInvite } = board;
          guildBoardResponse.push({
            ...boardWithoutInvite,
            guild: null,
          });
          continue;
        }

        const guild: APIGuild = await discordRes.json();

        await prisma.guildCache.upsert({
          where: { id: guild.id },
          update: {
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            onlineCount: guild.approximate_presence_count || 0,
            memberCount: guild.approximate_member_count || 0,
            ownerId: guild.owner_id,
            boostCount: guild.premium_subscription_count || 0,
          },
          create: {
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            onlineCount: guild.approximate_presence_count || 0,
            memberCount: guild.approximate_member_count || 0,
            ownerId: guild.owner_id,
            boostCount: guild.premium_subscription_count || 0,
          },
        });

        const { inviteUrl, ...boardWithoutInvite } = board;
        guildBoardResponse.push({
          ...boardWithoutInvite,
          guild: {
            id: guild.id,
            name: guild.name,
            iconURL: guild.icon
              ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
              : null,
            icon: guild.icon,
            onlineCount: guild.approximate_presence_count || null,
            memberCount: guild.approximate_member_count || null,
            ownerID: guild.owner_id,
            nitro: guild.premium_subscription_count || 0,
          },
        });
      }
    }

    return guildBoardResponse;
  })
  .get("/invite/:id", async ({ params, query }) => {
    const { token } = query;
    if (!token) throw new Error("Token is required");

    const result = await validateTurnstileToken({
      token,
      secretKey: env.TURNSTILE_SECRET,
    });
    if (!result.success) throw new Error("Invalid token");

    const board = await prisma.guildBoard.findUnique({
      where: { guildId: params.id },
    });

    if (!board) throw new Error("Guild not found");

    return redirect(board.inviteUrl);
  });

export default guildBoard;
