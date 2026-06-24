import { Elysia, status, t } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { prisma } from "@/util/db";
import { env } from "@/util/Env";

const getAuth = new Elysia({ prefix: "/v3/auth/get" }).use(bearer()).get(
  "/:session",
  async ({ bearer, params: { session } }) => {
    if (!bearer || bearer !== env.API_PASSWORD) return status(401, { error: "Unauthorized" });

    if (!session) return { error: "Session is required" };

    const dbsession = await prisma.webauth.findUnique({
      where: {
        id: session,
      },
    });

    if (!dbsession) return status(404, { error: "Session not found" });

    if (dbsession.createdAt < new Date(Date.now() - 1000 * 60 * 5)) {
      await prisma.webauth.delete({
        where: {
          id: session,
        },
      });

      return status(400, { error: "Session expired" });
    }

    return dbsession;
  },
  {
    params: t.Object({
      session: t.String({
        description: "認証セッションID",
      }),
    }),
    detail: {
      description: "指定したセッションIDの認証情報を返します。Bearer認証が必要です。",
    },
  },
);

export default getAuth;
