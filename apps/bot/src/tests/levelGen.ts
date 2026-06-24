import { treaty } from "@elysiajs/eden";
import type { App } from "@/image-gen";

const imageGen = treaty<App>("http://localhost:3000");

async function generateLevelCard() {
  const { data, error } = await imageGen.v1.generate.level.post({
    avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
    serverIcon: "https://cdn.discordapp.com/embed/avatars/1.png",
    username: "TestUser",
    level: 10,
    currentXp: 500,
    nextLevelXp: 1000,
    background: "https://level-card-backgrounds.pages.dev/default.png",
  });

  if (error) {
    console.error("Error:", error);
    process.exit(1);
  }

  if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    await Bun.write("level-card-output.png", new Uint8Array(data as ArrayBuffer));
    console.log("Level card saved to level-card-output.png");
  } else if (typeof data === "string") {
    const buffer = Buffer.from(data, "base64");
    await Bun.write("level-card-output.png", buffer);
    console.log("Level card saved to level-card-output.png");
  } else {
    console.error("Unexpected response type:", typeof data);
    process.exit(1);
  }
}

generateLevelCard().catch((err) => {
  console.error(err);
  process.exit(1);
});
