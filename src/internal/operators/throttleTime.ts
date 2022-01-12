import { asyncScheduler } from '../scheduler/async';
import { defaultThrottleConfig, throttle } from './throttle';
import { MonoTypeOperatorFunction, SchedulerLike } from '../types';
import { timer } from '../observable/timer';

/**
 * Emits a value from the source Observable, then ignores subsequent source
 * values for `duration` milliseconds, then repeats this process.
 *
 * 从源 Observable 发出一个值，然后在 `duration` 毫秒内忽略后续源值，然后重复此过程。
 *
 * <span class="informal">Lets a value pass, then ignores source values for the
 * next `duration` milliseconds.</span>
 *
 * <span class="informal">让一个值通过，然后在下一个 `duration` 毫秒内忽略源值。</span>
 *
 * ![](throttleTime.png)
 *
 * `throttleTime` emits the source Observable values on the output Observable
 * when its internal timer is disabled, and ignores source values when the timer
 * is enabled. Initially, the timer is disabled. As soon as the first source
 * value arrives, it is forwarded to the output Observable, and then the timer
 * is enabled. After `duration` milliseconds (or the time unit determined
 * internally by the optional `scheduler`) has passed, the timer is disabled,
 * and this process repeats for the next source value. Optionally takes a
 * {@link SchedulerLike} for managing timers.
 *
 * 当内部定时器被禁用时， `throttleTime` 在输出 Observable 上发出源 Observable 值，并在定时器启用时忽略源值。最初，定时器被禁用。一旦第一个源值到达，它就会被转发到输出 Observable，然后启用计时器。在 `duration` 毫秒（或由可选的 `scheduler` 内部确定的时间单位）过去之后，定时器被禁用，并且该过程对下一个源值重复。可以选择使用 {@link SchedulerLike} 来管理计时器。
 *
 * ## Examples
 *
 * ## 例子
 *
 * ### Limit click rate
 *
 * ### 限制点击率
 *
 * Emit clicks at a rate of at most one click per second
 *
 * 以每秒最多一次点击的速度发出点击
 *
 * ```ts
 * import { fromEvent, throttleTime } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(throttleTime(1000));
 *
 * result.subscribe(x => console.log(x));
 * ```
 *
 * ### Double Click
 *
 * ### 双击
 *
 * The following example only emits clicks which happen within a subsequent
 * delay of 400ms of the previous click. This for example can emulate a double
 * click. It makes use of the `trailing` parameter of the throttle configuration.
 *
 * 以下示例仅发出在前一次点击的 400 毫秒后续延迟内发生的点击。例如，这可以模拟双击。它利用油门配置的 `trailing` 参数。
 *
 * ```ts
 * import { fromEvent, throttleTime, asyncScheduler } from 'rxjs';
 *
 * // defaultThrottleConfig = { leading: true, trailing: false };
 * const throttleConfig = {
 *   leading: false,
 *   trailing: true
 * };
 *
 * const click = fromEvent(document, 'click');
 * const doubleClick = click.pipe(
 *   throttleTime(400, asyncScheduler, throttleConfig)
 * );
 *
 * doubleClick.subscribe(event => {
 *   console.log(`Double-clicked! Timestamp: ${ event.timeStamp }`);
 * });
 * ```
 *
 * If you enable the `leading` parameter in this example, the output would be the primary click and
 * the double click, but restricts additional clicks within 400ms.
 *
 * 如果你在此示例中启用了 `leading` 参数，则输出将是主要单击和双击，但限制在 400 毫秒内的其他单击。
 *
 * @see {@link auditTime}
 * @see {@link debounceTime}
 * @see {@link delay}
 * @see {@link sampleTime}
 * @see {@link throttle}
 * @param duration Time to wait before emitting another value after
 * emitting the last value, measured in milliseconds or the time unit determined
 * internally by the optional `scheduler`.
 *
 * 在发出最后一个值之后，在发出另一个值之前等待的时间，以毫秒或由可选 `scheduler` 内部确定的时间单位为单位。
 *
 * @param scheduler The {@link SchedulerLike} to use for
 * managing the timers that handle the throttling. Defaults to {@link asyncScheduler}.
 *
 * {@link SchedulerLike} 用于管理处理限制的计时器。默认为 {@link asyncScheduler}。
 *
 * @param config a configuration object to define `leading` and
 * `trailing` behavior. Defaults to `{ leading: true, trailing: false }`.
 *
 * 用于定义 `leading` 和 `trailing` 行为的配置对象。默认为 `{ leading: true, trailing: false }` 。
 *
 * @return A function that returns an Observable that performs the throttle
 * operation to limit the rate of emissions from the source.
 *
 * 一个返回 Observable 的函数，该 Observable 执行节流操作以限制源的排放率。
 *
 */
export function throttleTime<T>(
  duration: number,
  scheduler: SchedulerLike = asyncScheduler,
  config = defaultThrottleConfig
): MonoTypeOperatorFunction<T> {
  const duration$ = timer(duration, scheduler);
  return throttle(() => duration$, config);
}
