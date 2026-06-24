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
import { prisma } from "@takasumibot-v4/db";

class TermsAgreeEvent implements InteractionCreateEvent {
  public readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public async execute(interaction: BaseInteraction): Promise<InteractionResponse<boolean> | void> {
    if (!interaction.isButton() || interaction.customId !== "termsAgree") return;

    try {
      await prisma.account.update({
        where: { userId: interaction.user.id },
        data: { lastAgreedAt: new Date() },
      });

      await interaction.update({
        embeds: [
          {
            color: Colors.Green,
            author: {
              name: "利用規約に同意しました",
              icon_url: config.image.successIcon,
            },
            description: "ご協力ありがとうございます。引き継ぎ、TakasumiBOTをお楽しみください！",
          },
        ],
        components: [],
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
              name: "利用規約の同意に失敗しました",
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

export default TermsAgreeEvent;
