export declare function listGroups(weddingId: string): import("../generated/client/internal/prismaNamespace").PrismaPromise<({
    _count: {
        guests: number;
    };
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
})[]>;
export declare function getGroupById(groupId: string, userId: string): import("../generated/client/models").Prisma__GroupClient<({
    guests: {
        name: string;
        id: string;
    }[];
    _count: {
        guests: number;
    };
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
}) | null, null, import("@prisma/client/runtime/library").DefaultArgs, {
    omit: import("../generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function createGroup(weddingId: string, name: string): import("../generated/client/models").Prisma__GroupClient<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
}, never, import("@prisma/client/runtime/library").DefaultArgs, {
    omit: import("../generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function updateGroup(groupId: string, name: string): import("../generated/client/models").Prisma__GroupClient<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
}, never, import("@prisma/client/runtime/library").DefaultArgs, {
    omit: import("../generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function deleteGroup(groupId: string): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
}>;
//# sourceMappingURL=group.service.d.ts.map