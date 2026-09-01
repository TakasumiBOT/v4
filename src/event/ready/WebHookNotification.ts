import { Client } from "discord.js";
import { ReadyEvent } from "@/@types/Util";
import { env } from "@/util/Env";
import config from "@/config";

class WebHookNotification implements ReadyEvent {
  public readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public async execute(): Promise<void> {
    return;
    try {
      await fetch(env.STATUS_WEBHOOK, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: `-# :white_check_mark: シャード${env.SHARDS} が起動しました`,
          username: "TakasumiBOT Status Notification",
          avatar_url: config.image.botIcon,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  }
}

export default WebHookNotification;
