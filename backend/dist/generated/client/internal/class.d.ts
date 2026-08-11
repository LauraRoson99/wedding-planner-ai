import * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "./prismaNamespace";
export type LogOptions<ClientOptions extends Prisma.PrismaClientOptions> = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never;
export interface PrismaClientConstructor {
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
    new <Options extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions, LogOpts extends LogOptions<Options> = LogOptions<Options>, OmitOpts extends Prisma.PrismaClientOptions['omit'] = Options extends {
        omit: infer U;
    } ? U : Prisma.PrismaClientOptions['omit'], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs>(options?: Prisma.Subset<Options, Prisma.PrismaClientOptions>): PrismaClient<LogOpts, OmitOpts, ExtArgs>;
}
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
export interface PrismaClient<in LogOpts extends Prisma.LogLevel = never, in out OmitOpts extends Prisma.PrismaClientOptions['omit'] = Prisma.PrismaClientOptions['omit'], in out ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['other'];
    };
    $on<V extends LogOpts>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;
    /**
     * Connect with the database
     */
    $connect(): runtime.Types.Utils.JsPromise<void>;
    /**
     * Disconnect from the database
     */
    $disconnect(): runtime.Types.Utils.JsPromise<void>;
    /**
       * Executes a prepared raw query and returns the number of affected rows.
       * @example
       * ```
       * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
       * ```
       *
       * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
       */
    $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;
    /**
     * Executes a raw query and returns the number of affected rows.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
     */
    $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;
    /**
     * Performs a prepared raw query and returns the `SELECT` data.
     * @example
     * ```
     * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
     */
    $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;
    /**
     * Performs a raw query and returns the `SELECT` data.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
     */
    $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;
    /**
     * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
     * @example
     * ```
     * const [george, bob, alice] = await prisma.$transaction([
     *   prisma.user.create({ data: { name: 'George' } }),
     *   prisma.user.create({ data: { name: 'Bob' } }),
     *   prisma.user.create({ data: { name: 'Alice' } }),
     * ])
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
     */
    $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: {
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;
    $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => runtime.Types.Utils.JsPromise<R>, options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<R>;
    $extends: runtime.Types.Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<OmitOpts>, ExtArgs, runtime.Types.Utils.Call<Prisma.TypeMapCb<OmitOpts>, {
        extArgs: ExtArgs;
    }>>;
    /**
 * `prisma.user`: Exposes CRUD operations for the **User** model.
  * Example usage:
  * ```ts
  * // Fetch zero or more Users
  * const users = await prisma.user.findMany()
  * ```
  */
    get user(): Prisma.UserDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.passwordResetToken`: Exposes CRUD operations for the **PasswordResetToken** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more PasswordResetTokens
      * const passwordResetTokens = await prisma.passwordResetToken.findMany()
      * ```
      */
    get passwordResetToken(): Prisma.PasswordResetTokenDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.refreshToken`: Exposes CRUD operations for the **RefreshToken** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more RefreshTokens
      * const refreshTokens = await prisma.refreshToken.findMany()
      * ```
      */
    get refreshToken(): Prisma.RefreshTokenDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.wedding`: Exposes CRUD operations for the **Wedding** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Weddings
      * const weddings = await prisma.wedding.findMany()
      * ```
      */
    get wedding(): Prisma.WeddingDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.task`: Exposes CRUD operations for the **Task** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Tasks
      * const tasks = await prisma.task.findMany()
      * ```
      */
    get task(): Prisma.TaskDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.guest`: Exposes CRUD operations for the **Guest** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Guests
      * const guests = await prisma.guest.findMany()
      * ```
      */
    get guest(): Prisma.GuestDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.group`: Exposes CRUD operations for the **Group** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Groups
      * const groups = await prisma.group.findMany()
      * ```
      */
    get group(): Prisma.GroupDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.table`: Exposes CRUD operations for the **Table** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Tables
      * const tables = await prisma.table.findMany()
      * ```
      */
    get table(): Prisma.TableDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.event`: Exposes CRUD operations for the **Event** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Events
      * const events = await prisma.event.findMany()
      * ```
      */
    get event(): Prisma.EventDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.provider`: Exposes CRUD operations for the **Provider** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Providers
      * const providers = await prisma.provider.findMany()
      * ```
      */
    get provider(): Prisma.ProviderDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.providerDocument`: Exposes CRUD operations for the **ProviderDocument** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ProviderDocuments
      * const providerDocuments = await prisma.providerDocument.findMany()
      * ```
      */
    get providerDocument(): Prisma.ProviderDocumentDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.budget`: Exposes CRUD operations for the **Budget** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Budgets
      * const budgets = await prisma.budget.findMany()
      * ```
      */
    get budget(): Prisma.BudgetDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.budgetItem`: Exposes CRUD operations for the **BudgetItem** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more BudgetItems
      * const budgetItems = await prisma.budgetItem.findMany()
      * ```
      */
    get budgetItem(): Prisma.BudgetItemDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
}
export declare function getPrismaClientClass(dirname: string): PrismaClientConstructor;
//# sourceMappingURL=class.d.ts.map