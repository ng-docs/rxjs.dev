import { Observable } from '../Observable';
import { MonoTypeOperatorFunction } from '../types';
import { operate } from '../util/lift';
import { noop } from '../util/noop';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Emits the most recently emitted value from the source Observable whenever
 * another Observable, the `notifier`, emits.
 *
 * 每当另一个 Observable（`notifier`）发出时，就会从源 Observable 发出最近发出的值。
 *
 * <span class="informal">It's like {@link sampleTime}, but samples whenever
 * the `notifier` Observable emits something.</span>
 *
 * <span class="informal">它就像 {@link sampleTime}，但只要 `notifier` Observable 发出一些东西就会采样。</span>
 *
 * ![](sample.png)
 *
 * Whenever the `notifier` Observable emits a value, `sample`
 * looks at the source Observable and emits whichever value it has most recently
 * emitted since the previous sampling, unless the source has not emitted
 * anything since the previous sampling. The `notifier` is subscribed to as soon
 * as the output Observable is subscribed.
 *
 * 每当 `notifier` Observable 发出一个值时，`sample` 就会查看源 Observable 并发出自上次采样以来它最近发出的任何值，除非源自上次采样以来没有发出任何值。一旦订阅了输出 Observable，`notifier` 程序就会被订阅。
 *
 * ## Example
 *
 * ## 例子
 *
 * On every click, sample the most recent `seconds` timer
 *
 * 每次点击时，采样最近的 `seconds` 计时器
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
 * @param notifier The Observable to use for sampling the
 * source Observable.
 *
 * 用于对源 Observable 进行采样的 Observable。
 *
 * @return A function that returns an Observable that emits the results of
 * sampling the values emitted by the source Observable whenever the notifier
 * Observable emits value or completes.
 *
 * 一个返回 Observable 的函数，当通知器 Observable 发出值或完成时，它发出对源 Observable 发出的值进行采样的结果。
 *
 */
export function sample<T>(notifier: Observable<any>): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let hasValue = false;
    let lastValue: T | null = null;
    source.subscribe(
      new OperatorSubscriber(subscriber, (value) => {
        hasValue = true;
        lastValue = value;
      })
    );
    const emit = () => {
      if (hasValue) {
        hasValue = false;
        const value = lastValue!;
        lastValue = null;
        subscriber.next(value);
      }
    };
    notifier.subscribe(new OperatorSubscriber(subscriber, emit, noop));
  });
}
