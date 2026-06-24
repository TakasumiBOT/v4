import { EventType } from "@takasumibot-v4/db";
import { prisma } from "@takasumibot-v4/db";

type EventStatusType =
  | "total"
  | "oneDay"
  | "difference"
  | "totalOnlyUser"
  | "oneDayOnlyUser"
  | "differenceOnlyUser";

const getEventStatus = async (type: EventStatusType, eventType?: EventType): Promise<number> => {
  if (type === "total") {
    const totalData = await prisma.eventStatistics.aggregate({
      where: {
        event: eventType,
      },
      _sum: {
        userCount: true,
        botCount: true,
      },
    });

    return (totalData._sum.userCount || 0) + (totalData._sum.botCount || 0);
  }

  if (type === "totalOnlyUser") {
    const totalData = await prisma.eventStatistics.aggregate({
      where: {
        event: eventType,
      },
      _sum: {
        userCount: true,
      },
    });

    return totalData._sum.userCount || 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (type === "oneDay") {
    const eventData = await prisma.eventStatistics.findFirst({
      where: {
        event: eventType,
        aggregatedAt: today,
      },
    });

    return eventData ? eventData.userCount + eventData.botCount : 0;
  }

  if (type === "oneDayOnlyUser") {
    const eventData = await prisma.eventStatistics.findFirst({
      where: {
        event: eventType,
        aggregatedAt: today,
      },
    });

    return eventData ? eventData.userCount : 0;
  }

  if (type === "difference") {
    const todayEventData = await prisma.eventStatistics.findFirst({
      where: {
        event: eventType,
        aggregatedAt: today,
      },
    });

    const yesterdayEventData = await prisma.eventStatistics.findFirst({
      where: {
        event: eventType,
        aggregatedAt: yesterday,
      },
    });

    return (
      (todayEventData ? todayEventData.userCount + todayEventData.botCount : 0) -
      (yesterdayEventData ? yesterdayEventData.userCount + yesterdayEventData.botCount : 0)
    );
  }

  if (type === "differenceOnlyUser") {
    const todayEventData = await prisma.eventStatistics.findFirst({
      where: {
        event: eventType,
        aggregatedAt: today,
      },
    });

    const yesterdayEventData = await prisma.eventStatistics.findFirst({
      where: {
        event: eventType,
        aggregatedAt: yesterday,
      },
    });

    return (
      (todayEventData ? todayEventData.userCount : 0) -
      (yesterdayEventData ? yesterdayEventData.userCount : 0)
    );
  }

  return 1;
};

export default getEventStatus;
