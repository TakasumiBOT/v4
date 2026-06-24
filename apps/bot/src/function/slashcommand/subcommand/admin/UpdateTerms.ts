import {
  Client,
  InteractionResponse,
  Colors,
  MessageFlags,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { SubCommand, ValidSubCommandInteraction } from "@/@types/Util";
import CommandUtils from "@/util/CommandUtils";
import config from "@/config";
import { prisma } from "@takasumibot-v4/db";

class UpdateTermsSubCommand implements SubCommand {
  public readonly client: Client;

  public readonly name: string = "update-terms";
  public readonly description: string = "利用規約を更新します";
  public readonly example: string[] = [];

  public readonly userPermission: bigint[] = [];

  public readonly botPermission: bigint[] = [];

  constructor(client: Client) {
    this.client = client;
  }

  public async execute(
    interaction: ValidSubCommandInteraction,
  ): Promise<InteractionResponse<boolean> | void> {
    if (
      interaction.options.getSubcommand() !== this.name ||
      !(await CommandUtils.hasPermissions(this, interaction))
    )
      return;

    const url: string = interaction.options.getString("url", true);
    const message: string = interaction.options.getString("message", true);

    await prisma.termsChange.create({
      data: {
        termsUrl: url,
        message: message,
      },
    });

    await interaction.reply({
      embeds: [
        {
          color: Colors.Green,
          author: {
            name: "利用規約を更新しました",
            icon_url: config.image.successIcon,
          },
        },
      ],
    });
  }

  public build(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) =>
        option.setName("url").setDescription("利用規約のURL").setRequired(true),
      )
      .addStringOption((option) =>
        option.setName("message").setDescription("運営からのメッセージ").setRequired(true),
      );
  }
}

export default UpdateTermsSubCommand;
