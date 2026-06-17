import { prisma } from "../db/prisma";
import { ProviderCategory, ProviderStatus } from "../generated/client/client";

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

  return prisma.provider.delete({ where: { id } });
}
