import { prisma } from "@/util/db";

const isAdmin = async (userId: string): Promise<boolean> => {
  return !!(await prisma.admin.findFirst({
    select: { userId: true },
    where: { userId },
  }));
};

export default isAdmin;
