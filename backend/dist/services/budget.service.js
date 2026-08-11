"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBudgetSummaryService = getBudgetSummaryService;
exports.updateBudgetSettingsService = updateBudgetSettingsService;
exports.createBudgetItemService = createBudgetItemService;
exports.createManyBudgetItemsService = createManyBudgetItemsService;
exports.updateBudgetItemService = updateBudgetItemService;
exports.deleteBudgetItemService = deleteBudgetItemService;
const client_1 = require("../generated/client/client");
const prisma_1 = require("../db/prisma");
const budgetItemInclude = {
    provider: { select: { id: true, name: true } },
};
/** Throws 400 if providerId is set but does not belong to the given wedding. */
async function assertProviderInWedding(providerId, weddingId) {
    if (!providerId)
        return;
    const provider = await prisma_1.prisma.provider.findFirst({
        where: { id: providerId, weddingId },
        select: { id: true },
    });
    if (!provider)
        throw { status: 400, message: "Proveedor no válido" };
}
async function getBudgetSummaryService(weddingId, userId) {
    const wedding = await prisma_1.prisma.wedding.findFirst({
        where: {
            id: weddingId,
            ownerId: userId,
        },
        select: {
            id: true,
            name: true,
            budget: true,
        },
    });
    if (!wedding) {
        return null;
    }
    let budget = wedding.budget;
    if (!budget) {
        budget = await prisma_1.prisma.budget.create({
            data: {
                weddingId,
                totalAmount: 0,
                currency: "EUR",
            },
        });
    }
    const items = await prisma_1.prisma.budgetItem.findMany({
        where: { weddingId },
        orderBy: [
            { status: "asc" },
            { dueDate: "asc" },
            { createdAt: "desc" },
        ],
        include: budgetItemInclude,
    });
    const totalEstimated = items.reduce((sum, item) => sum + item.estimatedAmount, 0);
    const totalActual = items.reduce((sum, item) => sum + (item.actualAmount ?? item.estimatedAmount), 0);
    const totalPaid = items.reduce((sum, item) => sum + item.paidAmount, 0);
    const pendingPayment = Math.max(totalActual - totalPaid, 0);
    const totalBudget = budget.totalAmount;
    const remainingBudget = totalBudget > 0 ? totalBudget - totalActual : 0;
    const budgetUsagePercentage = totalBudget === 0 ? 0 : Math.min(Math.round((totalActual / totalBudget) * 100), 100);
    const paidPercentage = totalActual === 0 ? 0 : Math.min(Math.round((totalPaid / totalActual) * 100), 100);
    const categoryMap = new Map();
    for (const item of items) {
        const current = categoryMap.get(item.category) ?? {
            category: item.category,
            estimated: 0,
            actual: 0,
            paid: 0,
            count: 0,
        };
        current.estimated += item.estimatedAmount;
        current.actual += item.actualAmount ?? item.estimatedAmount;
        current.paid += item.paidAmount;
        current.count += 1;
        categoryMap.set(item.category, current);
    }
    const categories = Array.from(categoryMap.values()).sort((a, b) => b.actual - a.actual);
    const monthlyMap = new Map();
    for (const item of items) {
        const baseDate = item.paymentDate ?? item.dueDate ?? item.createdAt;
        const month = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, "0")}`;
        const current = monthlyMap.get(month) ?? {
            month,
            estimated: 0,
            actual: 0,
            paid: 0,
        };
        current.estimated += item.estimatedAmount;
        current.actual += item.actualAmount ?? item.estimatedAmount;
        current.paid += item.paidAmount;
        monthlyMap.set(month, current);
    }
    const monthly = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    const byStatus = {
        planned: items.filter((item) => item.status === client_1.BudgetItemStatus.PLANNED).length,
        confirmed: items.filter((item) => item.status === client_1.BudgetItemStatus.CONFIRMED).length,
        paid: items.filter((item) => item.status === client_1.BudgetItemStatus.PAID).length,
        cancelled: items.filter((item) => item.status === client_1.BudgetItemStatus.CANCELLED).length,
    };
    return {
        budget: {
            id: budget.id,
            weddingId: budget.weddingId,
            totalAmount: budget.totalAmount,
            currency: budget.currency,
        },
        summary: {
            totalBudget,
            totalEstimated,
            totalActual,
            totalPaid,
            pendingPayment,
            remainingBudget,
            budgetUsagePercentage,
            paidPercentage,
            itemCount: items.length,
            byStatus,
        },
        categories,
        monthly,
        items,
    };
}
async function updateBudgetSettingsService(weddingId, userId, data) {
    const wedding = await prisma_1.prisma.wedding.findFirst({
        where: {
            id: weddingId,
            ownerId: userId,
        },
        select: {
            id: true,
        },
    });
    if (!wedding) {
        return null;
    }
    return prisma_1.prisma.budget.upsert({
        where: { weddingId },
        create: {
            weddingId,
            totalAmount: data.totalAmount,
            currency: data.currency ?? "EUR",
        },
        update: {
            totalAmount: data.totalAmount,
            currency: data.currency ?? "EUR",
        },
    });
}
async function createBudgetItemService(weddingId, userId, data) {
    const wedding = await prisma_1.prisma.wedding.findFirst({
        where: {
            id: weddingId,
            ownerId: userId,
        },
        select: {
            id: true,
        },
    });
    if (!wedding) {
        return null;
    }
    await assertProviderInWedding(data.providerId, weddingId);
    return prisma_1.prisma.budgetItem.create({
        data: {
            weddingId,
            name: data.name,
            category: data.category ?? client_1.BudgetCategory.OTHER,
            estimatedAmount: data.estimatedAmount,
            actualAmount: data.actualAmount ?? null,
            paidAmount: data.paidAmount ?? 0,
            status: data.status ?? client_1.BudgetItemStatus.PLANNED,
            dueDate: data.dueDate ?? null,
            paymentDate: data.paymentDate ?? null,
            supplier: data.supplier ?? null,
            providerId: data.providerId ?? null,
            notes: data.notes ?? null,
        },
        include: budgetItemInclude,
    });
}
async function createManyBudgetItemsService(weddingId, userId, items) {
    const wedding = await prisma_1.prisma.wedding.findFirst({
        where: { id: weddingId, ownerId: userId },
        select: { id: true },
    });
    if (!wedding)
        return null;
    const result = await prisma_1.prisma.budgetItem.createMany({
        data: items.map((i) => ({
            weddingId,
            name: i.name.trim(),
            category: i.category ?? client_1.BudgetCategory.OTHER,
            estimatedAmount: i.estimatedAmount,
            notes: i.notes ?? null,
        })),
    });
    return { created: result.count };
}
async function updateBudgetItemService(id, userId, data) {
    const existing = await prisma_1.prisma.budgetItem.findFirst({
        where: {
            id,
            wedding: {
                ownerId: userId,
            },
        },
    });
    if (!existing) {
        return null;
    }
    const updateData = {};
    if (data.name !== undefined) {
        updateData.name = data.name;
    }
    if (data.category !== undefined) {
        updateData.category = data.category;
    }
    if (data.estimatedAmount !== undefined) {
        updateData.estimatedAmount = data.estimatedAmount;
    }
    if (data.actualAmount !== undefined) {
        updateData.actualAmount = data.actualAmount;
    }
    if (data.paidAmount !== undefined) {
        updateData.paidAmount = data.paidAmount;
    }
    if (data.status !== undefined) {
        updateData.status = data.status;
    }
    if (data.dueDate !== undefined) {
        updateData.dueDate = data.dueDate;
    }
    if (data.paymentDate !== undefined) {
        updateData.paymentDate = data.paymentDate;
    }
    if (data.supplier !== undefined) {
        updateData.supplier = data.supplier;
    }
    if (data.providerId !== undefined) {
        await assertProviderInWedding(data.providerId, existing.weddingId);
        updateData.providerId = data.providerId;
    }
    if (data.notes !== undefined) {
        updateData.notes = data.notes;
    }
    return prisma_1.prisma.budgetItem.update({
        where: { id },
        data: updateData,
        include: budgetItemInclude,
    });
}
async function deleteBudgetItemService(id, userId) {
    const existing = await prisma_1.prisma.budgetItem.findFirst({
        where: {
            id,
            wedding: {
                ownerId: userId,
            },
        },
    });
    if (!existing) {
        return null;
    }
    return prisma_1.prisma.budgetItem.delete({
        where: { id },
    });
}
//# sourceMappingURL=budget.service.js.map