import { env } from "./util/Env";

const config = {
  clientId: "981314695543783484",
  inviteUrl: "https://discord.gg/NEesRdGQwD",
  termsUrl: "https://www.takasumibot.com/terms",
  announce: {
    guildId: "987698915820335124",
    channels: {
      noticeId: "1049155527214628954",
      updateId: "1106533820498452500",
    },
  },
  report: {
    guildId: "987698915820335124",
    channelId: "1251803129041653760",
  },
  bot: {
    disboardId: "302050872383242240",
    dissokuId: "761562078095867916",
    takasumibotId: "966967227339395082",
  },
  api: {
    miqUrl: "https://miq.takasumibot.com",
    choyenUrl: "https://5000.takasumibot.com",
    webauthUrl: "https://auth.takasumibot.com",
    moneyAppUrl: "https://money.takasumibot.com",
  },
  image: {
    successIcon: "https://cdn.takasumibot.com/images/system/success.png",
    errorIcon: "https://cdn.takasumibot.com/images/system/error.png",
    warnIcon: "https://cdn.takasumibot.com/images/system/warn.png",
    configIcon: "https://cdn.takasumibot.com/images/system/config.png",
    translateIcon: "https://cdn.takasumibot.com/images/translate.png",
    hiroyukiIcon: "https://cdn.takasumibot.com/images/hiroyuki.png",
    koizumiIcon: "https://cdn.takasumibot.com/images/koizumi.png",
    kinnikunIcon: "https://cdn.takasumibot.com/images/kinnikun.png",
    kisidaIcon: "https://cdn.takasumibot.com/images/kisida.png",
    tigyuuIcon: "https://cdn.takasumibot.com/images/tigyuu.png",
    botIcon: "https://cdn.takasumibot.com/images/icon.png",
    npmIcon: "https://cdn.takasumibot.com/images/npm.png",
    pypiIcon: "https://cdn.takasumibot.com/images/pypi.png",
    guidelineIcon: "https://cdn.takasumibot.com/images/system/guideline.png",
    upGif: "https://cdn.takasumibot.com/images/up.gif",
  },
  level: {
    cardBackgroundsUrl: "https://level-card-backgrounds.pages.dev",
    score: {
      min: 6,
      max: 12,
      percent: 50,
    },
    cooltime: {
      min: 15,
      max: 30,
      percent: 75,
    },
    bonus: {
      min: 20,
      max: 60,
      length: 40,
      percent: 30,
    },
    minLength: 3,
  },
  isDebug: false,
  shardCount: parseInt(env.SHARD_COUNT),
  cacheLimit: 5000,
  anticheat: {
    automationThreshold: 1000,
  },
};

export default config;
