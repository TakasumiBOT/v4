import { ErrorLogData } from "@/@types/Util";
import { BaseInteraction, Message } from "discord.js";
import Log from "@/util/Log";
import { prisma } from "@/util/db";

class Report {
  public static async sendError(data: ErrorLogData): Promise<void> {
    await prisma.errorLog.create({
      data: data,
    });

    Log.debug("エラーをデータベースに送信しました");
  }

  public static async sendInteractionError(
    interaction: BaseInteraction,
    reason: string,
  ): Promise<void> {
    if (!interaction.channelId || !interaction.guildId) return;

    await this.sendError({
      message: reason,
      userId: interaction.user.id,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
    });
  }

  public static async sendMessageError(message: Message, reason: string): Promise<void> {
    if (!message.channelId || !message.guildId) return;

    await this.sendError({
      message: reason,
      userId: message.author.id,
      channelId: message.channelId,
      guildId: message.guildId,
    });
  }

  public static async sendCustomError({
    reason,
    userId,
    channelId,
    guildId,
  }: {
    reason: string;
    userId?: string;
    channelId: string;
    guildId: string;
  }): Promise<void> {
    await this.sendError({
      message: reason,
      userId: userId,
      channelId: channelId,
      guildId: guildId,
    });
  }
}

export default Report;
