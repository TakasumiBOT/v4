import { Elysia } from "elysia";
import { prisma } from "@takasumibot-v4/db";

const statusInfo = new Elysia({ prefix: "/v3/status" }).get(
  "/",
  async () => {
    const systemLog = await prisma.systemLog.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return systemLog;
  },
  {
    detail: {
      description: "システムログ情報を返します。パラメータは不要です。",
    },
  },
);

export default statusInfo;
