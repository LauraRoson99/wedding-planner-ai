import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models';
export type * from './prismaNamespace';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
export declare const ModelName: {
    readonly User: "User";
    readonly PasswordResetToken: "PasswordResetToken";
    readonly RefreshToken: "RefreshToken";
    readonly Wedding: "Wedding";
    readonly Task: "Task";
    readonly Guest: "Guest";
    readonly Group: "Group";
    readonly Table: "Table";
    readonly Event: "Event";
    readonly Provider: "Provider";
    readonly ProviderDocument: "ProviderDocument";
    readonly Budget: "Budget";
    readonly BudgetItem: "BudgetItem";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly password: "password";
    readonly name: "name";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const PasswordResetTokenScalarFieldEnum: {
    readonly id: "id";
    readonly tokenHash: "tokenHash";
    readonly userId: "userId";
    readonly expiresAt: "expiresAt";
    readonly createdAt: "createdAt";
};
export type PasswordResetTokenScalarFieldEnum = (typeof PasswordResetTokenScalarFieldEnum)[keyof typeof PasswordResetTokenScalarFieldEnum];
export declare const RefreshTokenScalarFieldEnum: {
    readonly id: "id";
    readonly jti: "jti";
    readonly userId: "userId";
    readonly expiresAt: "expiresAt";
    readonly createdAt: "createdAt";
};
export type RefreshTokenScalarFieldEnum = (typeof RefreshTokenScalarFieldEnum)[keyof typeof RefreshTokenScalarFieldEnum];
export declare const WeddingScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly date: "date";
    readonly ownerId: "ownerId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type WeddingScalarFieldEnum = (typeof WeddingScalarFieldEnum)[keyof typeof WeddingScalarFieldEnum];
export declare const TaskScalarFieldEnum: {
    readonly id: "id";
    readonly title: "title";
    readonly notes: "notes";
    readonly completed: "completed";
    readonly dueDate: "dueDate";
    readonly priority: "priority";
    readonly status: "status";
    readonly category: "category";
    readonly weddingId: "weddingId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TaskScalarFieldEnum = (typeof TaskScalarFieldEnum)[keyof typeof TaskScalarFieldEnum];
export declare const GuestScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly weddingId: "weddingId";
    readonly groupId: "groupId";
    readonly tableId: "tableId";
    readonly seatNumber: "seatNumber";
    readonly role: "role";
    readonly rsvp: "rsvp";
    readonly diet: "diet";
    readonly dietNotes: "dietNotes";
    readonly allergies: "allergies";
    readonly notes: "notes";
    readonly ageGroup: "ageGroup";
    readonly phone: "phone";
    readonly email: "email";
    readonly invitationSent: "invitationSent";
    readonly invitationSentAt: "invitationSentAt";
    readonly rsvpToken: "rsvpToken";
    readonly parentId: "parentId";
};
export type GuestScalarFieldEnum = (typeof GuestScalarFieldEnum)[keyof typeof GuestScalarFieldEnum];
export declare const GroupScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly weddingId: "weddingId";
};
export type GroupScalarFieldEnum = (typeof GroupScalarFieldEnum)[keyof typeof GroupScalarFieldEnum];
export declare const TableScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly seats: "seats";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly weddingId: "weddingId";
};
export type TableScalarFieldEnum = (typeof TableScalarFieldEnum)[keyof typeof TableScalarFieldEnum];
export declare const EventScalarFieldEnum: {
    readonly id: "id";
    readonly title: "title";
    readonly date: "date";
    readonly time: "time";
    readonly location: "location";
    readonly description: "description";
    readonly weddingId: "weddingId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type EventScalarFieldEnum = (typeof EventScalarFieldEnum)[keyof typeof EventScalarFieldEnum];
export declare const ProviderScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly category: "category";
    readonly status: "status";
    readonly contactName: "contactName";
    readonly phone: "phone";
    readonly email: "email";
    readonly website: "website";
    readonly estimatedPrice: "estimatedPrice";
    readonly finalPrice: "finalPrice";
    readonly notes: "notes";
    readonly weddingId: "weddingId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ProviderScalarFieldEnum = (typeof ProviderScalarFieldEnum)[keyof typeof ProviderScalarFieldEnum];
export declare const ProviderDocumentScalarFieldEnum: {
    readonly id: "id";
    readonly providerId: "providerId";
    readonly filename: "filename";
    readonly storedName: "storedName";
    readonly mimeType: "mimeType";
    readonly size: "size";
    readonly createdAt: "createdAt";
};
export type ProviderDocumentScalarFieldEnum = (typeof ProviderDocumentScalarFieldEnum)[keyof typeof ProviderDocumentScalarFieldEnum];
export declare const BudgetScalarFieldEnum: {
    readonly id: "id";
    readonly weddingId: "weddingId";
    readonly totalAmount: "totalAmount";
    readonly currency: "currency";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type BudgetScalarFieldEnum = (typeof BudgetScalarFieldEnum)[keyof typeof BudgetScalarFieldEnum];
export declare const BudgetItemScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly category: "category";
    readonly estimatedAmount: "estimatedAmount";
    readonly actualAmount: "actualAmount";
    readonly paidAmount: "paidAmount";
    readonly status: "status";
    readonly dueDate: "dueDate";
    readonly paymentDate: "paymentDate";
    readonly supplier: "supplier";
    readonly notes: "notes";
    readonly weddingId: "weddingId";
    readonly providerId: "providerId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type BudgetItemScalarFieldEnum = (typeof BudgetItemScalarFieldEnum)[keyof typeof BudgetItemScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
//# sourceMappingURL=prismaNamespaceBrowser.d.ts.map