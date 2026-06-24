import { Client, Message, ChannelType } from "discord.js";
import { MessageCreateEvent } from "@/@types/Util";
import { relative } from "path";
import Report from "@/util/Report";
import { prisma } from "@/util/db";

class PublishEvent implements MessageCreateEvent {
  public readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public async execute(message: Message): Promise<Message | void> {
    if (message.author.bot || message.channel.type !== ChannelType.GuildAnnouncement) return;

    const publishData = await prisma.publish.findUnique({
      where: {
        channelId: message.channelId,
      },
    });

    if (!publishData) return;

    try {
      if (message.reference) return;

      await message.crosspost();
      await message.react("✅");
    } catch (error) {
      await prisma.publish.delete({
        where: {
          channelId: message.channelId,
        },
      });

      if (error instanceof Error) {
        Report.sendMessageError(
          message,
          error.stack || `不明なエラー: ${relative(process.cwd(), __filename)}`,
        );
      }
    }
  }
}

export default PublishEvent;
