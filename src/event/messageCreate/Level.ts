import { Client, Message, Colors } from "discord.js";
import { MessageCreateEvent } from "@/@types/Util";
import config from "@/config";
import { prisma } from "@/util/db";
import calcLevel from "@/util/calcLevel";

const GRANT_EXP = 5;
const GRANT_INTERVAL = 5 * 60 * 1000;

class LevelEvent implements MessageCreateEvent {
  public readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public async execute(message: Message): Promise<Message | void> {
    if (message.author.bot || !message.inGuild()) return;

    const where = {
      userId_guildId: {
        userId: message.author.id,
        guildId: message.guild.id,
      },
    };

    const before = await prisma.levelUser.findUnique({ where });

    if (
      before?.lastChatGrant &&
      new Date().getTime() - before.lastChatGrant.getTime() < GRANT_INTERVAL
    )
      return;

    const oldLevel: number = calcLevel(before?.chatExp ?? 0).level;

    const after = await prisma.levelUser.upsert({
      where,
      create: {
        userId: message.author.id,
        guildId: message.guild.id,
        chatExp: GRANT_EXP,
        lastChatGrant: new Date(),
      },
      update: {
        chatExp: { increment: GRANT_EXP },
        lastChatGrant: new Date(),
      },
    });

    const newLevel: number = calcLevel(after.chatExp).level;

    if (newLevel <= oldLevel) return;

    const setting = await prisma.levelSetting.findUnique({
      where: { userId: message.author.id },
    });

    if (setting && !setting.notify) return;

    await message.channel.send({
      content: `<@${message.author.id}>`,
      embeds: [
        {
          color: Colors.Green,
          author: {
            name: "レベルアップ",
            icon_url: config.image.successIcon,
          },
          description: `Lv.${oldLevel}からLv.${newLevel}に上がりました\n現在のEXPは${after.chatExp}です`,
        },
      ],
    });
  }
}

export default LevelEvent;
