import { Elysia, status, t } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { prisma } from "@/util/db";
import { env } from "@/util/Env";

const checkSubs = new Elysia({ prefix: "/v3/auth/checksubs" }).use(bearer()).get(
  "/:id",
  async ({ bearer, params: { id } }) => {
    if (!bearer || bearer !== env.API_PASSWORD) return status(401, { error: "Unauthorized" });

    if (!id) return { error: "ID is required" };

    const fingerprints = await prisma.userFingerprint.findUnique({
      where: {
        userId: id,
      },
    });

    if (!fingerprints) return { message: "No sub-accounts found" };

    const subAccs = await prisma.userFingerprint.findMany({
      where: {
        OR: [
          { fingerprint: fingerprints.fingerprint },
          { oldFingerprint: fingerprints.fingerprint },
        ],
        NOT: {
          userId: id,
        },
      },
    });

    if (subAccs.length === 0) return { message: "No sub-accounts found" };

    return status(403, { message: `${subAccs.length} sub-accounts detected` });
  },
  {
    params: t.Object({
      id: t.String({
        description: "DiscordユーザーID",
      }),
    }),
    detail: {
      description: "指定したユーザーIDのサブアカウントをチェックします。Bearer認証が必要です。",
    },
  },
);

export default checkSubs;
