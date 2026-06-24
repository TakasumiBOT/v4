import { Elysia, status } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { prisma } from "@/util/db";
import { env } from "@/util/Env";

const fingerptinting = new Elysia({ prefix: "/v3/auth/fingerprint" })
  .use(bearer())
  .post("/:session", async ({ query, bearer, params: { session } }) => {
    if (!bearer || bearer !== env.API_PASSWORD) return status(401, { error: "Unauthorized" });

    if (!session) return { error: "Session is required" };

    if (!query.fp) return { error: "Fingerprint is required" };

    const dbsession = await prisma.webauth.findUnique({
      where: {
        id: session,
      },
    });

    if (!dbsession) return status(404, { error: "Session not found" });

    const record = await prisma.userFingerprint.findUnique({
      where: {
        userId: dbsession.userId,
      },
    });

    if (record) {
      if (record.oldFingerprint === "none" || record.fingerprint === query.fp) {
        await prisma.userFingerprint.update({
          where: {
            userId: dbsession.userId,
          },
          data: {
            fingerprint: query.fp,
          },
        });
      }

      if (record.oldFingerprint !== "none" && record.fingerprint !== query.fp) {
        await prisma.userFingerprint.update({
          where: {
            userId: dbsession.userId,
          },
          data: {
            oldFingerprint: record.fingerprint,
            fingerprint: query.fp,
          },
        });
      }
    } else {
      await prisma.userFingerprint.create({
        data: {
          userId: dbsession.userId,
          fingerprint: query.fp,
        },
      });
    }

    return { message: "Fingerprint updated" };
  });

export default fingerptinting;
