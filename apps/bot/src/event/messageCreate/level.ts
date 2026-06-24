import { Client, Message } from "discord.js";
import { MessageCreateEvent } from "@/@types/Util";
import config from "@/config";
import crypto from "node:crypto";
import { shardRedis } from "@/util/redis";
import { prisma } from "@takasumibot-v4/db";

const lv = config.level;

class GlobalChatEvent implements MessageCreateEvent {
  public readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public async execute(message: Message): Promise<Message | void> {
    if (message.author.bot) return;
    if (message.channel.isDMBased()) return;

    const userId = message.author.id;
    const guildId = message.guildId ?? "-1";
    const featureType = "ranking";

    const OptinGlobal = `level:optin:user:${userId}`;
    const OptinLocal = `level:optin:guild:${guildId}:${userId}`;
    const OptoutGlobal = `level:optout:user:${userId}`;
    const OptoutLocal = `level:optout:guild:${guildId}:${userId}`;

    const Optin = {
      g: 0,
      l: 0,
    };

    const Optout = {
      g: 0,
      l: 0,
    };

    [Optin.g, Optin.l, Optout.g, Optout.l] = await Promise.all([
      shardRedis.exists(OptinGlobal),
      shardRedis.exists(OptinLocal),
      shardRedis.exists(OptoutGlobal),
      shardRedis.exists(OptoutLocal),
    ]);

    const globalOk = Optin.g || Optout.g;
    const localOk = Optin.l || Optout.l;

    if (!(globalOk && localOk)) {
      if (!globalOk) {
        const isOptout = !!(await prisma.optoutUser.findUnique({
          where: {
            userId_featureType: {
              userId,
              featureType,
            },
          },
        }));

        if (isOptout) {
          await shardRedis.set(OptoutGlobal, "", "EX", 600);
          Optout.g = 1;
        } else {
          await shardRedis.set(OptinGlobal, "", "EX", 1200);
          Optin.g = 1;
        }
      }
      if (!localOk) {
        const isOptout = !!(await prisma.optoutGuild.findUnique({
          where: {
            guildId_userId_featureType: {
              guildId,
              userId,
              featureType,
            },
          },
        }));

        if (isOptout) {
          await shardRedis.set(OptoutLocal, "", "EX", 600);
          Optout.l = 1;
        } else {
          await shardRedis.set(OptinLocal, "", "EX", 1200);
          Optin.l = 1;
        }
      }
    }

    const GuildCT = `level:limit:g:${guildId}:${userId}`;
    const GuildSc = `level:score:g:${guildId}:${userId}`;
    const UserCT = `level:limit:u:${userId}`;
    const UserSc = `level:score:u:${userId}`;

    if (!Optout.l && Optin.l && !(await shardRedis.exists(GuildCT))) {
      //ローカルランキング
      if (!(message.content.length < lv.minLength) && hit(lv.score.percent)) {
        //スコア加算処理
        let score = crypto.randomInt(lv.score.min, lv.score.max + 1);

        if (message.content.length > lv.bonus.length && hit(lv.bonus.percent)) {
          score = Math.floor(score * (1 + crypto.randomInt(lv.bonus.min, lv.bonus.max) / 100));
        }
        await shardRedis.incrby(GuildSc, score);
      }

      if (hit(lv.cooltime.percent)) {
        //クールタイム加算処理
        await shardRedis.set(
          GuildCT,
          "",
          "EX",
          crypto.randomInt(lv.cooltime.min, lv.cooltime.max + 1),
        );
      }
    }

    if (!Optout.g && Optin.g && !(await shardRedis.exists(UserCT))) {
      //グローバルランキング
      if (!(message.content.length < lv.minLength) && hit(lv.score.percent)) {
        let score = crypto.randomInt(lv.score.min, lv.score.max + 1);

        if (message.content.length > lv.bonus.length && hit(lv.bonus.percent)) {
          score = Math.floor(score * (1 + crypto.randomInt(lv.bonus.min, lv.bonus.max) / 100));
        }
        shardRedis.incrby(UserSc, score);
      }
      if (hit(lv.cooltime.percent)) {
        await shardRedis.set(
          UserCT,
          "",
          "EX",
          crypto.randomInt(lv.cooltime.min, lv.cooltime.max + 1),
        );
      }
    }
  }
}

export default GlobalChatEvent;

function hit(percent: number) {
  return crypto.randomInt(0, 100) < percent;
}
