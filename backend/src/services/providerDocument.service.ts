import { prisma } from "../db/prisma";

const documentSelect = {
  id: true,
  filename: true,
  mimeType: true,
  size: true,
  createdAt: true,
} as const;

async function ownsProvider(providerId: string, userId: string): Promise<boolean> {
  const provider = await prisma.provider.findFirst({
    where: { id: providerId, wedding: { ownerId: userId } },
    select: { id: true },
  });
  return Boolean(provider);
}

export async function listDocumentsService(providerId: string, userId: string) {
  if (!(await ownsProvider(providerId, userId))) return null;
  return prisma.providerDocument.findMany({
    where: { providerId },
    orderBy: { createdAt: "desc" },
    select: documentSelect,
  });
}

export async function addDocumentService(
  providerId: string,
  userId: string,
  file: { filename: string; storedName: string; mimeType: string; size: number }
) {
  if (!(await ownsProvider(providerId, userId))) return null;
  return prisma.providerDocument.create({
    data: { providerId, ...file },
    select: documentSelect,
  });
}

/** Returns the full document row (incl. storedName) for download, scoped to the owner. */
export async function getDocumentFileService(
  providerId: string,
  documentId: string,
  userId: string
) {
  return prisma.providerDocument.findFirst({
    where: {
      id: documentId,
      providerId,
      provider: { wedding: { ownerId: userId } },
    },
    select: { filename: true, storedName: true, mimeType: true },
  });
}

/** Deletes the document row and returns its storedName so the file can be removed. */
export async function deleteDocumentService(
  providerId: string,
  documentId: string,
  userId: string
) {
  const doc = await prisma.providerDocument.findFirst({
    where: {
      id: documentId,
      providerId,
      provider: { wedding: { ownerId: userId } },
    },
    select: { id: true, storedName: true },
  });
  if (!doc) return null;

  await prisma.providerDocument.delete({ where: { id: doc.id } });
  return { storedName: doc.storedName };
}
