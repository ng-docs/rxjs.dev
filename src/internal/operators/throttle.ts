import { Subscription } from '../Subscription';

import { MonoTypeOperatorFunction, ObservableInput } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/innerFrom';

export interface ThrottleConfig {
  leading?: boolean;
  trailing?: boolean;
}

export const defaultThrottleConfig: ThrottleConfig = {
  leading: true,
  trailing: false,
};

/**
 * Emits a value from the source Observable, then ignores subsequent source
 * values for a duration determined by another Observable, then repeats this
 * process.
 *
 * 从源 Observable 发出一个值，然后在由另一个 Observable 确定的持续时间内忽略后续源值，然后重复此过程。
 *
 * <span class="informal">It's like {@link throttleTime}, but the silencing
 * duration is determined by a second Observable.</span>
 *
 * 就像 {@link throttleTime}，但静音持续时间由第二个 Observable 决定。
 *
 * ![](throttle.svg)
 *
 * `throttle` emits the source Observable values on the output Observable
 * when its internal timer is disabled, and ignores source values when the timer
 * is enabled. Initially, the timer is disabled. As soon as the first source
 * value arrives, it is forwarded to the output Observable, and then the timer
 * is enabled by calling the `durationSelector` function with the source value,
 * which returns the "duration" Observable. When the duration Observable emits a
 * value, the timer is disabled, and this process repeats for the
 * next source value.
 *
 * 当内部定时器被禁用时， `throttle` 在输出 Observable 上发出源 Observable 值，并在启用定时器时忽略源值。最初，定时器被禁用。一旦第一个源值到达，它就会被转发到输出 Observable，然后通过使用源值调用 `durationSelector` 函数来启用计时器，该函数返回“duration” Observable。当持续时间 Observable 发出一个值时，定时器被禁用，并且这个过程重复下一个源值。
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
 * import { fromEvent, throttle, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(throttle(() => interval(1000)));
 *
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link audit}
 * @see {@link debounce}
 * @see {@link delayWhen}
 * @see {@link sample}
 * @see {@link throttleTime}
 * @param durationSelector A function
 * that receives a value from the source Observable, for computing the silencing
 * duration for each source value, returned as an Observable or a Promise.
 *
 * 从源 Observable 接收值的函数，用于计算每个源值的静默持续时间，返回为 Observable 或 Promise。
 *
 * @param config a configuration object to define `leading` and `trailing` behavior. Defaults
 * to `{ leading: true, trailing: false }`.
 *
 * 用于定义 `leading` 和 `trailing` 行为的配置对象。默认为 `{ leading: true, trailing: false }` 。
 *
 * @return A function that returns an Observable that performs the throttle
 * operation to limit the rate of emissions from the source.
 *
 * 一个返回 Observable 的函数，该 Observable 执行节流操作以限制源的排放率。
 *
 */
export function throttle<T>(
  durationSelector: (value: T) => ObservableInput<any>,
  config: ThrottleConfig = defaultThrottleConfig
): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    const { leading, trailing } = config;
    let hasValue = false;
    let sendValue: T | null = null;
    let throttled: Subscription | null = null;
    let isComplete = false;

    const endThrottling = () => {
      throttled?.unsubscribe();
      throttled = null;
      if (trailing) {
        send();
        isComplete && subscriber.complete();
      }
    };

    const cleanupThrottling = () => {
      throttled = null;
      isComplete && subscriber.complete();
    };

    const startThrottle = (value: T) =>
      (throttled = innerFrom(durationSelector(value)).subscribe(new OperatorSubscriber(subscriber, endThrottling, cleanupThrottling)));

    const send = () => {
      if (hasValue) {
        // Ensure we clear out our value and hasValue flag
        // before we emit, otherwise reentrant code can cause
        // issues here.
        hasValue = false;
        const value = sendValue!;
        sendValue = null;
        // Emit the value.
        subscriber.next(value);
        !isComplete && startThrottle(value);
      }
    };

    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        // Regarding the presence of throttled.closed in the following
        // conditions, if a synchronous duration selector is specified - weird,
        // but legal - an already-closed subscription will be assigned to
        // throttled, so the subscription's closed property needs to be checked,
        // too.
        (value) => {
          hasValue = true;
          sendValue = value;
          !(throttled && !throttled.closed) && (leading ? send() : startThrottle(value));
        },
        () => {
          isComplete = true;
          !(trailing && hasValue && throttled && !throttled.closed) && subscriber.complete();
        }
      )
    );
  });
}
