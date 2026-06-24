import {
  Client,
  InteractionResponse,
  SlashCommandSubcommandBuilder,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { SubCommand, ValidSubCommandInteraction } from "@/@types/Util";
import CommandUtils from "@/util/CommandUtils";
import { prisma } from "@takasumibot-v4/db";
import { shardRedis } from "@/util/redis";

class OptoutRankingSubCommand implements SubCommand {
  public readonly client: Client;

  public readonly name: string = "ranking";
  public readonly description: string = "TakasumiBOT Rankingからオプトアウト(オプトイン)します";
  public readonly example: string[] = ["/optout ranking"];

  public readonly userPermission: bigint[] = [];

  public readonly botPermission: bigint[] = [];

  constructor(client: Client) {
    this.client = client;
  }

  public async execute(
    interaction: ValidSubCommandInteraction,
  ): Promise<InteractionResponse<boolean> | Message | void> {
    if (
      interaction.options.getSubcommand() !== this.name ||
      !(await CommandUtils.hasPermissions(this, interaction))
    )
      return;

    await interaction.deferReply({
      flags: "Ephemeral",
    });

    const target = interaction.options.getString("target") ?? "global";
    const userId = interaction.user.id;
    const guildId = interaction.guildId ?? "-1";
    const featureType = "ranking";

    if (target === "global") {
      const find = await prisma.optoutUser.findUnique({
        where: {
          userId_featureType: {
            userId,
            featureType,
          },
        },
      });

      if (find) {
        await prisma.optoutUser.delete({
          where: {
            userId_featureType: {
              userId,
              featureType,
            },
          },
        });
        await shardRedis.del(`level:optin:guild:${guildId}:${userId}`);
        return await interaction.editReply({
          embeds: [
            {
              title: "オプトインしました",
              description:
                "TakasumiBOT Ranking ローカルランキングにオプトインしました。\nカウンターはリセットされています。ご了承のほどお願いいたします。",
            },
          ],
        });
      } else {
        return await interaction.editReply({
          embeds: [
            {
              title: "オプトアウトしますか?",
              description:
                "TakasumiBOT Rankingからオプトアウトしますか?\n### オプトアウトすると、ランキングのスコア、現在の順位などが消去されます。\nそれでもオプトアウトする場合は、以下の赤色の「オプトアウトする」を押してください。\nキャンセルする場合は、青色の「オプトアウトしない」を押してください。",
            },
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId(`applyRankingOptout:0:${userId}`)
                  .setLabel("オプトアウトする")
                  .setStyle(ButtonStyle.Danger),
              )
              .addComponents(
                new ButtonBuilder()
                  .setCustomId(`cancelRankingOptout:0:${userId}`)
                  .setLabel("オプトアウトしない")
                  .setStyle(ButtonStyle.Primary),
              ),
          ],
        });
      }
    } else if (target === "guild") {
      const find = await prisma.optoutGuild.findUnique({
        where: {
          guildId_userId_featureType: {
            guildId,
            userId,
            featureType,
          },
        },
      });

      if (find) {
        await prisma.optoutGuild.delete({
          where: {
            guildId_userId_featureType: {
              guildId,
              userId,
              featureType,
            },
          },
        });
        await shardRedis.del(`level:optin:user:${userId}`);
        return await interaction.editReply({
          embeds: [
            {
              title: "オプトインしました",
              description:
                "TakasumiBOT Ranking グローバルランキングにオプトインしました。\nカウンターはリセットされています。ご了承のほどお願いいたします。",
            },
          ],
        });
      } else {
        return await interaction.editReply({
          embeds: [
            {
              title: "オプトアウトしますか?",
              description:
                "TakasumiBOT Rankingからオプトアウトしますか?\nオプトアウトすると、ランキングのスコア、現在の順位などが消去されます。\nそれでもオプトアウトする場合は、以下の「オプトアウトする」ボタンを押してください。\nキャンセルする場合は、「オプトアウトしない」を押してください。",
            },
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId(`applyRankingOptout:${guildId}:${userId}`)
                  .setLabel("オプトアウトする")
                  .setStyle(ButtonStyle.Danger),
              )
              .addComponents(
                new ButtonBuilder()
                  .setCustomId(`cancelRankingOptout:${guildId}:${userId}`)
                  .setLabel("オプトアウトしない")
                  .setStyle(ButtonStyle.Primary),
              ),
          ],
        });
      }
    } else {
      return await interaction.editReply({
        embeds: [
          {
            title: "処理できませんでした",
            description: `ターゲット不一致エラー\n\`\`\`診断コード: optout-${featureType}:${guildId}:${userId}:-1:${target}\`\`\``,
          },
        ],
      });
    }
  }

  public build(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) =>
        option
          .setName("target")
          .setDescription("オプトアウトするランキングを選択してください")
          .addChoices({ name: "グローバル", value: "global" }, { name: "ローカル", value: "guild" })
          .setRequired(false),
      );
  }
}

export default OptoutRankingSubCommand;
