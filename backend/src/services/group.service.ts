import { PrismaClient } from "../generated/client/client";
const prisma = new PrismaClient();

export function listGroups(weddingId: string) {
  return prisma.group.findMany({
    where: { weddingId },
    orderBy: { name: "asc" },
  });
}
