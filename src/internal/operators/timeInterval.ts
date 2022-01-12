import { Observable } from '../Observable';
import { asyncScheduler } from '../scheduler/async';
import { SchedulerLike, OperatorFunction } from '../types';
import { scan } from './scan';
import { defer } from '../observable/defer';
import { map } from './map';

/**
 * Emits an object containing the current value, and the time that has
 * passed between emitting the current value and the previous value, which is
 * calculated by using the provided `scheduler`'s `now()` method to retrieve
 * the current time at each emission, then calculating the difference. The `scheduler`
 * defaults to {@link asyncScheduler}, so by default, the `interval` will be in
 * milliseconds.
 *
 * 发射一个包含当前值的对象，以及发射当前值和前一个值之间经过的时间，这是通过使用提供的 `scheduler` 的 `now()` 方法在每次发射时检索当前时间来计算的，然后计算不同之处。 `scheduler` 默认为 {@link asyncScheduler}，因此默认情况下， `interval` 将以毫秒为单位。
 *
 * <span class="informal">Convert an Observable that emits items into one that
 * emits indications of the amount of time elapsed between those emissions.</span>
 *
 * <span class="informal">将发出项目的 Observable 转换为发出这些发射之间经过的时间量指示的 Observable。</span>
 *
 * ![](timeInterval.png)
 *
 * ## Example
 *
 * ## 例子
 *
 * Emit interval between current value with the last value
 *
 * 当前值与上一个值之间的发射间隔
 *
 * ```ts
 * import { interval, timeInterval } from 'rxjs';
 *
 * const seconds = interval(1000);
 *
 * seconds
 *   .pipe(timeInterval())
 *   .subscribe(value => console.log(value));
 *
 * // NOTE: The values will never be this precise,
 * // intervals created with `interval` or `setInterval`
 * // are non-deterministic.
 *
 * // { value: 0, interval: 1000 }
 * // { value: 1, interval: 1000 }
 * // { value: 2, interval: 1000 }
 * ```
 * @param {SchedulerLike} [scheduler] Scheduler used to get the current time.
 * @return A function that returns an Observable that emits information about
 * value and interval.
 *
 * 一个返回 Observable 的函数，该 Observable 发出有关值和间隔的信息。
 *
 */
export function timeInterval<T>(scheduler: SchedulerLike = asyncScheduler): OperatorFunction<T, TimeInterval<T>> {
  return (source: Observable<T>) =>
    defer(() => {
      return source.pipe(
        // TODO(benlesh): correct these typings.
        scan(({ current }, value) => ({ value, current: scheduler.now(), last: current }), {
          current: scheduler.now(),
          value: undefined,
          last: undefined,
        } as any) as OperatorFunction<T, any>,
        map<any, TimeInterval<T>>(({ current, last, value }) => new TimeInterval(value, current - last))
      );
    });
}

// TODO(benlesh): make this an interface, export the interface, but not the implemented class,
// there's no reason users should be manually creating this type.

export class TimeInterval<T> {
  /**
   * @deprecated Internal implementation detail, do not construct directly. Will be made an interface in v8.
   *
   * 内部实现细节，不直接构造。将在 v8 中制作一个接口。
   *
   */
  constructor(public value: T, public interval: number) {}
}
