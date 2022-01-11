import { Observable } from '../Observable';
import { OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { noop } from '../util/noop';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Buffers the source Observable values until `closingNotifier` emits.
 *
 * 缓冲源 Observable 的值，直到 `closingNotifier` 发出了值才继续。
 *
 * <span class="informal">Collects values from the past as an array, and emits
 * that array only when another Observable emits.</span>
 *
 * <span class="informal">将已过去的值收集为一个数组，并仅当另一个 Observable 发出了值后才发送该数组。</span>
 *
 * ![](buffer.png)
 *
 * Buffers the incoming Observable values until the given `closingNotifier`
 * Observable emits a value, at which point it emits the buffer on the output
 * Observable and starts a new buffer internally, awaiting the next time
 * `closingNotifier` emits.
 *
 * 缓冲传入的 Observable 值，直到给定的 `closingNotifier` Observable 发出了一个值，此时它会在输出 Observable 上发送缓冲区并在内部启动一个新的缓冲区，等待 `closingNotifier` 发出下一个值。
 *
 * ## Example
 *
 * ## 例子
 *
 * On every click, emit array of most recent interval events
 *
 * 每次点击时，发送最近间隔期间所有事件的数组
 *
 * ```ts
 * import { fromEvent, interval, buffer } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const intervalEvents = interval(1000);
 * const buffered = intervalEvents.pipe(buffer(clicks));
 * buffered.subscribe(x => console.log(x));
 * ```
 * @see {@link bufferCount}
 * @see {@link bufferTime}
 * @see {@link bufferToggle}
 * @see {@link bufferWhen}
 * @see {@link window}
 * @param {Observable<any>} closingNotifier An Observable that signals the
 * buffer to be emitted on the output Observable.
 *
 * 一个 Observable，它指示何时要在输出 Observable 上发送缓冲区。
 *
 * @return A function that returns an Observable of buffers, which are arrays
 * of values.
 *
 * 一个返回 Observable 的函数，该 Observable 的值是一些缓冲区构成的数组。
 *
 */
export function buffer<T>(closingNotifier: Observable<any>): OperatorFunction<T, T[]> {
  return operate((source, subscriber) => {
    // The current buffered values.
    let currentBuffer: T[] = [];

    // Subscribe to our source.
    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value) => currentBuffer.push(value),
        () => {
          subscriber.next(currentBuffer);
          subscriber.complete();
        }
      )
    );

    // Subscribe to the closing notifier.
    closingNotifier.subscribe(
      new OperatorSubscriber(
        subscriber,
        () => {
          // Start a new buffer and emit the previous one.
          const b = currentBuffer;
          currentBuffer = [];
          subscriber.next(b);
        },
        noop
      )
    );

    return () => {
      // Ensure buffered values are released on teardown.
      currentBuffer = null!;
    };
  });
}
