import { Observable } from '../Observable';
import { SchedulerLike } from '../types';

/**
 * The same Observable instance returned by any call to {@link empty} without a
 * `scheduler`. It is preferable to use this over `empty()`.
 *
 * 任何对 {@link empty} 的调用都返回相同的 Observable 实例，而无需 `scheduler` 。最好在 `empty()` 上使用它。
 *
 * <span class="informal">Just emits 'complete', and nothing else.</span>
*
 * <span class="informal">只是发出“完整”，没有别的。</span>
 *
 * ![](empty.png)
 *
 * ## Examples
 *
 * ## 例子
 *
 * Log complete notification
 *
 * 记录完成通知
 *
 * ```ts
 * import { EMPTY } from 'rxjs';
 *
 * EMPTY.subscribe({
 *   next: () => console.log('Next'),
 *   complete: () => console.log('Complete!')
 * });
 *
 * // Outputs
 * // Complete!
 * ```
 */
export const EMPTY = new Observable<never>((subscriber) => subscriber.complete());

/**
 * Creates an Observable that emits no items to the Observer and immediately
 * emits a complete notification.
 *
 * 创建一个不向观察者发出任何项目并立即发出完整通知的 Observable。
 *
 * <span class="informal">Just emits 'complete', and nothing else.</span>
*
 * <span class="informal">只是发出“完整”，没有别的。</span>
 *
 * ![](empty.png)
 *
 * This static operator is useful for creating a simple Observable that only
 * emits the complete notification. It can be used for composing with other
 * Observables, such as in a {@link mergeMap}.
 *
 * 这个静态操作符对于创建一个只发出完整通知的简单 Observable 很有用。它可以用于与其他 Observable 组合，例如在 {@link mergeMap} 中。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Emit the number 7, then complete
 *
 * 发出数字 7，然后完成
 *
 * ```ts
 * import { empty, startWith } from 'rxjs';
 *
 * const result = empty().pipe(startWith(7));
 * result.subscribe(x => console.log(x));
 *
 * // Outputs
 * // 7
 * ```
 *
 * Map and flatten only odd numbers to the sequence 'a', 'b', 'c'
 *
 * 仅将奇数映射并展平到序列“a”、“b”、“c”
 *
 * ```ts
 * import { interval, mergeMap, of, empty } from 'rxjs';
 *
 * const interval$ = interval(1000);
 * const result = interval$.pipe(
 *   mergeMap(x => x % 2 === 1 ? of('a', 'b', 'c') : empty()),
 * );
 * result.subscribe(x => console.log(x));
 *
 * // Results in the following to the console:
 * // x is equal to the count on the interval, e.g. (0, 1, 2, 3, ...)
 * // x will occur every 1000ms
 * // if x % 2 is equal to 1, print a, b, c (each on its own)
 * // if x % 2 is not equal to 1, nothing will be output
 * ```
 * @see {@link Observable}
 * @see {@link never}
 * @see {@link of}
 * @see {@link throwError}
 * @param scheduler A {@link SchedulerLike} to use for scheduling
 * the emission of the complete notification.
 *
 * 用于调度发送完整通知的 {@link SchedulerLike}。
 *
 * @return An "empty" Observable: emits only the complete
 * notification.
 *
 * 一个“空”的 Observable：只发出完整的通知。
 *
 * @deprecated Replaced with the {@link EMPTY} constant or {@link scheduled} (e.g. `scheduled([], scheduler)`). Will be removed in v8.
 *
 * 替换为 {@link EMPTY} 常量或 {@link scheduled}（例如 `scheduled([], scheduler)` ）。将在 v8 中删除。
 *
 */
export function empty(scheduler?: SchedulerLike) {
  return scheduler ? emptyScheduled(scheduler) : EMPTY;
}

function emptyScheduled(scheduler: SchedulerLike) {
  return new Observable<never>((subscriber) => scheduler.schedule(() => subscriber.complete()));
}
