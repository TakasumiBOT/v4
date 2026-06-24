import {
  Client,
  RepliableInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  InteractionResponse,
  Colors,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
} from "discord.js";
import { Command, CommandType } from "@/@types/Util";
import os from "os";
import process from "process";
import config from "@/config";
import CommandUtils from "@/util/CommandUtils";
import Report from "@/util/Report";
import { relative } from "path";
import getMemoryStatus from "@/util/getMemoryStatus";
import formatBytes from "@/util/formatBytes";
import calcTime from "@/util/calcTime";
import getBotStatus from "@/util/getBotStatus";
import withSign from "@/util/withSign";
import getEventStatus from "@/util/getEventStatus";
import { EventType } from "@takasumibot-v4/db";
import getGuildCount from "@/util/getGuildCount";
import getUserCount from "@/util/getUserCount";
import getCpuStatus from "@/util/getCpuStatus";
import getCpuUsageAvg from "@/util/getCpuUsageAvg";
import getMemoryUsageAvg from "@/util/getMemoryUsageAvg";
import { botEnv as env } from "@takasumibot-v4/env/bot";

class StatusCommand implements Command {
  public readonly client: Client;

  public readonly type: CommandType = "bot";
  public readonly name: string = "status";
  public readonly description: string = "BOTのステータスを表示します";
  public readonly example: string[] = ["/status"];

  public readonly userPermission: bigint[] = [];

  public readonly botPermission: bigint[] = [];

  public readonly isDisplay: boolean = true;

  constructor(client: Client) {
    this.client = client;
  }

  public async execute(
    interaction: RepliableInteraction,
  ): Promise<InteractionResponse<boolean> | void> {
    if (
      !interaction.isChatInputCommand() ||
      interaction.commandName !== this.name ||
      !CommandUtils.isVaild(interaction) ||
      !(await CommandUtils.hasPermissions(this, interaction))
    )
      return;

    await interaction.deferReply();
    try {
      await interaction.editReply({
        embeds: [
          {
            color: Colors.Blue,
            description: "計測中...",
          },
        ],
      });

      const memoryStatus = getMemoryStatus();

      await interaction.editReply({
        embeds: [
          {
            color: Colors.Blue,
            title: "ステータス",
            fields: [
              {
                name: "システム",
                value: `CPU: ${await getCpuUsageAvg()}%\nRAM: ${formatBytes(memoryStatus.total - memoryStatus.free)}/${formatBytes(memoryStatus.total)} ${await getMemoryUsageAvg()}%\nマシン${env.MACHINE_ID}稼働時間: ${calcTime(os.uptime() * 1000)}\n(BOT: ${calcTime(process.uptime() * 1000)})`,
              },
              {
                name: "Discord",
                value: `Ping: ${interaction.client.ws.ping}ミリ秒\nコマンド数: ${(await interaction.client.application.commands.fetch()).size}個\n`,
              },
              {
                name: "統計データ (累計/24時間/±増減数)",
                value:
                  `サーバー数: ${(await getGuildCount(this.client)).toLocaleString("ja-JP")} / ${(await getBotStatus("oneDayGuildCount")).toLocaleString("ja-JP")} / ${withSign(await getBotStatus("differenceGuildCount"))}\nユーザー数: ${(await getUserCount(this.client)).toLocaleString("ja-JP")} / ${(await getBotStatus("oneDayUserCount")).toLocaleString("ja-JP")} / ${withSign(await getBotStatus("differenceUserCount"))}\nTakasumiBOTアカウント: ${(await getBotStatus("totalTakasumiAccount")).toLocaleString("ja-JP")}\n` +
                  `メッセージ数: ${(await getEventStatus("total", EventType.messageCreate)).toLocaleString("ja-JP")} / ${await getEventStatus("oneDay", EventType.messageCreate)} / ${withSign(await getEventStatus("difference", EventType.messageCreate))} (ユーザーのみ: ${(await getEventStatus("totalOnlyUser", EventType.messageCreate)).toLocaleString("ja-JP")})\nコマンド実行: ${(await getBotStatus("totalCmd")).toLocaleString("ja-JP")} / ${await getBotStatus("oneDayCmd")} / ${withSign(await getBotStatus("differenceCmd"))}\nインタラクション数: ${(await getEventStatus("total", EventType.interactionCreate)).toLocaleString("ja-JP")} / ${await getEventStatus("oneDay", EventType.interactionCreate)} / ${withSign(await getEventStatus("difference", EventType.interactionCreate))}\nメンバー参加数: ${(await getEventStatus("total", EventType.guildMemberAdd)).toLocaleString("ja-JP")} / ${await getEventStatus("oneDay", EventType.guildMemberAdd)} / ${withSign(await getEventStatus("difference", EventType.guildMemberAdd))}\nメンバー脱退数: ${(await getEventStatus("total", EventType.guildMemberRemove)).toLocaleString("ja-JP")} / ${await getEventStatus("oneDay", EventType.guildMemberRemove)} / ${withSign(await getEventStatus("difference", EventType.guildMemberRemove))}`,
              },
            ],
          },
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel("サポートサーバー")
              .setURL(config.inviteUrl)
              .setStyle(ButtonStyle.Link),
          ),
        ],
      });
    } catch (error) {
      if (error instanceof Error) {
        Report.sendInteractionError(
          interaction,
          error.stack || `不明なエラー: ${relative(process.cwd(), __filename)}`,
        );
      }

      await interaction.editReply({
        embeds: [
          {
            color: Colors.Red,
            author: {
              name: "取得できませんでした",
              icon_url: config.image.errorIcon,
            },
            fields: [
              {
                name: "エラーコード",
                value: `\`\`\`${error}\`\`\``,
              },
            ],
          },
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel("サポートサーバー")
              .setURL(config.inviteUrl)
              .setStyle(ButtonStyle.Link),
          ),
        ],
      });
    }
  }

  public build(): SlashCommandOptionsOnlyBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description);
  }
}

export default StatusCommand;
