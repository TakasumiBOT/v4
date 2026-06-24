import { Elysia, status, t } from "elysia";
import { bearer } from "@elysiajs/bearer";
import Mute from "@/util/Mute";
import { botEnv as env } from "@takasumibot-v4/env/bot";

const isBanned = new Elysia({ prefix: "/v3/isBanned" }).use(bearer()).get(
  "/:id",
  async ({ bearer, params: { id } }) => {
    if (!bearer || bearer !== env.API_PASSWORD) return status(401, { error: "Unauthorized" });
    if (!id) return status(400, { error: "ID is required" });

    const muteUser = (await Mute.getUser(id)) ?? {};

    return muteUser;
  },
  {
    params: t.Object({
      id: t.String({
        description: "DiscordユーザーID",
      }),
    }),
    detail: {
      description: "指定したユーザーIDのBAN情報を返します",
    },
  },
);

export default isBanned;
