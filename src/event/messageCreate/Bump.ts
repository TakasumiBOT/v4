import { Client, Message, Colors, PermissionFlagsBits, ChannelType } from "discord.js";
import { MessageCreateEvent } from "@/@types/Util";
import config from "@/config";
import { prisma } from "@/util/db";
import { NotificationQueueService } from "@/util/NotificationQueue";
import { NotificationType } from "@takasumibot-v4/db";
import { env } from "@/util/Env";

class BumpEvent implements MessageCreateEvent {
  public readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public async execute(message: Message): Promise<Message | void> {
    if (
      message.author.id !== config.bot.disboardId ||
      !message.inGuild() ||
      message.channel.type !== ChannelType.GuildText ||
      !message.guild.members.me ||
      !message.guild.members.me
        .permissionsIn(message.channel)
        .has(PermissionFlagsBits.ViewChannel) ||
      !message.guild.members.me.permissionsIn(message.channel).has(PermissionFlagsBits.SendMessages)
    )
      return;

    if (
      message.embeds[0]?.description &&
      (message.embeds[0]?.description.match(/表示順をアップしたよ/) ||
        message.embeds[0]?.description.match(/Bump done/))
    ) {
      const bumpNoticeIgnoreData = await prisma.bumpNoticeIgnore.findUnique({
        where: {
          guildId: message.guild.id,
        },
      });

      if (bumpNoticeIgnoreData) return;

      await message.channel
        .send({
          embeds: [
            {
              color: Colors.White,
              title: "BUMP通知",
              description: `BUMPを受信しました\n2時間後に通知します`,
            },
          ],
        })
        .catch(() => {});

      await NotificationQueueService.add({
        guildId: message.guild.id,
        channelId: message.channel.id,
        type: NotificationType.bump,
        delay: 7200000,
      });
    }
  }
}

export default BumpEvent;
