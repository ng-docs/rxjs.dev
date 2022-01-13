/** prettier */
import { Observable } from '../Observable';
import { concat } from '../observable/concat';
import { of } from '../observable/of';
import { MonoTypeOperatorFunction, SchedulerLike, OperatorFunction, ValueFromArray } from '../types';

/**
 * @deprecated The `scheduler` parameter will be removed in v8. Use `scheduled` and `concatAll`. Details: <https://rxjs.dev/deprecations/scheduler-argument>
 *
 * `scheduler` 参数将在 v8 中删除。使用 `scheduled` 和 `concatAll` 。详细信息： <https://rxjs.dev/deprecations/scheduler-argument>
 *
 */
export function endWith<T>(scheduler: SchedulerLike): MonoTypeOperatorFunction<T>;
/**
 * @deprecated The `scheduler` parameter will be removed in v8. Use `scheduled` and `concatAll`. Details: <https://rxjs.dev/deprecations/scheduler-argument>
 *
 * `scheduler` 参数将在 v8 中删除。使用 `scheduled` 和 `concatAll` 。详细信息： <https://rxjs.dev/deprecations/scheduler-argument>
 *
 */
export function endWith<T, A extends unknown[] = T[]>(
  ...valuesAndScheduler: [...A, SchedulerLike]
): OperatorFunction<T, T | ValueFromArray<A>>;

export function endWith<T, A extends unknown[] = T[]>(...values: A): OperatorFunction<T, T | ValueFromArray<A>>;

/**
 * Returns an observable that will emit all values from the source, then synchronously emit
 * the provided value(s) immediately after the source completes.
 *
 * 返回一个 observable，它将从源发出所有值，然后在源完成后立即同步发出提供的值。
 *
 * NOTE: Passing a last argument of a Scheduler is _deprecated_, and may result in incorrect
 * types in TypeScript.
 *
 * 注意：_ 不推荐 _ 传递调度程序的最后一个参数，并且可能导致 TypeScript 中的类型不正确。
 *
 * This is useful for knowing when an observable ends. Particularly when paired with an
 * operator like {@link takeUntil}
 *
 * 这对于了解 observable 何时结束很有用。特别是与像 {@link takeUntil} 这样的运算符配对时
 *
 * ![](endWith.png)
 *
 * ## Example
 *
 * ## 例子
 *
 * Emit values to know when an interval starts and stops. The interval will
 * stop when a user clicks anywhere on the document.
 *
 * 发出值以了解间隔何时开始和停止。当用户单击文档上的任意位置时，间隔将停止。
 *
 * ```ts
 * import { interval, map, fromEvent, startWith, takeUntil, endWith } from 'rxjs';
 *
 * const ticker$ = interval(5000).pipe(
 *   map(() => 'tick')
 * );
 *
 * const documentClicks$ = fromEvent(document, 'click');
 *
 * ticker$.pipe(
 *   startWith('interval started'),
 *   takeUntil(documentClicks$),
 *   endWith('interval ended by click')
 * )
 * .subscribe(x => console.log(x));
 *
 * // Result (assuming a user clicks after 15 seconds)
 * // 'interval started'
 * // 'tick'
 * // 'tick'
 * // 'tick'
 * // 'interval ended by click'
 * ```
 * @see {@link startWith}
 * @see {@link concat}
 * @see {@link takeUntil}
 * @param values Items you want the modified Observable to emit last.
 *
 * 你希望修改后的 Observable 最后发出的项目。
 *
 * @return A function that returns an Observable that emits all values from the
 * source, then synchronously emits the provided value(s) immediately after the
 * source completes.
 *
 * 一个返回 Observable 的函数，该 Observable 从源发出所有值，然后在源完成后立即同步发出提供的值。
 *
 */
export function endWith<T>(...values: Array<T | SchedulerLike>): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => concat(source, of(...values)) as Observable<T>;
}
