import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { pingMoneyApp } from "@/util/MoneyAppRealtime";
import Log from "@/util/Log";
import { env } from "@/util/Env";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const basePrisma = new PrismaClient({
  adapter,
  transactionOptions: {
    maxWait: 10 * 60 * 1000,
    timeout: 2 * 60 * 1000,
  },
});

export const prisma = basePrisma.$extends({
  query: {
    account: {
      async update({ args, query }) {
        const result = await query(args);
        if (result.userId)
          pingMoneyApp(result.userId).catch((error) => {
            Log.error(`Failed to ping Money App for userId ${result.userId}: ${error}`);
          });
        return result;
      },
      async upsert({ args, query }) {
        const result = await query(args);
        if (result.userId)
          pingMoneyApp(result.userId).catch((error) => {
            Log.error(`Failed to ping Money App for userId ${result.userId}: ${error}`);
          });
        return result;
      },
    },
  },
});
