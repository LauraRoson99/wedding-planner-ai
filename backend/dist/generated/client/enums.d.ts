export declare const TaskPriority: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
};
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];
export declare const TaskStatus: {
    readonly PENDING: "PENDING";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly COMPLETED: "COMPLETED";
    readonly BLOCKED: "BLOCKED";
};
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
export declare const TaskCategory: {
    readonly GUESTS: "GUESTS";
    readonly CEREMONY: "CEREMONY";
    readonly BANQUET: "BANQUET";
    readonly DECORATION: "DECORATION";
    readonly PHOTO_VIDEO: "PHOTO_VIDEO";
    readonly MUSIC: "MUSIC";
    readonly TRAVEL: "TRAVEL";
    readonly OUTFITS: "OUTFITS";
    readonly PAPERWORK: "PAPERWORK";
    readonly BUDGET: "BUDGET";
    readonly OTHER: "OTHER";
};
export type TaskCategory = (typeof TaskCategory)[keyof typeof TaskCategory];
export declare const RsvpStatus: {
    readonly PENDING: "PENDING";
    readonly CONFIRMED: "CONFIRMED";
    readonly DECLINED: "DECLINED";
};
export type RsvpStatus = (typeof RsvpStatus)[keyof typeof RsvpStatus];
export declare const DietType: {
    readonly NONE: "NONE";
    readonly VEGETARIAN: "VEGETARIAN";
    readonly VEGAN: "VEGAN";
    readonly HALAL: "HALAL";
    readonly KOSHER: "KOSHER";
    readonly OTHER: "OTHER";
};
export type DietType = (typeof DietType)[keyof typeof DietType];
export declare const GuestRole: {
    readonly PRIMARY: "PRIMARY";
    readonly COMPANION: "COMPANION";
};
export type GuestRole = (typeof GuestRole)[keyof typeof GuestRole];
export declare const AgeGroup: {
    readonly ADULT: "ADULT";
    readonly CHILD: "CHILD";
    readonly BABY: "BABY";
};
export type AgeGroup = (typeof AgeGroup)[keyof typeof AgeGroup];
export declare const ProviderCategory: {
    readonly VENUE: "VENUE";
    readonly CATERING: "CATERING";
    readonly PHOTOGRAPHY: "PHOTOGRAPHY";
    readonly VIDEO: "VIDEO";
    readonly MUSIC: "MUSIC";
    readonly FLORIST: "FLORIST";
    readonly DECORATION: "DECORATION";
    readonly TRANSPORT: "TRANSPORT";
    readonly BEAUTY: "BEAUTY";
    readonly DRESS: "DRESS";
    readonly SUIT: "SUIT";
    readonly INVITATIONS: "INVITATIONS";
    readonly HONEYMOON: "HONEYMOON";
    readonly CEREMONY: "CEREMONY";
    readonly OTHER: "OTHER";
};
export type ProviderCategory = (typeof ProviderCategory)[keyof typeof ProviderCategory];
export declare const ProviderStatus: {
    readonly CONTACTED: "CONTACTED";
    readonly QUOTED: "QUOTED";
    readonly BOOKED: "BOOKED";
    readonly CONFIRMED: "CONFIRMED";
    readonly PAID: "PAID";
    readonly CANCELLED: "CANCELLED";
};
export type ProviderStatus = (typeof ProviderStatus)[keyof typeof ProviderStatus];
export declare const BudgetCategory: {
    readonly VENUE: "VENUE";
    readonly CATERING: "CATERING";
    readonly DRESS: "DRESS";
    readonly SUIT: "SUIT";
    readonly PHOTO_VIDEO: "PHOTO_VIDEO";
    readonly MUSIC: "MUSIC";
    readonly DECORATION: "DECORATION";
    readonly FLOWERS: "FLOWERS";
    readonly TRANSPORT: "TRANSPORT";
    readonly INVITATIONS: "INVITATIONS";
    readonly HONEYMOON: "HONEYMOON";
    readonly BEAUTY: "BEAUTY";
    readonly CEREMONY: "CEREMONY";
    readonly GIFTS: "GIFTS";
    readonly OTHER: "OTHER";
};
export type BudgetCategory = (typeof BudgetCategory)[keyof typeof BudgetCategory];
export declare const BudgetItemStatus: {
    readonly PLANNED: "PLANNED";
    readonly CONFIRMED: "CONFIRMED";
    readonly PAID: "PAID";
    readonly CANCELLED: "CANCELLED";
};
export type BudgetItemStatus = (typeof BudgetItemStatus)[keyof typeof BudgetItemStatus];
//# sourceMappingURL=enums.d.ts.map