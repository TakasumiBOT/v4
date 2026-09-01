import { prisma } from "@/util/db";
import { NotificationType } from "@/generated";

interface IAddNotificationOptions {
  guildId: string;
  channelId: string;
  type: NotificationType;
  delay: number;
}

export class NotificationQueueService {
  public static getAll() {
    return prisma.notificationQueue.findMany();
  }

  public static add(options: IAddNotificationOptions) {
    return prisma.notificationQueue.create({
      data: {
        guildId: options.guildId,
        channelId: options.channelId,
        type: options.type,
        scheduledAt: new Date(Date.now() + options.delay),
      },
    });
  }

  public static remove(id: number) {
    return prisma.notificationQueue.deleteMany({
      where: { id },
    });
  }
}
