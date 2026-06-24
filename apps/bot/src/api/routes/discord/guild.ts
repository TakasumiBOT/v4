import { APIGuild } from "discord.js";
import { Elysia, status } from "elysia";
import { prisma } from "@/util/db";
import { bearer } from "@elysiajs/bearer";
import { env } from "@/util/Env";

const guild = new Elysia({ prefix: "/v3/discord/guild" })
  .use(bearer())
  .get("/:id", async ({ bearer, params: { id } }) => {
    if (!bearer || bearer !== env.API_PASSWORD) return status(401, { error: "Unauthorized" });

    if (!id) return { error: "ID is required" };

    const dbGuild = await prisma.guildCache.findUnique({
      where: {
        id: id,
      },
    });

    if (!dbGuild) {
      const discordRes = await fetch(`https://discord.com/api/v10/guilds/${id}?with_counts=true`, {
        method: "GET",
        headers: {
          Authorization: `Bot ${env.BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!discordRes.ok) return { error: "Guild not found" };

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

      return {
        id: guild.id,
        name: guild.name,
        iconURL: guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
          : null,
        icon: guild.icon,
        onlineCount: guild.approximate_presence_count,
        memberCount: guild.approximate_member_count,
        ownerID: guild.owner_id,
        nitro: guild.premium_subscription_count,
      };
    } else {
      return {
        id: dbGuild.id,
        name: dbGuild.name,
        iconURL: dbGuild.icon
          ? `https://cdn.discordapp.com/icons/${dbGuild.id}/${dbGuild.icon}.png`
          : null,
        icon: dbGuild.icon,
        onlineCount: dbGuild.onlineCount,
        memberCount: dbGuild.memberCount,
        ownerID: dbGuild.ownerId,
        nitro: dbGuild.boostCount,
      };
    }
  });

export default guild;
