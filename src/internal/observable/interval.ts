import { Observable } from '../Observable';
import { asyncScheduler } from '../scheduler/async';
import { SchedulerLike } from '../types';
import { timer } from './timer';

/**
 * Creates an Observable that emits sequential numbers every specified
 * interval of time, on a specified {@link SchedulerLike}.
 *
 * 创建一个 Observable，它在指定的 {@link SchedulerLike} 上按照指定的时间间隔发送连续数列。
 *
 * <span class="informal">Emits incremental numbers periodically in time.</span>
 *
 * <span class="informal">定期发送增量数字。</span>
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
 * `interval` 会返回一个 Observable，它发送一个无限递增的整数序列，在这些发送之间有一个恒定的时间间隔。首次发送不会立即发出，而是在第一个周期过去后发出。默认情况下，此操作符使用 `async` {@link SchedulerLike} 来提供时间概念，但你也可以将任何 {@link SchedulerLike} 传给它。
 *
 * ## Example
 *
 * ## 例子
 *
 * Emits ascending numbers, one every second (1000ms) up to the number 3
 *
 * 发送升序数字，每秒一个（1000 毫秒）直到数字 3
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
 *
 * 以毫秒为单位的间隔大小（默认情况下）或由调度器的时钟确定的时间单位。
 *
 * @param {SchedulerLike} [scheduler=async] The {@link SchedulerLike} to use for scheduling
 * the emission of values, and providing a notion of "time".
 *
 * 用于调度值的发送，并提供“时间”的概念。
 *
 * @return {Observable} An Observable that emits a sequential number each time
 * interval.
 *
 * 每个时间间隔发送一个有序数字的 Observable。
 *
 */
export function interval(period = 0, scheduler: SchedulerLike = asyncScheduler): Observable<number> {
  if (period < 0) {
    // We cannot schedule an interval in the past.
    period = 0;
  }

  return timer(period, period, scheduler);
}
