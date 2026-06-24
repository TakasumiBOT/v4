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
import Fetch from "@/util/Fetch";
import Money from "@/util/Money";
import { prisma } from "@takasumibot-v4/db";

class MoneySubCommand implements SubCommand {
  public readonly client: Client;

  public readonly name: string = "money";
  public readonly description: string = "ユーザーの所持金を操作します";
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

    const type = interaction.options.getString("type", true);
    const id = interaction.options.getString("id", true);
    const amount = interaction.options.getInteger("amount", true);

    const user = await Fetch.user(interaction.client, id);
    if (!user)
      return await interaction.reply({
        embeds: [
          {
            color: Colors.Red,
            author: {
              name: "ユーザーを取得できませんでした",
              icon_url: config.image.errorIcon,
            },
            description: "指定したユーザーが存在しません",
          },
        ],
        flags: MessageFlags.Ephemeral,
      });

    const accountData = await prisma.account.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!accountData)
      return await interaction.reply({
        embeds: [
          {
            color: Colors.Red,
            author: {
              name: "操作できませんでした",
              icon_url: config.image.errorIcon,
            },
            description: "アカウントが存在しません",
          },
        ],
        flags: MessageFlags.Ephemeral,
      });

    if (type === "add") {
      return await prisma.$transaction(async (tx) => {
        await Money.add(user.id, amount, "管理者による調整", tx);

        await interaction.reply({
          embeds: [
            {
              color: Colors.Green,
              author: {
                name: `${user.displayName}(${user.id}) に${amount}コイン付与しました`,
                icon_url: config.image.successIcon,
              },
            },
          ],
        });
      });
    } else {
      if (accountData.assets < amount)
        return await interaction.reply({
          embeds: [
            {
              color: Colors.Red,
              author: {
                name: "操作できませんでした",
                icon_url: config.image.errorIcon,
              },
              description: "無効な値です",
            },
          ],
          flags: MessageFlags.Ephemeral,
        });

      return await prisma.$transaction(async (tx) => {
        await Money.delete(user.id, amount, "管理者による調整", tx);

        await interaction.reply({
          embeds: [
            {
              color: Colors.Green,
              author: {
                name: `${user.displayName}(${user.id}) に${amount}コイン削除しました`,
                icon_url: config.image.successIcon,
              },
            },
          ],
        });
      });
    }
  }

  public build(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("操作内容")
          .setRequired(true)
          .addChoices({ name: "付与", value: "add" }, { name: "削除", value: "delete" }),
      )
      .addStringOption((option) =>
        option.setName("id").setDescription("対象のユーザーID").setRequired(true),
      )
      .addIntegerOption((option) =>
        option.setName("amount").setDescription("操作する値").setMinValue(1).setRequired(true),
      );
  }
}

export default MoneySubCommand;
