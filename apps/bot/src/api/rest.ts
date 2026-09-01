import { REST } from "@discordjs/rest";
import { Routes, APIGuildMember } from "discord-api-types/v10";
import Log from "@/util/Log";
import { botEnv as env } from "@takasumibot-v4/env/bot";

const rest = new REST().setToken(env.BOT_TOKEN);

export const giveRole = async (userId: string, roleId: string, guildId: string): Promise<void> => {
  try {
    const member = (await rest.get(Routes.guildMember(guildId, userId))) as APIGuildMember;

    if (member) {
      await rest.put(Routes.guildMemberRole(guildId, userId, roleId));
    } else {
      Log.error(`ユーザーIDが${userId}のユーザーはギルドIDが${guildId}のサーバーに存在しません`);
    }
  } catch (error) {
    Log.error(`giveRoleエラー: ${error}`);
    throw error;
  }
};

export { rest };
