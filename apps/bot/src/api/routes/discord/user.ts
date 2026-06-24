import { Elysia, status } from "elysia";
import { fetchAndCacheUser } from "@/util/getDiscordUser";
import { bearer } from "@elysiajs/bearer";
import { env } from "@/util/Env";

const user = new Elysia({ prefix: "/v3/discord/user" })
  .use(bearer())
  .get("/:id", async ({ bearer, params: { id } }) => {
    if (!bearer || bearer !== env.API_PASSWORD) return status(401, { error: "Unauthorized" });

    if (!id) return { error: "ID is required" };

    const userData = await fetchAndCacheUser(id);

    if (!userData) return { error: "User not found" };

    return userData;
  });

export default user;
