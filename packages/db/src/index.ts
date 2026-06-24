import { PrismaPg } from "@prisma/adapter-pg";
import { sharedEnv } from "@takasumibot-v4/env/shared";

import { PrismaClient } from "@/prisma/generated/client";

export function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: sharedEnv.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();
export default prisma;
