import { Client, Colors } from "discord.js";
import cron from "node-cron";
import { prisma } from "@/util/db";
import Log from "@/util/Log";
import getUserCount from "@/util/getUserCount";
import getGuildCount from "@/util/getGuildCount";
import { NotificationQueueService } from "@/util/NotificationQueue";
import { NotificationType } from "@/generated";
import { env } from "@/util/Env";
import { getShardStatus } from "@/index";
import { shardRedis } from "@/util/redis";

class Cron {
  public readonly client: Client;

  constructor(client: Client) {
    this.client = client;

    if (client.shard && env.SHARDS !== "0") return;

    Log.info("Cronを起動しました");

    cron.schedule("0 0 * * *", () => {
      this.deleteMuteIp();
      this.resetGuildStatistics();
    });

    cron.schedule("0 * * * *", () => {
      this.deleteCommandCooldown();
      this.recordSystemLog();
    });

    cron.schedule("* * * * *", () => {
      this.deleteExpiredAuth();
      this.sendNotifications();
      this.recordShardStatus();
    });
  }

  private async recordSystemLog(): Promise<void> {
    const commandCount = await prisma.commandHistory.count({
      where: {
        executedAt: {
          gte: new Date(Date.now() - 3600000),
        },
      },
    });

    const loggedAt = new Date();

    loggedAt.setMinutes(0, 0, 0);

    await prisma.systemLog.create({
      data: {
        ping: this.client.ws.ping,
        totalUser: await getUserCount(this.client),
        totalGuild: await getGuildCount(this.client),
        totalCommand: commandCount,
        loggedAt: loggedAt,
      },
    });

    Log.debug("システムログを記録しました");
  }

  private async recordShardStatus(): Promise<void> {
    const shardData = await getShardStatus();

    await prisma.shardStatus.create({
      data: {
        data: JSON.stringify(shardData),
      },
    });
  }

  private async resetGuildStatistics(): Promise<void> {
    await prisma.guildStatistics.updateMany({
      data: {
        totalJoin: 0,
        totalLeave: 0,
        totalMessage: 0,
      },
    });

    Log.debug(`サーバー統計情報を削除しました`);
  }

  private async deleteMuteIp(): Promise<void> {
    const { count } = await prisma.muteIp.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 2592000000),
        },
      },
    });

    if (count === 0) return;

    Log.debug(`1か月以上経過した${count}個のMuteIpを削除しました`);
  }

  private async deleteExpiredAuth(): Promise<void> {
    const { count } = await prisma.webauth.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 300000),
        },
      },
    });

    if (count === 0) return;

    Log.debug(`5分以上経過した${count}個の無効なWeb認証セッションを削除しました`);
  }

  private async deleteCommandCooldown(): Promise<void> {
    const { count } = await prisma.commandCooldown.deleteMany({
      where: {
        executedAt: {
          lt: new Date(Date.now() - 604800000),
        },
      },
    });

    if (count === 0) return;

    Log.debug(`1週間以上経過した${count}個のCommandCoolDownを削除しました`);
  }

  private async sendNotifications(): Promise<void> {
    const notifications = await NotificationQueueService.getAll();

    const notificationsToSend = notifications.filter((n) => n.scheduledAt <= new Date());

    const CHUNK_SIZE = 25;

    for (let i = 0; i < notificationsToSend.length; i += CHUNK_SIZE) {
      const chunk = notificationsToSend.slice(i, i + CHUNK_SIZE);

      await Promise.all(
        chunk.map(async (notification) => {
          const guild = await this.client.guilds.fetch(notification.guildId).catch(() => null);
          if (!guild) {
            await NotificationQueueService.remove(notification.id);
            return;
          }
          const channel = await guild.channels.fetch(notification.channelId).catch(() => null);
          if (!channel || !channel.isTextBased()) {
            await NotificationQueueService.remove(notification.id);
            return;
          }
          if (notification.type === NotificationType.bump) {
            const bumpNoticeData = await prisma.bumpNotice.findUnique({
              where: {
                guildId: notification.guildId,
              },
            });

            await channel
              .send({
                content: bumpNoticeData ? `<@&${bumpNoticeData.roleId}>` : "",
                embeds: [
                  {
                    color: Colors.White,
                    title: "BUMP通知",
                    description:
                      "BUMPの時間です\n</bump:947088344167366698>でサーバーの表示順位を上げよう！",
                  },
                ],
              })
              .catch(() => {});
          } else if (notification.type === NotificationType.dissoku) {
            const upNoticeData = await prisma.upNotice.findUnique({
              where: {
                guildId: notification.guildId,
              },
            });
            await channel
              .send({
                content: upNoticeData ? `<@&${upNoticeData.roleId}>` : "",
                embeds: [
                  {
                    color: Colors.Blue,
                    title: "Dissoku UP通知",
                    description:
                      "UPの時間です\n</up:1363739182672904354>でサーバーの表示順位を上げよう！",
                  },
                ],
              })
              .catch(() => {});
          } else if (notification.type === NotificationType.tksmup) {
            const upNoticeData = await prisma.upNotice.findUnique({
              where: {
                guildId: notification.guildId,
              },
            });

            await channel
              .send({
                content: upNoticeData ? `<@&${upNoticeData.roleId}>` : "",
                embeds: [
                  {
                    color: Colors.Green,
                    title: "TakasumiBOT UP通知",
                    description:
                      "UPの時間です\n</up:1135405664852783157>でサーバーの表示順位を上げよう！",
                  },
                ],
              })
              .catch(() => {});
          }
          await NotificationQueueService.remove(notification.id);
        }),
      );

      if (i + CHUNK_SIZE < notificationsToSend.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
}

export default Cron;
