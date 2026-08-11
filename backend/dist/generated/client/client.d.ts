import * as runtime from "@prisma/client/runtime/library";
import * as $Class from "./internal/class";
import * as Prisma from "./internal/prismaNamespace";
export * as $Enums from './enums';
export * from "./enums";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model User
 *
 */
export type User = Prisma.UserModel;
/**
 * Model PasswordResetToken
 *
 */
export type PasswordResetToken = Prisma.PasswordResetTokenModel;
/**
 * Model RefreshToken
 *
 */
export type RefreshToken = Prisma.RefreshTokenModel;
/**
 * Model Wedding
 *
 */
export type Wedding = Prisma.WeddingModel;
/**
 * Model Task
 *
 */
export type Task = Prisma.TaskModel;
/**
 * Model Guest
 *
 */
export type Guest = Prisma.GuestModel;
/**
 * Model Group
 *
 */
export type Group = Prisma.GroupModel;
/**
 * Model Table
 *
 */
export type Table = Prisma.TableModel;
/**
 * Model Event
 *
 */
export type Event = Prisma.EventModel;
/**
 * Model Provider
 *
 */
export type Provider = Prisma.ProviderModel;
/**
 * Model ProviderDocument
 *
 */
export type ProviderDocument = Prisma.ProviderDocumentModel;
/**
 * Model Budget
 *
 */
export type Budget = Prisma.BudgetModel;
/**
 * Model BudgetItem
 *
 */
export type BudgetItem = Prisma.BudgetItemModel;
//# sourceMappingURL=client.d.ts.map