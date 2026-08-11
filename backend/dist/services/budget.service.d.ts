import { BudgetCategory, BudgetItemStatus } from "../generated/client/client";
type CreateBudgetItemInput = {
    name: string;
    category?: BudgetCategory | undefined;
    estimatedAmount: number;
    actualAmount?: number | null | undefined;
    paidAmount?: number | undefined;
    status?: BudgetItemStatus | undefined;
    dueDate?: Date | null | undefined;
    paymentDate?: Date | null | undefined;
    supplier?: string | null | undefined;
    providerId?: string | null | undefined;
    notes?: string | null | undefined;
};
type UpdateBudgetItemInput = {
    name?: string | undefined;
    category?: BudgetCategory | undefined;
    estimatedAmount?: number | undefined;
    actualAmount?: number | null | undefined;
    paidAmount?: number | undefined;
    status?: BudgetItemStatus | undefined;
    dueDate?: Date | null | undefined;
    paymentDate?: Date | null | undefined;
    supplier?: string | null | undefined;
    providerId?: string | null | undefined;
    notes?: string | null | undefined;
};
export declare function getBudgetSummaryService(weddingId: string, userId: string): Promise<{
    budget: {
        id: string;
        weddingId: string;
        totalAmount: number;
        currency: string;
    };
    summary: {
        totalBudget: number;
        totalEstimated: number;
        totalActual: number;
        totalPaid: number;
        pendingPayment: number;
        remainingBudget: number;
        budgetUsagePercentage: number;
        paidPercentage: number;
        itemCount: number;
        byStatus: {
            planned: number;
            confirmed: number;
            paid: number;
            cancelled: number;
        };
    };
    categories: {
        category: string;
        estimated: number;
        actual: number;
        paid: number;
        count: number;
    }[];
    monthly: {
        month: string;
        estimated: number;
        actual: number;
        paid: number;
    }[];
    items: ({
        provider: {
            name: string;
            id: string;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        weddingId: string;
        notes: string | null;
        dueDate: Date | null;
        status: BudgetItemStatus;
        category: BudgetCategory;
        estimatedAmount: number;
        actualAmount: number | null;
        paidAmount: number;
        paymentDate: Date | null;
        supplier: string | null;
        providerId: string | null;
    })[];
} | null>;
export declare function updateBudgetSettingsService(weddingId: string, userId: string, data: {
    totalAmount: number;
    currency?: string | undefined;
}): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    totalAmount: number;
    currency: string;
} | null>;
export declare function createBudgetItemService(weddingId: string, userId: string, data: CreateBudgetItemInput): Promise<({
    provider: {
        name: string;
        id: string;
    } | null;
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    notes: string | null;
    dueDate: Date | null;
    status: BudgetItemStatus;
    category: BudgetCategory;
    estimatedAmount: number;
    actualAmount: number | null;
    paidAmount: number;
    paymentDate: Date | null;
    supplier: string | null;
    providerId: string | null;
}) | null>;
export declare function createManyBudgetItemsService(weddingId: string, userId: string, items: Array<{
    name: string;
    category?: BudgetCategory;
    estimatedAmount: number;
    notes?: string | null;
}>): Promise<{
    created: number;
} | null>;
export declare function updateBudgetItemService(id: string, userId: string, data: UpdateBudgetItemInput): Promise<({
    provider: {
        name: string;
        id: string;
    } | null;
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    notes: string | null;
    dueDate: Date | null;
    status: BudgetItemStatus;
    category: BudgetCategory;
    estimatedAmount: number;
    actualAmount: number | null;
    paidAmount: number;
    paymentDate: Date | null;
    supplier: string | null;
    providerId: string | null;
}) | null>;
export declare function deleteBudgetItemService(id: string, userId: string): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    notes: string | null;
    dueDate: Date | null;
    status: BudgetItemStatus;
    category: BudgetCategory;
    estimatedAmount: number;
    actualAmount: number | null;
    paidAmount: number;
    paymentDate: Date | null;
    supplier: string | null;
    providerId: string | null;
} | null>;
export {};
//# sourceMappingURL=budget.service.d.ts.map