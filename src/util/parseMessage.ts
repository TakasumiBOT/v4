import config from "@/config";

const parseMessage = (content: string): string => {
  return content.replace(
    /(?:https?:\/\/)?(?:discord\.(?:gg|io|me|li)|(?:discord|discordapp)\.com\/invite)\/(\w+)/g,
    `[[招待リンク]](${config.inviteUrl})`,
  );
};

export default parseMessage;
