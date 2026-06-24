import {
  Client,
  BaseInteraction,
  Colors,
  InteractionResponse,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  MessageFlags,
  ChannelType,
} from "discord.js";
import { InteractionCreateEvent } from "@/@types/Util";
import { relative } from "path";
import Report from "@/util/Report";
import config from "@/config";
import { prisma } from "@/util/db";
import { evaluateServerRisk } from "@/util/EvaluateServer";

class RegisterEvent implements InteractionCreateEvent {
  public readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public async execute(interaction: BaseInteraction): Promise<InteractionResponse<boolean> | void> {
    if (!interaction.isModalSubmit() || interaction.customId != "register") return;

    const description = interaction.fields.getTextInputValue("description");

    try {
      if (!interaction.channel || !interaction.guild)
        return await interaction.reply({
          embeds: [
            {
              color: Colors.Red,
              author: {
                name: "登録できませんでした",
                icon_url: config.image.errorIcon,
              },
              description: "ギルド又はチャンネルを取得することができません",
            },
          ],
          flags: MessageFlags.Ephemeral,
        });

      if (
        interaction.channel.type !== ChannelType.GuildText &&
        interaction.channel.type !== ChannelType.GuildVoice &&
        interaction.channel.type !== ChannelType.GuildAnnouncement &&
        interaction.channel.type !== ChannelType.GuildStageVoice
      )
        return await interaction.reply({
          embeds: [
            {
              color: Colors.Red,
              author: {
                name: "登録できませんでした",
                icon_url: config.image.errorIcon,
              },
              description: "テキストベースのチャンネルで実行してください",
            },
          ],
          flags: MessageFlags.Ephemeral,
        });

      const risk = await evaluateServerRisk({ name: interaction.guild.name, description });

      if (risk.risk >= 50) {
        await interaction.reply({
          embeds: [
            {
              color: Colors.Red,
              author: {
                name: "登録できませんでした",
                icon_url: config.image.errorIcon,
              },
              description:
                "サーバー掲示板の審査基準を満たしていないため、登録できませんでした。\nなお、審査に関する詳細な情報についてはお答えできかねますので、ご了承ください。",
            },
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      const invite = await interaction.channel.createInvite({
        unique: true,
        maxAge: 0,
      });

      await prisma.guildBoard.create({
        data: {
          guildId: interaction.guild.id,
          description: description,
          inviteUrl: invite.url,
        },
      });

      await interaction.reply({
        embeds: [
          {
            color: Colors.Green,
            author: {
              name: "サーバー掲示板に登録しました",
              icon_url: config.image.successIcon,
            },
          },
        ],
      });
    } catch (error) {
      if (error instanceof Error) {
        Report.sendInteractionError(
          interaction,
          error.stack || `不明なエラー: ${relative(process.cwd(), __filename)}`,
        );
      }

      await interaction.reply({
        embeds: [
          {
            color: Colors.Red,
            author: {
              name: "登録できませんでした",
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
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}

export default RegisterEvent;
