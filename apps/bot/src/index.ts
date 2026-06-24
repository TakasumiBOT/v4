import { Client, GatewayIntentBits } from "discord.js";
import config from "./config";
import Handler from "./Handler";
import Cron from "./Cron";
import Log from "./util/Log";
import type { ShardStats } from "./@types/Util";
import { env } from "./util/Env";
import { shardRedis } from "./util/redis";
import updateStatus from "./util/updateStatus";
import updateMachineStatus from "./util/updateMachineStatus";

const client: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
  sweepers: {
    messages: {
      interval: config.cacheLimit,
      lifetime: config.cacheLimit,
    },
    reactions: {
      interval: config.cacheLimit,
      filter: () => () => true,
    },
    presences: {
      interval: config.cacheLimit,
      filter: () => () => true,
    },
    invites: {
      interval: config.cacheLimit,
      lifetime: config.cacheLimit,
    },
    emojis: {
      interval: config.cacheLimit,
      filter: () => () => true,
    },
    threads: {
      interval: config.cacheLimit,
      lifetime: config.cacheLimit,
    },
    threadMembers: {
      interval: config.cacheLimit,
      filter: () => () => true,
    },
    stickers: {
      interval: config.cacheLimit,
      filter: () => () => true,
    },
    bans: {
      interval: config.cacheLimit,
      filter: () => () => true,
    },
    voiceStates: {
      interval: config.cacheLimit,
      filter: () => () => true,
    },
    stageInstances: {
      interval: config.cacheLimit,
      filter: () => () => true,
    },
    applicationCommands: {
      interval: config.cacheLimit,
      filter: () => () => true,
    },
    autoModerationRules: {
      interval: config.cacheLimit,
      filter: () => () => true,
    },
    entitlements: {
      interval: config.cacheLimit,
      filter: () => () => true,
    },
  },
});

new Handler(client);
new Cron(client);

// MARK: Redis関連処理
shardRedis.on("reconnecting", () => {
  updateStatus(client);
  updateMachineStatus();
});

export const giveRole = async (userId: string, roleId: string, guildId: string): Promise<void> => {
  const guild = await client.guilds.fetch(guildId);
  const member = await guild.members.fetch(userId);

  if (member) {
    await member.roles.add(roleId);
  } else {
    Log.error(`ユーザーIDが${userId}のユーザーはギルドIDが${guildId}のサーバーに存在しません`);
  }
};

export const getShardStatus = async (): Promise<ShardStats[]> => {
  if (!client.shard) {
    return [
      {
        shardId: 0,
        status: client.ws.status.toString(),
        ping: client.ws.ping,
        guildCount: client.guilds.cache.filter((g) => g.available).size,
        userCount: client.guilds.cache
          .filter((g) => g.available)
          .reduce((acc, guild) => acc + guild.memberCount, 0),
      },
    ];
  }

  const shardStatuses: ShardStats[] = [];

  //console.info("index.ts debug", config.shardCount);
  if (client.shard.count < config.shardCount) {
    return shardStatuses;
  }

  const results = await client.shard.broadcastEval((c) => ({
    guildCount: c.guilds.cache.filter((g) => g.available).size,
    memberCount: c.guilds.cache
      .filter((g) => g.available)
      .reduce((acc, guild) => acc + guild.memberCount, 0),
    status: c.ws.status.toString(),
    ping: c.ws.ping,
    shardId: (c as any).shard.ids[0],
  }));

  results.forEach((data, index) => {
    shardStatuses.push({
      shardId: data.shardId ?? index,
      status: data.status,
      ping: data.ping,
      guildCount: data.guildCount,
      userCount: data.memberCount,
    });
  });

  return shardStatuses;
};

client.login(env.BOT_TOKEN).then(() => {
  Log.info(`${env.SHARDS ? `${env.SHARDS}番シャードが` : ""}ログインしました`);
});

process.on("uncaughtException", (error: Error) => {
  if (error.message === "Shards are still being spawned.") return;
  if (!error.stack) return;

  Log.error(error.stack);
});

process.on("unhandledRejection", (reason: any) => {
  if (reason?.message === "Shards are still being spawned.") return;
  console.log(reason);
  Log.error(reason as string);
});
