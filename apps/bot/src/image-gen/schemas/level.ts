import { t } from "elysia";

export const levelBodySchema = t.Object({
  avatar: t.String({ format: "uri" }),
  serverIcon: t.String({ format: "uri" }),
  username: t.String(),
  level: t.Number(),
  currentXp: t.Number(),
  nextLevelXp: t.Number(),
  background: t.String({ format: "uri" }),
});
