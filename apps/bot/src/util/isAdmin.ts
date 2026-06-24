import { prisma } from "@/util/db";
let cache: Set<string> = new Set();

const isAdmin = async (userId: string, force?: boolean): Promise<boolean> => {
  if (force) {
    return !!(await prisma.admin.findFirst({
      select: { userId: true },
      where: { userId },
    }));
  }
  return cache.has(userId);
};

setInterval(async () => {
  void refresh();
}, 25 * 1000);

async function refresh() {
  try {
    cache = new Set(
      (await prisma.admin.findMany({ select: { userId: true } })).map((t) => t.userId),
    );
  } catch (_) {}
}

void refresh(); //初回取得
export default isAdmin;
