import { Client, BaseInteraction, InteractionResponse } from "discord.js";
import { InteractionCreateEvent } from "@/@types/Util";
import { prisma } from "@/util/db";

class CompanyInfoAutocompleteEvent implements InteractionCreateEvent {
  public readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public async execute(interaction: BaseInteraction): Promise<InteractionResponse<boolean> | void> {
    if (
      !interaction.isAutocomplete() ||
      interaction.commandName !== "company" ||
      interaction.options.getSubcommand() !== "info"
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
    });

    if (filter.length > 25) filter.length = 25;

    await interaction.respond(
      filter.map((company) => ({ name: `${company.name}: ${company.id}`, value: company.id })),
    );
  }
}

export default CompanyInfoAutocompleteEvent;
