import { Elysia, status } from "elysia";
import { prisma } from "@takasumibot-v4/db";
import config from "@/config";
import getEventStatus from "@/util/getEventStatus";
import { EventType } from "@takasumibot-v4/db";

const statistics = new Elysia({ prefix: "/v3/statistics" }).get(
  "/",
  async () => {
    const userTotal = await prisma.userStatistics.aggregate({
      _sum: {
        totalEarn: true,
        totalUse: true,
        totalTax: true,
        totalWork: true,
        totalCommand: true,
      },
    });

    const companyTotal = await prisma.companyStatistics.aggregate({
      _sum: {
        totalEarn: true,
        totalUse: true,
        totalTax: true,
      },
    });

    const economy = await prisma.economy.findUnique({
      where: {
        clientId: config.clientId,
      },
    });

    if (!economy) return status(404, { error: "EconomyData not found" });

    return {
      user: {
        totalEarn: userTotal._sum.totalEarn || 0,
        totalUse: userTotal._sum.totalUse || 0,
        totalTax: userTotal._sum.totalTax || 0,
        totalWork: userTotal._sum.totalWork || 0,
        totalCommand: userTotal._sum.totalCommand || 0,
      },
      company: {
        totalEarn: companyTotal._sum.totalEarn || 0,
        totalUse: companyTotal._sum.totalUse || 0,
        totalTax: companyTotal._sum.totalTax || 0,
      },
      economy: {
        treasury: economy.treasury,
        debt: economy.debt,
      },
      event: {
        total: await getEventStatus("total"),
        totalOnlyUser: await getEventStatus("totalOnlyUser"),
        messageCreate: {
          oneDay: await getEventStatus("oneDay", EventType.messageCreate),
          difference: await getEventStatus("difference", EventType.messageCreate),
          oneDayOnlyUser: await getEventStatus("oneDayOnlyUser", EventType.messageCreate),
          differenceOnlyUser: await getEventStatus("differenceOnlyUser", EventType.messageCreate),
        },
        interactionCreate: {
          oneDay: await getEventStatus("oneDay", EventType.interactionCreate),
          difference: await getEventStatus("difference", EventType.interactionCreate),
          oneDayOnlyUser: await getEventStatus("oneDayOnlyUser", EventType.interactionCreate),
          differenceOnlyUser: await getEventStatus(
            "differenceOnlyUser",
            EventType.interactionCreate,
          ),
        },
        guildMemberAdd: {
          oneDay: await getEventStatus("oneDay", EventType.guildMemberAdd),
          difference: await getEventStatus("difference", EventType.guildMemberAdd),
        },
        guildMemberRemove: {
          oneDay: await getEventStatus("oneDay", EventType.guildMemberRemove),
          difference: await getEventStatus("difference", EventType.guildMemberRemove),
        },
        guildCreate: {
          oneDay: await getEventStatus("oneDay", EventType.guildCreate),
          difference: await getEventStatus("difference", EventType.guildCreate),
        },
        guildDelete: {
          oneDay: await getEventStatus("oneDay", EventType.guildDelete),
          difference: await getEventStatus("difference", EventType.guildDelete),
        },
      },
    };
  },
  {
    detail: {
      description: "統計情報を返します。パラメータは不要です。",
    },
  },
);

export default statistics;
