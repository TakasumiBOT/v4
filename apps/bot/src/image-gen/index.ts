import { Elysia } from "elysia";
import { botEnv as env } from "@takasumibot-v4/env/bot";
import Log from "@/util/Log";
import { levelBodySchema } from "@/image-gen/schemas/level";
import { RankCardBuilder } from "@/image-gen/components/rankCard";

const app = new Elysia()

  .post(
    "/v1/generate/level",
    async ({ body }) => {
      const builder = new RankCardBuilder()
        .setAvatar(body.avatar)
        .setServerIcon(body.serverIcon)
        .setUsername(body.username)
        .setLevel(body.level)
        .setCurrentXp(body.currentXp)
        .setNextLevelXp(body.nextLevelXp)
        .setBackground(body.background);

      return await builder.build({ format: "png" });
    },
    {
      body: levelBodySchema,
    },
  );

const startApi = async () => {
  const port = env.API_PORT;

  if (!port) return Log.error("サーバーポートが設定されていません");

  app.listen(port);

  Log.info(`${port}番ポートで画像生成APIサーバーを起動しました`);
};

startApi();

export type App = typeof app;
