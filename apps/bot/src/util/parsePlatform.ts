import { Presence } from "discord.js";

const parsePlatform = (presence: Presence): string | null => {
  if (presence?.clientStatus?.web) {
    return "🌐ウェブ";
  } else if (presence?.clientStatus?.mobile) {
    return "📱モバイル";
  } else if (presence?.clientStatus?.desktop) {
    return "🖥️デスクトップ";
  } else {
    return null;
  }
};

export default parsePlatform;
