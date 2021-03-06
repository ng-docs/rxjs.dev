import { asyncScheduler } from '../scheduler/async';
import { audit } from './audit';
import { timer } from '../observable/timer';
import { MonoTypeOperatorFunction, SchedulerLike } from '../types';

/**
 * Ignores source values for `duration` milliseconds, then emits the most recent
 * value from the source Observable, then repeats this process.
 *
 * 在 `duration` 毫秒内忽略源值，然后从源 Observable 发送最新值，然后重复此过程。
 *
 * <span class="informal">When it sees a source value, it ignores that plus
 * the next ones for `duration` milliseconds, and then it emits the most recent
 * value from the source.</span>
 *
 * <span class="informal">当它看到一个源值时，它会在 `duration` 毫秒内忽略这些后续值，之后它再从源中发送最新的值。</span>
 *
 * ![](auditTime.png)
 *
 * `auditTime` is similar to `throttleTime`, but emits the last value from the
 * silenced time window, instead of the first value. `auditTime` emits the most
 * recent value from the source Observable on the output Observable as soon as
 * its internal timer becomes disabled, and ignores source values while the
 * timer is enabled. Initially, the timer is disabled. As soon as the first
 * source value arrives, the timer is enabled. After `duration` milliseconds (or
 * the time unit determined internally by the optional `scheduler`) has passed,
 * the timer is disabled, then the most recent source value is emitted on the
 * output Observable, and this process repeats for the next source value.
 * Optionally takes a {@link SchedulerLike} for managing timers.
 *
 * `auditTime` 类似于 `throttleTime`，但它会从静默时间窗口中发送最后一个值，而不是第一个。`auditTime` 在其内部计时器被禁用时会立即在输出 Observable 上发送来自源 Observable 的最新值，并在计时器被启用时忽略源值。最初，定时器被禁用。一旦第一个源值抵达，定时器就会被启用。在 `duration` 毫秒（或由可选的 `scheduler` 内部确定的时间单位）过去之后，计时器被禁用，然后在输出 Observable 上发送最近的源值，并且该过程对下一个源值重复。可以选择使用 {@link SchedulerLike} 来管理计时器。
 *
 * ## Example
 *
 * ## 例子
 *
 * Emit clicks at a rate of at most one click per second
 *
 * 以每秒最多一次的速度发送点击事件
 *
 * ```ts
 * import { fromEvent, auditTime } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(auditTime(1000));
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link audit}
 * @see {@link debounceTime}
 * @see {@link delay}
 * @see {@link sampleTime}
 * @see {@link throttleTime}
 * @param {number} duration Time to wait before emitting the most recent source
 * value, measured in milliseconds or the time unit determined internally
 * by the optional `scheduler`.
 *
 * 在发送最近的源值之前要等待的时间，其单位是毫秒或由可选 `scheduler` 内部确定的时间单位。
 *
 * @param {SchedulerLike} [scheduler=async] The {@link SchedulerLike} to use for
 * managing the timers that handle the rate-limiting behavior.
 *
 * 用于管理处理限速行为的定时器。
 *
 * @return A function that returns an Observable that performs rate-limiting of
 * emissions from the source Observable.
 *
 * 一个返回 Observable 的函数，该 Observable 会对来自源 Observable 进行发送速率的限制。
 *
 */
export function auditTime<T>(duration: number, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T> {
  return audit(() => timer(duration, scheduler));
}
