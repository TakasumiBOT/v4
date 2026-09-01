import {
  Client,
  Message,
  Colors,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import { MessageCreateEvent } from "@/@types/Util";
import Fetch from "@/util/Fetch";
import RateLimit from "@/util/RateLimit";
import { prisma } from "@/util/db";

class ExpandEvent implements MessageCreateEvent {
  public readonly client: Client;
  private readonly rateLimit: RateLimit = new RateLimit(800, true);

  constructor(client: Client) {
    this.client = client;
  }

  public async execute(message: Message): Promise<Message | void> {
    if (
      message.author.bot ||
      !message.inGuild() ||
      !message.guild.members.me ||
      !message.guild.members.me
        .permissionsIn(message.channel)
        .has(PermissionFlagsBits.ViewChannel) ||
      !message.guild.members.me.permissionsIn(message.channel).has(PermissionFlagsBits.SendMessages)
    )
      return;

    // const link = message.content.match(/\d{17,19}/g);
    // if(link){
    //   if(this.rateLimit.count(message.channel.id)) return;

    //   const guild = await Fetch.guild(message.client,link[0]);
    //   if(!guild) return;

    //   const channel = await Fetch.channel(guild,link[1]);
    //   if(
    //     !channel||
    //     !channel.isTextBased()
    //   ) return;

    //   const msg = await Fetch.message(channel,link[2]);
    //   if(!msg) return;

    //   const expandIgnoreData = await prisma.expandIgnore.findUnique({
    //     where:{
    //       guildId: message.guild.id
    //     }
    //   });

    //   if(expandIgnoreData) return;

    //   const embeds = [
    //     new EmbedBuilder()
    //       .setColor(Colors.Green)
    //       .setAuthor({
    //         name: msg.author?.displayName ? `${msg.author.displayName}(${msg.author.username})` : `${msg.author.username}`,
    //         iconURL: msg.author.avatarURL()||msg.author.defaultAvatarURL,
    //       })
    //       .setDescription(msg.content)
    //       .setFooter({
    //         text: `${guild.name} #${channel.name}`,
    //         iconURL: guild.iconURL()||"https://cdn.discordapp.com/embed/avatars/0.png"
    //       })
    //       .setTimestamp(new Date())
    //   ];

    //   if(msg.embeds[0]){
    //     embeds.push(EmbedBuilder.from(msg.embeds[0]));
    //   }

    //   const attachment = msg.attachments.first();
    //   if(attachment){
    //     if(attachment.height&&attachment.width){
    //       embeds[0].setImage(attachment.url);
    //     }else{
    //       embeds[0].addFields([{
    //         name: "添付ファイル",
    //         value: `[${attachment.name}](${attachment.url})`
    //       }]);
    //     }
    //   }

    //   await message.channel.send({
    //     embeds: embeds
    //   }).catch(()=>{});
    // }
  }
}

export default ExpandEvent;
