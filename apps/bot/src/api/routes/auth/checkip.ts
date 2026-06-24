import { Elysia, status, t } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { prisma } from "@/util/db";
import { env } from "@/util/Env";

const checkIP = new Elysia({ prefix: "/v3/auth/checkip" }).use(bearer()).get(
  "/:ip",
  async ({ bearer, params: { ip } }) => {
    if (!bearer || bearer !== env.API_PASSWORD) return status(401, { error: "Unauthorized" });

    if (!ip) return { error: "IP address is required" };

    const blacklist = await prisma.muteIp.findUnique({
      where: {
        address: ip,
      },
    });

    if (blacklist) return status(403, { message: "IP is blacklisted" });

    return { message: "IP is not blacklisted" };
  },
  {
    params: t.Object({
      ip: t.String({
        description: "チェックするIPアドレス",
      }),
    }),
    detail: {
      description:
        "指定したIPアドレスがブラックリストに登録されているかチェックします。Bearer認証が必要です。",
    },
  },
);

export default checkIP;
