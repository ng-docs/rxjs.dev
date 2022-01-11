import { Subscription } from '../Subscription';
import { OperatorFunction, ObservableInput } from '../types';
import { operate } from '../util/lift';
import { innerFrom } from '../observable/innerFrom';
import { OperatorSubscriber } from './OperatorSubscriber';
import { noop } from '../util/noop';
import { arrRemove } from '../util/arrRemove';

/**
 * Buffers the source Observable values starting from an emission from
 * `openings` and ending when the output of `closingSelector` emits.
 *
 * 缓冲源 Observable 值，从 `openings` 的发射开始，到 `closingSelector` 的输出发射时结束。
 *
 * <span class="informal">Collects values from the past as an array. Starts
 * collecting only when `opening` emits, and calls the `closingSelector`
 * function to get an Observable that tells when to close the buffer.</span>
 *
 * 将过去的值作为数组收集。仅在 `opening` 发出时开始收集，并调用 `closingSelector` 函数以获取一个告诉何时关闭缓冲区的 Observable。
 *
 * ![](bufferToggle.png)
 *
 * Buffers values from the source by opening the buffer via signals from an
 * Observable provided to `openings`, and closing and sending the buffers when
 * a Subscribable or Promise returned by the `closingSelector` function emits.
 *
 * 通过提供给 `openings` 的 Observable 的信号打开缓冲区，并在 `closingSelector` 函数返回的 Subscribable 或 Promise 发出时关闭和发送缓冲区，从而缓冲来自源的值。
 *
 * ## Example
 *
 * ## 例子
 *
 * Every other second, emit the click events from the next 500ms
 *
 * 每隔一秒，从接下来的 500 毫秒发出点击事件
 *
 * ```ts
 * import { fromEvent, interval, bufferToggle, EMPTY } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const openings = interval(1000);
 * const buffered = clicks.pipe(bufferToggle(openings, i =>
 *   i % 2 ? interval(500) : EMPTY
 * ));
 * buffered.subscribe(x => console.log(x));
 * ```
 * @see {@link buffer}
 * @see {@link bufferCount}
 * @see {@link bufferTime}
 * @see {@link bufferWhen}
 * @see {@link windowToggle}
 * @param openings A Subscribable or Promise of notifications to start new
 * buffers.
 *
 * 用于启动新缓冲区的通知的订阅或承诺。
 *
 * @param closingSelector A function that takes
 * the value emitted by the `openings` observable and returns a Subscribable or Promise,
 * which, when it emits, signals that the associated buffer should be emitted
 * and cleared.
 *
 * 一个函数，它获取由可观察的 `openings` 发出的值并返回一个 Subscribable 或 Promise，当它发出时，表示应该发出并清除关联的缓冲区。
 *
 * @return A function that returns an Observable of arrays of buffered values.
 *
 * 返回缓冲值数组的 Observable 的函数。
 *
 */
export function bufferToggle<T, O>(
  openings: ObservableInput<O>,
  closingSelector: (value: O) => ObservableInput<any>
): OperatorFunction<T, T[]> {
  return operate((source, subscriber) => {
    const buffers: T[][] = [];

    // Subscribe to the openings notifier first
    innerFrom(openings).subscribe(
      new OperatorSubscriber(
        subscriber,
        (openValue) => {
          const buffer: T[] = [];
          buffers.push(buffer);
          // We use this composite subscription, so that
          // when the closing notifier emits, we can tear it down.
          const closingSubscription = new Subscription();

          const emitBuffer = () => {
            arrRemove(buffers, buffer);
            subscriber.next(buffer);
            closingSubscription.unsubscribe();
          };

          // The line below will add the subscription to the parent subscriber *and* the closing subscription.
          closingSubscription.add(innerFrom(closingSelector(openValue)).subscribe(new OperatorSubscriber(subscriber, emitBuffer, noop)));
        },
        noop
      )
    );

    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value) => {
          // Value from our source. Add it to all pending buffers.
          for (const buffer of buffers) {
            buffer.push(value);
          }
        },
        () => {
          // Source complete. Emit all pending buffers.
          while (buffers.length > 0) {
            subscriber.next(buffers.shift()!);
          }
          subscriber.complete();
        }
      )
    );
  });
}
