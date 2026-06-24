import { Elysia, t, status } from "elysia";
import { JobCategory } from "@/generated/prisma/enums";
import { bearer } from "@elysiajs/bearer";
import { prisma } from "@takasumibot-v4/db";
import { botEnv as env } from "@takasumibot-v4/env/bot";

const alteration = new Elysia({ prefix: "/v3/admin/alteration" })
  .use(bearer())
  .patch(
    "/:userId",
    async ({ bearer, query, params: { userId } }) => {
      if (!bearer || bearer !== env.API_PASSWORD) return status(401, { error: "Unauthorized" });

      const { banned, bannedReason, ...data } = query;

      if (banned) {
        if (!bannedReason) return status(400, { error: "Ban reason is required" });
        await prisma.muteUser.upsert({
          where: { userId },
          create: { userId, reason: bannedReason },
          update: { reason: bannedReason },
        });
      } else if (banned === false) {
        await prisma.muteUser.deleteMany({ where: { userId } });
      }

      if (Object.keys(data).length === 0) return { success: true };

      try {
        return await prisma.account.update({
          where: { userId },
          data,
        });
      } catch {
        return status(404, { error: "User not found" });
      }
    },
    {
      params: t.Object({
        userId: t.String(),
      }),
      query: t.Object({
        assets: t.Optional(t.Numeric()),
        chip: t.Optional(t.Numeric()),
        creditPoint: t.Optional(t.Numeric()),
        talentScore: t.Optional(t.Numeric()),
        skillScore: t.Optional(t.Numeric()),
        deposit: t.Optional(t.Numeric()),
        debt: t.Optional(t.Numeric()),
        banned: t.Optional(t.Boolean()),
        bannedReason: t.Optional(t.String()),
      }),
    },
  )
  .patch(
    "/businesses/:companyId",
    async ({ bearer, query, params: { companyId } }) => {
      if (!bearer || bearer !== env.API_PASSWORD) return status(401, { error: "Unauthorized" });

      const { delete: deleteCompany, ...data } = query;

      if (deleteCompany) {
        try {
          await prisma.company.delete({
            where: { id: companyId },
          });
          return { success: true };
        } catch {
          return status(404, { error: "Company not found" });
        }
      }

      if (Object.keys(data).length === 0) return { success: true };

      try {
        return await prisma.company.update({
          where: { id: companyId },
          data,
        });
      } catch {
        return status(404, { error: "Company not found" });
      }
    },
    {
      params: t.Object({
        companyId: t.String(),
      }),
      query: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.String()),
        assets: t.Optional(t.Numeric()),
        salary: t.Optional(t.Numeric()),
        delete: t.Optional(t.Boolean()),
      }),
    },
  );

export default alteration;
