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

class RankCommand implements Command {
  public readonly client: Client;

  public readonly type: CommandType = "tool";
  public readonly name: string = "rank";
  public readonly description: string = "ユーザーのランクを表示します";
  public readonly example: string[] = ["/rank @ユーザー", "/rank @ユーザー グローバル"];

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
    const guildId = interaction.guildId;
    const targetType = interaction.options.get("type", false)?.value || "guild";
    const featureType = "ranking";

    await interaction.deferReply();
    const user = interaction.options.getUser("user", false);
    if (user?.bot) return await interaction.editReply({
        embeds: [
          {
            color: Colors.Red,
            author: {
              icon_url: config.image.errorIcon,
              name: "実行できませんでした",
            },
            title: this.featureName,
            description: "BOTのランキングは表示できません",
          },
        ],
      });

    const userAccount = await prisma.account.findUnique({
      where: {
        userId: user?.id || interaction.user.id,
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
        return await interaction.editReply({
          embeds: [
            {
              title: this.featureName,
              description:
                "このユーザーは TakasumiBOT Ranking サーバーランキングからオプトアウトしているためランキングに掲載されていません",
              color: Colors.Yellow,
            },
          ],
        });
      }

      const score = (
        await prisma.levelGuild.findUnique({
          select: {
            score: true,
          },
          where: {
            guildId_userId: {
              guildId,
              userId,
            },
          },
        })
      )?.score;

      if (score != null) {
        const lv = lvScore.findIndex((v) => !(v < score)) - 1;
        const rank =
          (await prisma.levelGuild.count({
            where: {
              guildId,
              OR: [
                {
                  score: { gt: score },
                },
                {
                  score: score,
                  userId: { lt: userId },
                },
              ],
            },
          })) + 1;
        // 自分より上にいる人数+1 = 順位
        // スコア降順優先 同率はユーザーID昇順

        const { data, error } = await imageGen.v1.generate.level.post({
          avatar: this.client.users.cache.get(userId)?.displayAvatarURL({ extension: "png" })!,
          username: this.client.users.cache.get(userId)?.username!,
          serverIcon: interaction.guild.iconURL()!,
          level: lv,
          currentXp: score,
          nextLevelXp: lvScore[lv + 1] - lvScore[lv],
          background: backgroundUrl,
        });

        return await interaction.editReply({
          embeds: [
            {
              color: Colors.Green,
              title: this.featureName,
              description: `サーバーランキングで <@${userId}> さんは **${rank} 位** / Lv${lv} (${score} pts)です\n-# この機能はβ試験中です。画像機能は開発中です。`,
              footer: {
                icon_url: interaction.guild.iconURL() || undefined,
                text: interaction.guild.name,
              },
            },
          ],
        });
      } else {
        return await interaction.editReply({
          embeds: [
            {
              color: Colors.Yellow,
              author: {
                icon_url: config.image.warnIcon,
                name: "まだ登録されていません",
              },
              title: this.featureName,
              description: `<@${userId}> は、このサーバーでポイントを獲得していません。\n10分程度会話してから再度実行してください`,
            },
          ],
        });
      }
    } else if (targetType === "global") {
      const isOptout = !!(await prisma.optoutUser.findUnique({
        where: {
          userId_featureType: {
            userId,
            featureType,
          },
        },
      }));
      if (isOptout) {
        return await interaction.editReply({
          embeds: [
            {
              title: this.featureName,
              description:
                "このユーザーは TakasumiBOT Ranking グローバルランキングからオプトアウトしているためランキングに掲載されていません",
              color: Colors.Yellow,
            },
          ],
        });
      }

      const score = (
        await prisma.levelUser.findUnique({
          select: {
            score: true,
          },
          where: {
            userId,
          },
        })
      )?.score;

      if (score != null) {
        const lv = lvScore.findIndex((v) => !(v < score)) - 1;
        const rank =
          (await prisma.levelUser.count({
            where: {
              OR: [
                {
                  score: { gt: score },
                },
                {
                  score: score,
                  userId: { lt: userId },
                },
              ],
            },
          })) + 1;
        // 自分より上にいる人数+1 = 順位
        // スコア降順優先 同率はユーザーID昇順

        const { data, error } = await imageGen.v1.generate.level.post({
          avatar: this.client.users.cache.get(userId)?.displayAvatarURL({ extension: "png" })!,
          username: this.client.users.cache.get(userId)?.username!,
          serverIcon: interaction.guild.iconURL()!,
          level: lv,
          currentXp: Number(score),
          nextLevelXp: lvScore[lv + 1] - lvScore[lv],
          background: backgroundUrl,
        });

        return await interaction.editReply({
          embeds: [
            {
              color: Colors.Green,
              title: this.featureName,
              description: `グローバルランキングで <@${userId}> さんは **${rank} 位** / Lv${lv} (${score} pts)です\n-# この機能はβ試験中です。画像機能は開発中です。`,
              footer: {
                text: "TakasumiBOT グローバルランキング",
              },
            },
          ],
        });
      } else {
        return await interaction.editReply({
          embeds: [
            {
              color: Colors.Yellow,
              author: {
                icon_url: config.image.warnIcon,
                name: "まだ登録されていません",
              },
              title: this.featureName,
              description: `<@${userId}> は、ポイントを獲得していません。\n10分程度会話してから再度実行してください`,
            },
          ],
        });
      }
    } else {
      return await interaction.editReply({
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
      .addUserOption((option) =>
        option.setName("user").setDescription("ユーザーを指定").setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("ランキングの種類")
          .setRequired(false)
          .addChoices(
            { name: "サーバー", value: "guild" },
            { name: "グローバル", value: "global" },
          ),
      );
  }
}

export default RankCommand;
