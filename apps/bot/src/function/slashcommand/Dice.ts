import {
  Client,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  InteractionResponse,
  Colors,
  RepliableInteraction,
  MessageFlags,
} from "discord.js";
import { Command, CommandType } from "@/@types/Util";
import config from "@/config";
import CommandUtils from "@/util/CommandUtils";
import AntiCheat from "@/util/AntiCheat";
import { prisma } from "@/util/db";

class DiceCommand implements Command {
  public readonly client: Client;

  public readonly type: CommandType = "money";
  public readonly name: string = "dice";
  public readonly description: string = "数字をそろえるゲームをします";
  public readonly example: string[] = ["/dice 100"];

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

    const chip = interaction.options.getInteger("chip", true);

    const accountData = await prisma.account.findUnique({
      where: {
        userId: interaction.user.id,
      },
    });

    if (!accountData)
      return await interaction.reply({
        embeds: [
          {
            color: Colors.Red,
            author: {
              name: "アカウントが存在しません",
              icon_url: config.image.errorIcon,
            },
            description: "`/account register`で登録してください",
          },
        ],
        flags: MessageFlags.Ephemeral,
      });

    if (await AntiCheat.isCheckingHuman(interaction)) return;

    if (await AntiCheat.checkAutomation(this.name, interaction.user.id))
      return AntiCheat.checkHuman(interaction);

    if (accountData.chip < Math.round(chip * config.economy.diceLoseRate))
      return await interaction.reply({
        embeds: [
          {
            color: Colors.Red,
            author: {
              name: "実行できませんでした",
              icon_url: config.image.errorIcon,
            },
            description: "所持金が不足しています",
          },
        ],
        flags: MessageFlags.Ephemeral,
      });

    const numbers = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));
    const count: { [key: number]: number } = {};

    numbers.forEach((num) => {
      count[num] = (count[num] || 0) + 1;
    });

    const duplicate = Object.values(count).filter((count) => count > 1)[0] || 0;

    if (duplicate === 0) {
      const fineChip = Math.round(chip * config.economy.diceLoseRate);

      await prisma.account.update({
        where: { userId: interaction.user.id },
        data: {
          chip: {
            decrement: fineChip,
          },
        },
      });

      await interaction.reply({
        embeds: [
          {
            color: Colors.Red,
            author: {
              name: `1つも重複しませんでした`,
              icon_url: config.image.errorIcon,
            },
            description: `**${numbers.join(" ")}**\n失ったチップ: ${fineChip}チップ\n所持チップ: ${accountData.chip - fineChip}チップ`,
          },
        ],
      });
    } else if (duplicate === 2) {
      const rewardChip = Math.round(chip * config.economy.diceTwoRate);

      await prisma.account.update({
        where: { userId: interaction.user.id },
        data: {
          chip: {
            increment: rewardChip,
          },
        },
      });

      await interaction.reply({
        embeds: [
          {
            color: Colors.Green,
            author: {
              name: `2つ重複しました`,
              icon_url: config.image.successIcon,
            },
            description: `**${numbers.join(" ")}**\n獲得したチップ: ${rewardChip}チップ\n所持チップ: ${accountData.chip + rewardChip}チップ`,
          },
        ],
      });
    } else if (duplicate === 3) {
      const rewardChip = Math.round(chip * config.economy.diceThreeRate);

      await prisma.account.update({
        where: { userId: interaction.user.id },
        data: {
          chip: {
            increment: rewardChip,
          },
        },
      });

      await interaction.reply({
        embeds: [
          {
            color: Colors.Green,
            author: {
              name: `3つ重複しました`,
              icon_url: config.image.successIcon,
            },
            description: `**${numbers.join(" ")}**\n獲得したチップ: ${rewardChip}チップ\n所持チップ: ${accountData.chip + rewardChip}チップ`,
          },
        ],
      });
    } else {
      const rewardChip = Math.round(chip * config.economy.diceFourRate);

      await prisma.account.update({
        where: { userId: interaction.user.id },
        data: {
          chip: {
            increment: rewardChip,
          },
        },
      });

      await interaction.reply({
        embeds: [
          {
            color: Colors.Green,
            author: {
              name: `4つ重複しました`,
              icon_url: config.image.successIcon,
            },
            description: `**${numbers.join(" ")}**\n獲得したチップ: ${rewardChip}チップ\n所持チップ: ${accountData.chip + rewardChip}チップ`,
          },
        ],
      });
    }
  }

  public build(): SlashCommandOptionsOnlyBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addIntegerOption((option) =>
        option
          .setName("chip")
          .setDescription("賭けるチップ")
          .setMinValue(10)
          .setMaxValue(config.economy.maxGuessChip)
          .setRequired(true),
      );
  }
}

export default DiceCommand;
