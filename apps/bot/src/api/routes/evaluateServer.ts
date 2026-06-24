import { Elysia, t, status } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { evaluateServerRisk } from "@/util/EvaluateServer";
import { botEnv as env } from "@takasumibot-v4/env/bot";
export const evaluateServer = new Elysia({ prefix: "/v3/evaluateServer" }).use(bearer()).get(
  "/",
  async ({ bearer, query: { name, description } }) => {
    if (!bearer || bearer !== env.API_PASSWORD) {
      return status(401, { error: "Unauthorized" });
    }

    if (!name || !description) {
      return status(400, { error: "Name and description are required" });
    }

    const result = await evaluateServerRisk({ name, description });

    return result;
  },
  {
    query: t.Object({
      name: t.String({
        description: "Server name",
      }),
      description: t.String({
        description: "Server description",
      }),
    }),
  },
);

export default evaluateServer;
