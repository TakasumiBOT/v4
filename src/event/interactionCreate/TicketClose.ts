import {
  Client,
  BaseInteraction,
  Colors,
  InteractionResponse,
  MessageFlags,
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
} from "discord.js";
import { InteractionCreateEvent } from "@/@types/Util";
import config from "@/config";
import Report from "@/util/Report";
import { relative } from "path";

class TicketCloseEvent implements InteractionCreateEvent {
  public readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public async execute(interaction: BaseInteraction): Promise<InteractionResponse<boolean> | void> {
    if (!interaction.isButton() || !interaction.customId.startsWith("close")) return;

    if (!interaction.channel)
      return await interaction.reply({
        embeds: [
          {
            color: Colors.Red,
            author: {
              name: "チケットを削除できませんでした",
              icon_url: config.image.errorIcon,
            },
            description: "チャンネルが取得できません",
          },
        ],
        flags: MessageFlags.Ephemeral,
      });

    try {
      await interaction.channel.delete();
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
              name: "チケットを削除できませんでした",
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

export default TicketCloseEvent;
