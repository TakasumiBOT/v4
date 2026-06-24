import { Client, BaseInteraction, InteractionResponse } from "discord.js";
import { InteractionCreateEvent } from "@/@types/Util";
import { prisma } from "@/util/db";

class ProductListAutocompleteEvent implements InteractionCreateEvent {
  public readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public async execute(interaction: BaseInteraction): Promise<InteractionResponse<boolean> | void> {
    if (
      !interaction.isAutocomplete() ||
      interaction.commandName !== "product" ||
      interaction.options.getSubcommand() !== "list"
    )
      return;

    const focus = interaction.options.getFocused();

    const filter = await prisma.company.findMany({
      where: {
        name: {
          contains: focus,
          mode: "insensitive",
        },
      },
      include: {
        products: true,
      },
    });

    if (filter.length > 25) filter.length = 25;

    await interaction.respond(
      filter
        .filter((company) => company.products.length > 0)
        .map((company) => ({ name: `${company.name}: ${company.id}`, value: company.id })),
    );
  }
}

export default ProductListAutocompleteEvent;
