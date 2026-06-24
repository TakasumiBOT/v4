import {
  Client,
  RepliableInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  InteractionResponse,
  Colors,
  AttachmentBuilder,
  Message,
  MessageFlags,
} from "discord.js";
import { Command, CommandType } from "@/@types/Util";
import config from "@/config";
import CommandUtils from "@/util/CommandUtils";
import { prisma } from "@/util/db";

import { treaty } from "@elysiajs/eden";
import { App } from "@/image-gen";
import lvScore from "@/static/lvScore.json";

const imageGen = treaty<App>("http://localhost:3000");

class RankingCommand implements Command {
  public readonly client: Client;

  public readonly type: CommandType = "tool";
  public readonly name: string = "ranking";
  public readonly description: string = "ランキング一覧を表示します。";
  public readonly example: string[] = ["/ranking サーバー", "/rank グローバル 2144"];

  public readonly userPermission: bigint[] = [];

  public readonly botPermission: bigint[] = [];

  public readonly isDisplay: boolean = true;

  public readonly featureName: string = "TakasumiBOT Ranking β";

  constructor(client: Client) {
    this.client = client;
  }

  public async execute(
    interaction: RepliableInteraction,
  ): Promise<InteractionResponse<boolean> | Message | void> {
    if (
      !interaction.isChatInputCommand() ||
      interaction.commandName !== this.name ||
      !CommandUtils.isVaild(interaction) ||
      !(await CommandUtils.hasPermissions(this, interaction))
    )
      return;

    const userId = interaction.options.getUser("user", false)?.id || interaction.user.id;

    await interaction.deferReply();
    const index = (interaction.options.getInteger("index", false) || 1) - 1;
    //開始順位入力なので-1する
    const targetType = interaction.options.get("type", false)?.value || "guild";

    const userAccount = await prisma.account.findUnique({
      where: {
        userId: interaction.user.id,
      },
    });

    let backgroundUrl;

    if (!userAccount) {
      backgroundUrl = `${config.level.cardBackgroundsUrl}/default.png`;
    } else if (userAccount.levelCardId.startsWith("custom_")) {
      const customBackgroundObj = await prisma.customLevelCard.findUnique({
        where: {
          id: userAccount.levelCardId,
        },
      });
      backgroundUrl = customBackgroundObj!.url;
    } else {
      backgroundUrl = `${config.level.cardBackgroundsUrl}/${userAccount.levelCardId}.png`;
    }

    if (targetType === "guild") {
      const list = await prisma.levelGuild.findMany({
        where: {
          guildId: interaction.guildId,
        },
        orderBy: {
          score: "desc",
        },
        skip: index,
        take: 15,
      });

      const tmp = list
        .map(
          (u, i) =>
            `${i + index + 1}. Lv${lvScore.findIndex((v) => !(v < u.score)) - 1}\`(${u.score} pts)\` <@${u.userId}>`,
        )
        .join("\n");

      await interaction.editReply({
        embeds: [
          {
            color: Colors.Green,
            title: this.featureName,
            description: tmp,
            footer: {
              icon_url: interaction.guild.iconURL() || undefined,
              text: interaction.guild.name,
            },
          },
        ],
      });
    } else if (targetType === "global") {
      const list = await prisma.levelUser.findMany({
        orderBy: {
          score: "desc",
        },
        skip: index,
        take: 15,
      });

      const tmp = list
        .map(
          (u, i) =>
            `${i + index + 1}. Lv${lvScore.findIndex((v) => !(v < u.score)) - 1}\`(${u.score} pts)\` <@${u.userId}>`,
        )
        .join("\n");

      await interaction.editReply({
        embeds: [
          {
            color: Colors.Green,
            title: this.featureName,
            description: tmp,
            footer: {
              text: "TakasumiBOT グローバルランキング",
            },
          },
        ],
      });
    } else {
      await interaction.editReply({
        embeds: [
          {
            color: Colors.Red,
            author: {
              icon_url: config.image.errorIcon,
              name: "予期しないエラーが発生しました",
            },
            description: `異常値の入力が発生したため操作を実行できません`,
          },
        ],
      });
    }
  }

  public build(): SlashCommandOptionsOnlyBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("ランキングの種類")
          .setRequired(false)
          .addChoices(
            { name: "サーバー", value: "guild" },
            { name: "グローバル", value: "global" },
          ),
      )
      .addIntegerOption((option) =>
        option.setName("index").setDescription("表示する開始順位を入力").setRequired(false),
      );
  }
}

export default RankingCommand;
