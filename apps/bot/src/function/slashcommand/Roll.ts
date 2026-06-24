import {
  Client,
  RepliableInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  InteractionResponse,
  Colors,
  MessageFlags,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { Command, CommandType, RollItem } from "@/@types/Util";
import CommandUtils from "@/util/CommandUtils";
import rollItems from "@/static/rollItems.json";
import config from "@/config";
import Report from "@/util/Report";
import { relative } from "path";
import Money from "@/util/Money";
import connectImage from "@/util/connectImage";
import { prisma } from "@/util/db";
import { generateRollResult, addRollItemsToInventory } from "@/util/generateRollResult";

class RollCommand implements Command {
  public readonly client: Client;

  public readonly type: CommandType = "money";
  public readonly name: string = "roll";
  public readonly description: string = "ガチャを回します";
  public readonly example: string[] = ["/roll"];
  public readonly note: string = `ガチャを回すには${config.economy.rollPrice}コイン必要です\n一回に3個排出します`;

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

    if (accountData.assets < config.economy.rollPrice)
      return await interaction.reply({
        embeds: [
          {
            color: Colors.Red,
            author: {
              name: "ガチャを回せませんでした",
              icon_url: config.image.errorIcon,
            },
            description: `ガチャを回すには${config.economy.rollPrice}コイン必要です`,
          },
        ],
        flags: MessageFlags.Ephemeral,
      });

    const results = generateRollResult(rollItems);

    await interaction.deferReply();
    try {
      const items = results.filter((item) => item != undefined);

      const image = await connectImage(items.map((item) => item.imageUrl));

      return await prisma.$transaction(async (tx) => {
        await Money.delete(interaction.user.id, config.economy.rollPrice, "ガチャの料金", tx);
        await addRollItemsToInventory(interaction.user.id, items, tx);

        await interaction.editReply({
          embeds: [
            {
              color: Colors.Green,
              author: {
                name: "ガチャを回しました",
                icon_url: config.image.successIcon,
              },
              image: {
                url: "attachment://roll.png",
              },
              footer: {
                text: "Webで10連、100連ガチャをすることができます",
              },
            },
          ],
          files: [new AttachmentBuilder(image).setName("roll.png")],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Webでガチャをする")
                .setURL("https://money.takasumibot.com/games/gacha")
                .setStyle(ButtonStyle.Link),
            ),
          ],
        });
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
              name: "ガチャを回せませんでした",
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

  public build(): SlashCommandOptionsOnlyBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description);
  }
}

export default RollCommand;
