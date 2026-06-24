import {
  Client,
  InteractionResponse,
  Colors,
  SlashCommandSubcommandBuilder,
  MessageFlags,
} from "discord.js";
import { SubCommand, ValidSubCommandInteraction } from "@/@types/Util";
import CommandUtils from "@/util/CommandUtils";
import config from "@/config";
import { prisma } from "@takasumibot-v4/db";
import CompanyMoney from "@/util/CompanyMoney";
import Money from "@/util/Money";

class CompanySubCommand implements SubCommand {
  public readonly client: Client;

  public readonly name: string = "company";
  public readonly description: string = "会社を削除します";
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

    const id = interaction.options.getString("id", true);

    const companyData = await prisma.company.findUnique({
      where: {
        id: id,
      },
      include: {
        employees: true,
      },
    });

    if (!companyData)
      return await interaction.reply({
        embeds: [
          {
            color: Colors.Red,
            author: {
              name: "削除できませんでした",
              icon_url: config.image.errorIcon,
            },
            description: "存在しない会社です",
          },
        ],
        flags: MessageFlags.Ephemeral,
      });

    if (companyData.employees.length > 1)
      return await interaction.reply({
        embeds: [
          {
            color: Colors.Red,
            author: {
              name: "削除できませんでした",
              icon_url: config.image.errorIcon,
            },
            description: "まだ従業員が残っています",
          },
        ],
        flags: MessageFlags.Ephemeral,
      });

    return await prisma.$transaction(async (tx) => {
      if (companyData.assets > 0) {
        await CompanyMoney.delete(
          companyData.id,
          undefined,
          companyData.assets,
          "倒産時の資産処理",
          tx,
        );
        await Money.add(companyData.ownerId, companyData.assets, "倒産時の資産返還", tx);
      }

      await tx.employee.deleteMany({
        where: {
          companyId: companyData.id,
        },
      });

      await tx.product.deleteMany({
        where: {
          companyId: companyData.id,
        },
      });

      await tx.companyStatistics.delete({
        where: {
          companyId: companyData.id,
        },
      });

      await tx.company.delete({
        where: {
          id: companyData.id,
        },
      });

      await interaction.reply({
        embeds: [
          {
            color: Colors.Green,
            author: {
              name: `${companyData.name}(${companyData.id})を削除しました`,
              icon_url: config.image.successIcon,
            },
          },
        ],
      });
    });
  }

  public build(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) =>
        option.setName("id").setDescription("対象の会社ID").setRequired(true),
      );
  }
}

export default CompanySubCommand;
