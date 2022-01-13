import { SchedulerLike } from '../types';
import { Observable } from '../Observable';
import { EMPTY } from './empty';

export function range(start: number, count?: number): Observable<number>;

/**
 * @deprecated The `scheduler` parameter will be removed in v8. Use `range(start, count).pipe(observeOn(scheduler))` instead. Details: Details: <https://rxjs.dev/deprecations/scheduler-argument>
 *
 * `scheduler` 参数将在 v8 中删除。使用 `range(start, count).pipe(observeOn(scheduler))` 代替。详细信息：详细信息： <https://rxjs.dev/deprecations/scheduler-argument>
 *
 */
export function range(start: number, count: number | undefined, scheduler: SchedulerLike): Observable<number>;

/**
 * Creates an Observable that emits a sequence of numbers within a specified
 * range.
 *
 * 创建一个可发出指定范围内的数字序列的 Observable。
 *
 * <span class="informal">Emits a sequence of numbers in a range.</span>
 *
 * 发出一个范围内的数字序列。
 *
 * ![](range.png)
 *
 * `range` operator emits a range of sequential integers, in order, where you
 * select the `start` of the range and its `length`. By default, uses no
 * {@link SchedulerLike} and just delivers the notifications synchronously, but may use
 * an optional {@link SchedulerLike} to regulate those deliveries.
 *
 * `range` 运算符按顺序发出一系列连续整数，你可以在其中选择范围的 `start` 及其 `length` 。默认情况下，不使用 {@link SchedulerLike} 并且仅同步传递通知，但可以使用可选的 {@link SchedulerLike} 来规范这些传递。
 *
 * ## Example
 *
 * ## 例子
 *
 * Produce a range of numbers
 *
 * 产生一系列数字
 *
 * ```ts
 * import { range } from 'rxjs';
 *
 * const numbers = range(1, 3);
 *
 * numbers.subscribe({
 *   next: value => console.log(value),
 *   complete: () => console.log('Complete!')
 * });
 *
 * // Logs:
 * // 1
 * // 2
 * // 3
 * // 'Complete!'
 * ```
 * @see {@link timer}
 * @see {@link interval}
 * @param {number} [start=0] The value of the first integer in the sequence.
 * @param {number} count The number of sequential integers to generate.
 *
 * 要生成的连续整数的数量。
 *
 * @param {SchedulerLike} [scheduler] A {@link SchedulerLike} to use for scheduling
 * the emissions of the notifications.
 *
 * 用于调度通知的发送。
 *
 * @return {Observable} An Observable of numbers that emits a finite range of
 * sequential integers.
 *
 * 一个可观察到的数字，它发出有限范围的连续整数。
 *
 */
export function range(start: number, count?: number, scheduler?: SchedulerLike): Observable<number> {
  if (count == null) {
    // If one argument was passed, it's the count, not the start.
    count = start;
    start = 0;
  }

  if (count <= 0) {
    // No count? We're going nowhere. Return EMPTY.
    return EMPTY;
  }

  // Where the range should stop.
  const end = count + start;

  return new Observable(
    scheduler
      ? // The deprecated scheduled path.
        (subscriber) => {
          let n = start;
          return scheduler.schedule(function () {
            if (n < end) {
              subscriber.next(n++);
              this.schedule();
            } else {
              subscriber.complete();
            }
          });
        }
      : // Standard synchronous range.
        (subscriber) => {
          let n = start;
          while (n < end && !subscriber.closed) {
            subscriber.next(n++);
          }
          subscriber.complete();
        }
  );
}
