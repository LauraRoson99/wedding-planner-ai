import fs from "fs";
import path from "path";
import { prisma } from "../db/prisma";
import { ProviderCategory, ProviderStatus } from "../generated/client/client";
import { UPLOADS_DIR } from "../middleware/upload";

type CreateProviderInput = {
  name: string;
  category?: ProviderCategory;
  status?: ProviderStatus;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  estimatedPrice?: number | null;
  finalPrice?: number | null;
  notes?: string | null;
};

type UpdateProviderInput = Partial<CreateProviderInput>;

export async function getProvidersService(weddingId: string, userId: string) {
  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, ownerId: userId },
    select: { id: true },
  });
  if (!wedding) return null;

  return prisma.provider.findMany({
    where: { weddingId },
    orderBy: [{ status: "asc" }, { category: "asc" }, { createdAt: "desc" }],
  });
}

export async function getProviderByIdService(id: string, userId: string) {
  return prisma.provider.findFirst({
    where: { id, wedding: { ownerId: userId } },
  });
}

export async function createProviderService(
  weddingId: string,
  userId: string,
  data: CreateProviderInput
) {
  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, ownerId: userId },
    select: { id: true },
  });
  if (!wedding) return null;

  return prisma.provider.create({
    data: {
      weddingId,
      name: data.name,
      category: data.category ?? ProviderCategory.OTHER,
      status: data.status ?? ProviderStatus.CONTACTED,
      contactName: data.contactName ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      website: data.website ?? null,
      estimatedPrice: data.estimatedPrice ?? null,
      finalPrice: data.finalPrice ?? null,
      notes: data.notes ?? null,
    },
  });
}

export async function createManyProvidersService(
  weddingId: string,
  userId: string,
  providers: Array<{ name: string; category?: ProviderCategory; notes?: string | null }>
) {
  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, ownerId: userId },
    select: { id: true },
  });
  if (!wedding) return null;

  const result = await prisma.provider.createMany({
    data: providers.map((p) => ({
      weddingId,
      name: p.name.trim(),
      category: p.category ?? ProviderCategory.OTHER,
      status: ProviderStatus.CONTACTED,
      notes: p.notes ?? null,
    })),
  });
  return { created: result.count };
}

export async function updateProviderService(
  id: string,
  userId: string,
  data: UpdateProviderInput
) {
  const existing = await prisma.provider.findFirst({
    where: { id, wedding: { ownerId: userId } },
  });
  if (!existing) return null;

  return prisma.provider.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.contactName !== undefined && { contactName: data.contactName }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.website !== undefined && { website: data.website }),
      ...(data.estimatedPrice !== undefined && { estimatedPrice: data.estimatedPrice }),
      ...(data.finalPrice !== undefined && { finalPrice: data.finalPrice }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });
}

export async function deleteProviderService(id: string, userId: string) {
  const existing = await prisma.provider.findFirst({
    where: { id, wedding: { ownerId: userId } },
  });
  if (!existing) return null;

  // Grab the document files before the cascade removes their rows, so we can
  // clean them off disk afterwards (best-effort).
  const documents = await prisma.providerDocument.findMany({
    where: { providerId: id },
    select: { storedName: true },
  });

  const deleted = await prisma.provider.delete({ where: { id } });

  for (const doc of documents) {
    fs.promises.unlink(path.join(UPLOADS_DIR, doc.storedName)).catch(() => {
      /* best-effort cleanup */
    });
  }

  return deleted;
}
