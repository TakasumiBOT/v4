import { prisma } from "@takasumibot-v4/db";

export async function needsTermsAgreement(userId: string): Promise<boolean> {
  const user = await prisma.account.findUnique({
    where: { userId },
  });
  if (!user) {
    return false;
  }
  const latestTerms = await prisma.termsChange.findFirst({
    orderBy: { date: "desc" },
  });
  if (!latestTerms) {
    return false;
  }
  if (!user.lastAgreedAt || user.lastAgreedAt < latestTerms.date) {
    return true;
  }
  return false;
}
