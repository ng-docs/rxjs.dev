import { Subscriber } from '../Subscriber';
import { ObservableInput, OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { noop } from '../util/noop';
import { OperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/innerFrom';

/**
 * Buffers the source Observable values, using a factory function of closing
 * Observables to determine when to close, emit, and reset the buffer.
 *
 * 缓冲源 Observable 值，使用关闭 Observables 的工厂函数来确定何时关闭、发出和重置缓冲区。
 *
 * <span class="informal">Collects values from the past as an array. When it
 * starts collecting values, it calls a function that returns an Observable that
 * tells when to close the buffer and restart collecting.</span>
 *
 * <span class="informal">将过去的值作为数组收集。当它开始收集值时，它会调用一个返回 Observable 的函数，该函数告诉何时关闭缓冲区并重新开始收集。</span>
 *
 * ![](bufferWhen.png)
 *
 * Opens a buffer immediately, then closes the buffer when the observable
 * returned by calling `closingSelector` function emits a value. When it closes
 * the buffer, it immediately opens a new buffer and repeats the process.
 *
 * 立即打开一个缓冲区，然后在调用 `closingSelector` 函数返回的 observable 发出一个值时关闭缓冲区。当它关闭缓冲区时，它会立即打开一个新缓冲区并重复该过程。
 *
 * ## Example
 *
 * ## 例子
 *
 * Emit an array of the last clicks every [1-5] random seconds
 *
 * 每[1-5][1-5]秒随机发出最后一次点击的数组
 *
 * ```ts
 * import { fromEvent, bufferWhen, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(
 *   bufferWhen(() => interval(1000 + Math.random() * 4000))
 * );
 * buffered.subscribe(x => console.log(x));
 * ```
 * @see {@link buffer}
 * @see {@link bufferCount}
 * @see {@link bufferTime}
 * @see {@link bufferToggle}
 * @see {@link windowWhen}
 * @param {function(): Observable} closingSelector A function that takes no
 * arguments and returns an Observable that signals buffer closure.
 *
 * 一个不接受参数并返回一个指示缓冲区关闭的 Observable 的函数。
 *
 * @return A function that returns an Observable of arrays of buffered values.
 *
 * 返回缓冲值数组的 Observable 的函数。
 *
 */
export function bufferWhen<T>(closingSelector: () => ObservableInput<any>): OperatorFunction<T, T[]> {
  return operate((source, subscriber) => {
    // The buffer we keep and emit.
    let buffer: T[] | null = null;
    // A reference to the subscriber used to subscribe to
    // the closing notifier. We need to hold this so we can
    // end the subscription after the first notification.
    let closingSubscriber: Subscriber<T> | null = null;

    // Ends the previous closing notifier subscription, so it
    // terminates after the first emission, then emits
    // the current buffer  if there is one, starts a new buffer, and starts a
    // new closing notifier.
    const openBuffer = () => {
      // Make sure to teardown the closing subscription, we only cared
      // about one notification.
      closingSubscriber?.unsubscribe();
      // emit the buffer if we have one, and start a new buffer.
      const b = buffer;
      buffer = [];
      b && subscriber.next(b);

      // Get a new closing notifier and subscribe to it.
      innerFrom(closingSelector()).subscribe((closingSubscriber = new OperatorSubscriber(subscriber, openBuffer, noop)));
    };

    // Start the first buffer.
    openBuffer();

    // Subscribe to our source.
    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        // Add every new value to the current buffer.
        (value) => buffer?.push(value),
        // When we complete, emit the buffer if we have one,
        // then complete the result.
        () => {
          buffer && subscriber.next(buffer);
          subscriber.complete();
        },
        // Pass all errors through to consumer.
        undefined,
        // Release memory on teardown
        () => (buffer = closingSubscriber = null!)
      )
    );
  });
}
