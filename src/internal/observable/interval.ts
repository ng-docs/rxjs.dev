import { Observable } from '../Observable';
import { asyncScheduler } from '../scheduler/async';
import { SchedulerLike } from '../types';
import { timer } from './timer';

/**
 * Creates an Observable that emits sequential numbers every specified
 * interval of time, on a specified {@link SchedulerLike}.
 *
 * 创建一个 Observable，它在指定的 {@link SchedulerLike} 上每隔指定的时间间隔发出序列号。
 *
 * <span class="informal">Emits incremental numbers periodically in time.</span>
 *
 * 及时定期发出增量数字。
 *
 * ![](interval.png)
 *
 * `interval` returns an Observable that emits an infinite sequence of
 * ascending integers, with a constant interval of time of your choosing
 * between those emissions. The first emission is not sent immediately, but
 * only after the first period has passed. By default, this operator uses the
 * `async` {@link SchedulerLike} to provide a notion of time, but you may pass any
 * {@link SchedulerLike} to it.
 *
 * `interval` 返回一个 Observable，它发出无限的递增整数序列，在这些发射之间有一个恒定的时间间隔。第一个发射不会立即发送，而是在第一个周期过去后发送。默认情况下，此运算符使用 `async` {@link SchedulerLike} 来提供时间概念，但你可以将任何 {@link SchedulerLike} 传递给它。
 *
 * ## Example
 *
 * ## 例子
 *
 * Emits ascending numbers, one every second (1000ms) up to the number 3
 *
 * 发射升序数字，每秒一个（1000 毫秒）直到数字 3
 *
 * ```ts
 * import { interval, take } from 'rxjs';
 *
 * const numbers = interval(1000);
 *
 * const takeFourNumbers = numbers.pipe(take(4));
 *
 * takeFourNumbers.subscribe(x => console.log('Next: ', x));
 *
 * // Logs:
 * // Next: 0
 * // Next: 1
 * // Next: 2
 * // Next: 3
 * ```
 * @see {@link timer}
 * @see {@link delay}
 * @param {number} [period=0] The interval size in milliseconds (by default)
 * or the time unit determined by the scheduler's clock.
 * @param {SchedulerLike} [scheduler=async] The {@link SchedulerLike} to use for scheduling
 * the emission of values, and providing a notion of "time".
 *
 * 用于调度值的发射，并提供“时间”的概念。
 *
 * @return {Observable} An Observable that emits a sequential number each time
 * interval.
 *
 * 每个时间间隔发出一个序列号的 Observable。
 *
 */
export function interval(period = 0, scheduler: SchedulerLike = asyncScheduler): Observable<number> {
  if (period < 0) {
    // We cannot schedule an interval in the past.
    period = 0;
  }

  return timer(period, period, scheduler);
}
