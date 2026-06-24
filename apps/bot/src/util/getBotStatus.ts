import { prisma } from "@/util/db";

type BotStatusType =
  | "totalCmd"
  | "oneDayCmd"
  | "differenceCmd"
  | "totalTakasumiAccount"
  | "oneDayGuildCount"
  | "oneDayUserCount"
  | "differenceGuildCount"
  | "differenceUserCount";

const getBotStatus = async (type: BotStatusType): Promise<number> => {
  if (type === "totalCmd") {
    return await prisma.commandHistory.count();
  }

  if (type === "oneDayCmd") {
    return await prisma.commandHistory.count({
      where: {
        executedAt: {
          gte: new Date(Date.now() - 86400000),
          lte: new Date(),
        },
      },
    });
  }

  if (type === "differenceCmd") {
    const h24 = await prisma.commandHistory.count({
      where: {
        executedAt: {
          gte: new Date(Date.now() - 86400000),
          lte: new Date(),
        },
      },
    });

    const h48 = await prisma.commandHistory.count({
      where: {
        executedAt: {
          gte: new Date(Date.now() - 2 * 86400000),
          lte: new Date(Date.now() - 86400000),
        },
      },
    });

    return h24 - h48;
  }

  if (type === "totalTakasumiAccount") {
    return await prisma.account.count();
  }

  if (type === "oneDayGuildCount") {
    const latest = await prisma.systemLog.findFirst({
      orderBy: {
        loggedAt: "desc",
      },
    });

    const h24 = await prisma.systemLog.findFirst({
      where: {
        loggedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        loggedAt: "asc",
      },
    });

    return (latest?.totalGuild ?? 0) - (h24?.totalGuild ?? 0);
  }

  if (type === "oneDayUserCount") {
    const latest = await prisma.systemLog.findFirst({
      orderBy: {
        loggedAt: "desc",
      },
    });

    const h24 = await prisma.systemLog.findFirst({
      where: {
        loggedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        loggedAt: "asc",
      },
    });

    return (latest?.totalUser ?? 0) - (h24?.totalUser ?? 0);
  }

  if (type === "differenceGuildCount") {
    const latest = await prisma.systemLog.findFirst({
      orderBy: {
        loggedAt: "desc",
      },
    });

    const h24 = await prisma.systemLog.findFirst({
      where: {
        loggedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        loggedAt: "asc",
      },
    });

    const h48 = await prisma.systemLog.findFirst({
      where: {
        loggedAt: {
          gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        loggedAt: "asc",
      },
    });

    return (
      (latest?.totalGuild ?? 0) -
      (h24?.totalGuild ?? 0) -
      ((h24?.totalGuild ?? 0) - (h48?.totalGuild ?? 0))
    );
  }

  if (type === "differenceUserCount") {
    const latest = await prisma.systemLog.findFirst({
      orderBy: {
        loggedAt: "desc",
      },
    });

    const h24 = await prisma.systemLog.findFirst({
      where: {
        loggedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        loggedAt: "asc",
      },
    });

    const h48 = await prisma.systemLog.findFirst({
      where: {
        loggedAt: {
          gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        loggedAt: "asc",
      },
    });

    return (
      (latest?.totalUser ?? 0) -
      (h24?.totalUser ?? 0) -
      ((h24?.totalUser ?? 0) - (h48?.totalUser ?? 0))
    );
  }

  return 1;
};

export default getBotStatus;
