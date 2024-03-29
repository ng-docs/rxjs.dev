import { MonoTypeOperatorFunction, ObservableInput } from '../types';
import { operate } from '../util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/innerFrom';
import { noop } from '../util/noop';

/**
 * Emits the values emitted by the source Observable until a `notifier`
 * Observable emits a value.
 *
 * 发送源 Observable 发出的值，直到 `notifier` Observable 发出一个值。
 *
 * <span class="informal">Lets values pass until a second Observable,
 * `notifier`, emits a value. Then, it completes.</span>
 *
 * <span class="informal">传递值，直到第二个 Observable，`notifier` 发出一个值。然后，就完成它。</span>
 *
 * ![](takeUntil.png)
 *
 * `takeUntil` subscribes and begins mirroring the source Observable. It also
 * monitors a second Observable, `notifier` that you provide. If the `notifier`
 * emits a value, the output Observable stops mirroring the source Observable
 * and completes. If the `notifier` doesn't emit any value and completes
 * then `takeUntil` will pass all values.
 *
 * `takeUntil` 会订阅并开始镜像源 Observable。它还会监视你提供的第二个 Observable `notifier`。如果此 `notifier` 发出一个值，则输出 Observable 将停止镜像源 Observable 并完成。如果此 `notifier` 没有发出任何值并直接完成，则 `takeUntil` 将传递所有值。
 *
 * ## Example
 *
 * ## 例子
 *
 * Tick every second until the first click happens
 *
 * 每秒滴答一次，直到发生第一次点击
 *
 * ```ts
 * import { interval, fromEvent, takeUntil } from 'rxjs';
 *
 * const source = interval(1000);
 * const clicks = fromEvent(document, 'click');
 * const result = source.pipe(takeUntil(clicks));
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link take}
 * @see {@link takeLast}
 * @see {@link takeWhile}
 * @see {@link skip}
 * @param {Observable} notifier The Observable whose first emitted value will
 * cause the output Observable of `takeUntil` to stop emitting values from the
 * source Observable.
 *
 * Observable 发送的第一个值将导致 `takeUntil` 的输出 Observable 停止从源 Observable 发送值。
 *
 * @return A function that returns an Observable that emits the values from the
 * source Observable until `notifier` emits its first value.
 *
 * 一个返回 Observable 的函数，此 Observable 会从源 Observable 发送值，直到 `notifier` 发出了它的第一个值。
 *
 */
export function takeUntil<T>(notifier: ObservableInput<any>): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    innerFrom(notifier).subscribe(createOperatorSubscriber(subscriber, () => subscriber.complete(), noop));
    !subscriber.closed && source.subscribe(subscriber);
  });
}
