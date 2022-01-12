import { SchedulerLike, ValueFromArray } from '../types';
import { Observable } from '../Observable';
import { popScheduler } from '../util/args';
import { from } from './from';

// Devs are more likely to pass null or undefined than they are a scheduler
// without accompanying values. To make things easier for (naughty) devs who
// use the `strictNullChecks: false` TypeScript compiler option, these
// overloads with explicit null and undefined values are included.

export function of(value: null): Observable<null>;
export function of(value: undefined): Observable<undefined>;

/**
 * @deprecated The `scheduler` parameter will be removed in v8. Use `scheduled`. Details: <https://rxjs.dev/deprecations/scheduler-argument>
 *
 * `scheduler` 参数将在 v8 中删除。使用 `scheduled` 的 .详细信息： <https://rxjs.dev/deprecations/scheduler-argument>
 *
 */
export function of(scheduler: SchedulerLike): Observable<never>;
/**
 * @deprecated The `scheduler` parameter will be removed in v8. Use `scheduled`. Details: <https://rxjs.dev/deprecations/scheduler-argument>
 *
 * `scheduler` 参数将在 v8 中删除。使用 `scheduled` 的 .详细信息： <https://rxjs.dev/deprecations/scheduler-argument>
 *
 */
export function of<A extends readonly unknown[]>(...valuesAndScheduler: [...A, SchedulerLike]): Observable<ValueFromArray<A>>;

export function of(): Observable<never>;
/**
 * @deprecated Do not specify explicit type parameters. Signatures with type parameters that cannot be inferred will be removed in v8.
 *
 * 不要指定显式类型参数。带有无法推断的类型参数的签名将在 v8 中删除。
 *
 */
export function of<T>(): Observable<T>;
export function of<T>(value: T): Observable<T>;
export function of<A extends readonly unknown[]>(...values: A): Observable<ValueFromArray<A>>;

/**
 * Converts the arguments to an observable sequence.
 *
 * 将参数转换为可观察序列。
 *
 * <span class="informal">Each argument becomes a `next` notification.</span>
*
 * <span class="informal">每个参数都成为 `next` 通知。</span>
 *
 * ![](of.png)
 *
 * Unlike {@link from}, it does not do any flattening and emits each argument in whole
 * as a separate `next` notification.
 *
 * 与 {@link from} 不同，它不进行任何展平，而是将每个参数作为单独的 `next` 通知整体发出。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Emit the values `10, 20, 30`
 *
 * 发出值 `10, 20, 30`
 *
 * ```ts
 * import { of } from 'rxjs';
 *
 * of(10, 20, 30)
 *   .subscribe({
 *     next: value => console.log('next:', value),
 *     error: err => console.log('error:', err),
 *     complete: () => console.log('the end'),
 *   });
 *
 * // Outputs
 * // next: 10
 * // next: 20
 * // next: 30
 * // the end
 * ```
 *
 * Emit the array `[1, 2, 3]`
 *
 * 发出数组 `[1, 2, 3]`
 *
 * ```ts
 * import { of } from 'rxjs';
 *
 * of([1, 2, 3])
 *   .subscribe({
 *     next: value => console.log('next:', value),
 *     error: err => console.log('error:', err),
 *     complete: () => console.log('the end'),
 *   });
 *
 * // Outputs
 * // next: [1, 2, 3]
 * // the end
 * ```
 * @see {@link from}
 * @see {@link range}
 * @param {...T} values A comma separated list of arguments you want to be emitted
 *
 * 要发出的参数的逗号分隔列表
 *
 * @return {Observable} An Observable that emits the arguments
 * described above and then completes.
 *
 * 发出上述参数然后完成的 Observable。
 *
 */
export function of<T>(...args: Array<T | SchedulerLike>): Observable<T> {
  const scheduler = popScheduler(args);
  return from(args as T[], scheduler);
}
