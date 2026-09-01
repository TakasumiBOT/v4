import { Elysia, t } from "elysia";
import Redis from "ioredis";
import { shardRedis } from "@/util/redis";
import Log from "@/util/Log";

const realtime = new Elysia({ prefix: "/v3/realtime" }).ws("/", {
  query: t.Object({
    userId: t.String(),
  }),
  async open(ws) {
    const userId = ws.data.query.userId;

    if (!userId) {
      ws.close();
      return;
    }

    const subscriber = shardRedis.duplicate();
    const channel = `updates:${userId}`;

    subscriber.on("message", (ch, message) => {
      if (ch === channel) {
        try {
          ws.send(message);
        } catch (error) {
          Log.error(`Failed to send message to WebSocket client: ${error}`);
        }
      }
    });

    subscriber.on("error", (err) => {
      Log.error(`Redis subscriber error for ${channel}: ${err}`);
    });

    try {
      await subscriber.subscribe(channel);
      Log.info(`WebSocket client subscribed to ${channel}`);
    } catch (err) {
      Log.error(`Failed to subscribe to ${channel}: ${err}`);
      subscriber.disconnect();
      ws.close();
      return;
    }

    (ws as any).subscriber = subscriber;
  },
  close(ws) {
    const subscriber = (ws as any).subscriber as Redis | undefined;
    if (subscriber) {
      subscriber.unsubscribe();
      subscriber.disconnect();
      Log.info(`WebSocket client disconnected and unsubscribed`);
    }
  },
});

export default realtime;
