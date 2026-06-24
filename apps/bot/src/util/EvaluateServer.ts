import { generateObject, gateway } from "ai";
import { z } from "zod";
import { prisma } from "@/util/db";
import { Guild } from "discord.js";

type ServerProps = {
  name: string;
  description: string;
};

type Result = {
  risk: number;
  reason: string;
};

export async function evaluateServerRisk(props: ServerProps): Promise<Result> {
  const prompt = `You are an expert Content Safety Moderator for a public Discord server directory. Your job is to analyze a Discord server's Name and Description to calculate a "Risk Score" (0-100).
  **Risk Criteria:**
  - **0-20 (Safe):** Standard gaming, social, art, or community servers. Friendly or neutral tone.
  - **21-50 (Low Risk):** Mild profanity, "edgy" humor, or mature themes (non-pornographic).
  - **51-80 (Suspicious/Grey Market):**
      - Selling game accounts (e.g., Valorant, Fortnite), ingame currency, or social media followers.
      - "Invite for Rewards" schemes (J4J).
      - Cheats, hacks, scripts, or "methods."
      - Ambiguous dating servers (18+ dating but not explicitly pornographic).
  - **81-100 (Unsafe/Black Market - PROHIBITED):**
      - NSFW content (Pornography, Hentai, Nudes).
      - Gore or extreme violence.
      - Illegal goods (Drugs, carding, stolen data).
      - Hate speech or harassment.

  **Input Data:**
  Server Name: ${props.name}
  Server Description: ${props.description}

  **Output Format:**
  Return ONLY a raw JSON object. Do not encompass the JSON in markdown code blocks.
  {
    "risk": number,
    "reason": "Short explanation of the rating"
  }`;

  const schema = z.object({
    risk: z.number().min(0).max(100),
    reason: z.string(),
  });

  const { object } = await generateObject({
    model: gateway("google/gemini-2.5-flash-lite"),
    prompt: prompt,
    schema: schema,
  });

  return object;
}

export async function reevaluate(server: Guild): Promise<void> {
  const isInBoard = await prisma.guildBoard.findUnique({
    where: { guildId: server.id },
  });

  if (!isInBoard) return;

  const evaluation = await evaluateServerRisk({
    name: server.name,
    description: isInBoard.description,
  });

  if (evaluation.risk >= 50) {
    await prisma.guildBoard.delete({
      where: { guildId: server.id },
    });
  }
}
