import { Subscriber } from '../Subscriber';
import { MonoTypeOperatorFunction, ObservableInput } from '../types';

import { operate } from '../util/lift';
import { innerFrom } from '../observable/innerFrom';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Ignores source values for a duration determined by another Observable, then
 * emits the most recent value from the source Observable, then repeats this
 * process.
 *
 * 在由另一个 Observable 确定的持续时间内忽略源值，然后从源 Observable 发出最新值，然后重复此过程。
 *
 * <span class="informal">It's like {@link auditTime}, but the silencing
 * duration is determined by a second Observable.</span>
 *
 * <span class="informal">就像 {@link auditTime}，但静音持续时间由第二个 Observable 决定。</span>
 *
 * ![](audit.svg)
 *
 * `audit` is similar to `throttle`, but emits the last value from the silenced
 * time window, instead of the first value. `audit` emits the most recent value
 * from the source Observable on the output Observable as soon as its internal
 * timer becomes disabled, and ignores source values while the timer is enabled.
 * Initially, the timer is disabled. As soon as the first source value arrives,
 * the timer is enabled by calling the `durationSelector` function with the
 * source value, which returns the "duration" Observable. When the duration
 * Observable emits a value, the timer is disabled, then the most
 * recent source value is emitted on the output Observable, and this process
 * repeats for the next source value.
 *
 * `audit` 类似于 `throttle`，但从静音时间窗口发出最后一个值，而不是第一个值。`audit` 会在其内部计时器禁用后立即在输出 Observable 上发出来自源 Observable 的最新值，并在启用计时器时忽略源值。最初，定时器被禁用。一旦第一个源值到达，通过使用源值调用 `durationSelector` 函数来启用计时器，该函数返回“duration” Observable。当持续时间 Observable 发出一个值时，计时器被禁用，然后在输出 Observable 上发出最近的源值，并且对于下一个源值重复此过程。
 *
 * ## Example
 *
 * ## 例子
 *
 * Emit clicks at a rate of at most one click per second
 *
 * 以每秒最多一次点击的速度发出点击
 *
 * ```ts
 * import { fromEvent, audit, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(audit(ev => interval(1000)));
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link auditTime}
 * @see {@link debounce}
 * @see {@link delayWhen}
 * @see {@link sample}
 * @see {@link throttle}
 * @param durationSelector A function
 * that receives a value from the source Observable, for computing the silencing
 * duration, returned as an Observable or a Promise.
 *
 * 一个从源 Observable 接收值的函数，用于计算静默持续时间，以 Observable 或 Promise 的形式返回。
 *
 * @return A function that returns an Observable that performs rate-limiting of
 * emissions from the source Observable.
 *
 * 一个返回 Observable 的函数，该函数执行来自源 Observable 的发射速率限制。
 *
 */
export function audit<T>(durationSelector: (value: T) => ObservableInput<any>): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let hasValue = false;
    let lastValue: T | null = null;
    let durationSubscriber: Subscriber<any> | null = null;
    let isComplete = false;

    const endDuration = () => {
      durationSubscriber?.unsubscribe();
      durationSubscriber = null;
      if (hasValue) {
        hasValue = false;
        const value = lastValue!;
        lastValue = null;
        subscriber.next(value);
      }
      isComplete && subscriber.complete();
    };

    const cleanupDuration = () => {
      durationSubscriber = null;
      isComplete && subscriber.complete();
    };

    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value) => {
          hasValue = true;
          lastValue = value;
          if (!durationSubscriber) {
            innerFrom(durationSelector(value)).subscribe(
              (durationSubscriber = new OperatorSubscriber(subscriber, endDuration, cleanupDuration))
            );
          }
        },
        () => {
          isComplete = true;
          (!hasValue || !durationSubscriber || durationSubscriber.closed) && subscriber.complete();
        }
      )
    );
  });
}
