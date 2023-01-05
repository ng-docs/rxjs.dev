import { innerFrom } from '../observable/innerFrom';
import { MonoTypeOperatorFunction, ObservableInput } from '../types';
import { operate } from '../util/lift';
import { noop } from '../util/noop';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * Emits the most recently emitted value from the source Observable whenever
 * another Observable, the `notifier`, emits.
 *
 * 每当另一个 Observable（`notifier`）发送时，就会从源 Observable 发送最近发出的值。
 *
 * <span class="informal">It's like {@link sampleTime}, but samples whenever
 * the `notifier` `ObservableInput` emits something.</span>
 *
 * <span class="informal">它很像 {@link sampleTime}，但会在 `notifier` Observable 发送了某些东西时采样。</span>
 *
 * ![](sample.png)
 *
 * Whenever the `notifier` `ObservableInput` emits a value, `sample`
 * looks at the source Observable and emits whichever value it has most recently
 * emitted since the previous sampling, unless the source has not emitted
 * anything since the previous sampling. The `notifier` is subscribed to as soon
 * as the output Observable is subscribed.
 *
 * 每当此 `notifier` Observable 发出一个值时，`sample` 就会查看源 Observable 并发送自上次采样以来它最近发出的任何值，除非源自上次采样以来没有发送任何值。一旦订阅了输出 Observable，就会订阅此 `notifier`。
 *
 * ## Example
 *
 * ## 例子
 *
 * On every click, sample the most recent `seconds` timer
 *
 * 每次点击时，采样最近的 `seconds` 定时器
 *
 * ```ts
 * import { fromEvent, interval, sample } from 'rxjs';
 *
 * const seconds = interval(1000);
 * const clicks = fromEvent(document, 'click');
 * const result = seconds.pipe(sample(clicks));
 *
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link audit}
 * @see {@link debounce}
 * @see {@link sampleTime}
 * @see {@link throttle}
 * @param notifier The `ObservableInput` to use for sampling the
 * source Observable.
 *
 * 用于对源 Observable 进行采样的 Observable。
 *
 * @return A function that returns an Observable that emits the results of
 * sampling the values emitted by the source Observable whenever the notifier
 * Observable emits value or completes.
 *
 * 一个返回 Observable 的函数，当通知器 Observable 发送了值或完成时，它就会发送对源 Observable 发送的值进行采样的结果。
 *
 */
export function sample<T>(notifier: ObservableInput<any>): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let hasValue = false;
    let lastValue: T | null = null;
    source.subscribe(
      createOperatorSubscriber(subscriber, (value) => {
        hasValue = true;
        lastValue = value;
      })
    );
    innerFrom(notifier).subscribe(
      createOperatorSubscriber(
        subscriber,
        () => {
          if (hasValue) {
            hasValue = false;
            const value = lastValue!;
            lastValue = null;
            subscriber.next(value);
          }
        },
        noop
      )
    );
  });
}
