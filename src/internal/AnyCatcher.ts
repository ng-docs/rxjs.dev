/*
 * Note that we cannot apply the `internal` tag here because the declaration
 * needs to survive the `stripInternal` option. Otherwise, `AnyCatcher` will
 * be `any` in the `.d.ts` files.
 */
declare const anyCatcherSymbol: unique symbol;

/**
 * This is just a type that we're using to identify `any` being passed to
 * function overloads. This is used because of situations like {@link forkJoin},
 * where it could return an `Observable<T[]>` or an `Observable<{ [key: K]: T }>`,
 * so `forkJoin(any)` would mean we need to return `Observable<unknown>`.
 *
 * 这只是我们用来识别 `any` 传给函数重载的类型。这是因为像 {@link forkJoin} 这样的情况，它可以返回一个 `Observable<T[]>` 或一个 `Observable<{ [key: K]: T }>`，所以 `forkJoin(any)` 意味着我们需要返回 `Observable<unknown>`。
 *
 */
export type AnyCatcher = typeof anyCatcherSymbol;
