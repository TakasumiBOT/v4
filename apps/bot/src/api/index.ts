import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import Log from "@/util/Log";
import getAuth from "@/routes/auth/get";
import updateAuth from "@/routes/auth/update";
import checkIP from "@/routes/auth/checkip";
import fingerptinting from "@/routes/auth/fingerprint";
import isAdmin from "@/routes/auth/isAdmin";
import checkSubs from "@/routes/auth/checkSubAccs";
import guildBoard from "@/routes/guildBoard";
import statusInfo from "@/routes/status";
import shard from "@/routes/shard";
import statistics from "@/routes/statistics";
import alteration from "@/routes/admin/alteration";
import pushNotifications from "@/routes/pushNotifications";
import realtime from "@/routes/realtime";
import { botEnv as env } from "@takasumibot-v4/env/bot";

const app = new Elysia();

app.use(
  openapi({
    path: "/docs",
    documentation: {
      info: {
        title: "TakasumiBOT API",
        version: "3.0.0-beta",
        description: "TakasumiBOTの公開API",
      },
    },
    exclude: {
      paths: [
        "/",
        "/v3/guildBoard/",
        "/v3/discord/user/:id",
        "/v3/discord/guild/:id",
        "/v3/auth/get/:session",
        "/v3/auth/checkip/:ip",
        "/v3/auth/checksubs/:id",
        "/v3/auth/isAdmin/",
        "/v3/account/:id",
        "/v3/assets/",
        "/v3/notifications/:userId",
        "/v3/notifications/:userId/register",
      ],
      methods: ["POST", "OPTIONS", "PATCH", "DELETE"],
    },
    scalar: {
      favicon: "https://cdn.takasumibot.com/images/bot.png",
      metaData: {
        title: "TakasumiBOT API",
        description: "TakasumiBOTの公開API",
        ogDescription: "TakasumiBOTの公開API",
        ogTitle: "TakasumiBOT API",
        ogImage: "https://cdn.takasumibot.com/images/APIOG.png",
        twitterCard: "summary_large_image",
      },
    },
  }),
);

app.use(getAuth);
app.use(updateAuth);
app.use(checkIP);
app.use(fingerptinting);
app.use(isAdmin);
app.use(checkSubs);
app.use(shard);
app.use(statusInfo);
app.use(guildBoard);
app.use(statistics);
app.use(alteration);
app.use(pushNotifications);
app.use(realtime);

app.use(
  cors({
    origin: [/.*\.takasumibot.com$/, /localhost(:[0-9]{1,5})?/],
  }),
);

app.get("/", ({ redirect }) => {
  return redirect("/docs", 302);
});

const startApi = async () => {
  const port = env.API_PORT;

  if (!port) return Log.error("サーバーポートが設定されていません");

  app.listen(port);

  Log.info(`${port}番ポートでAPIサーバーを起動しました`);
};

startApi();
