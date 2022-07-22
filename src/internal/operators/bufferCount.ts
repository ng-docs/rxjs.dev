import { OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { arrRemove } from '../util/arrRemove';

/**
 * Buffers the source Observable values until the size hits the maximum
 * `bufferSize` given.
 *
 * 缓冲源 Observable 值，直到大小达到给定的最大 `bufferSize`。
 *
 * <span class="informal">Collects values from the past as an array, and emits
 * that array only when its size reaches `bufferSize`.</span>
 *
 * <span class="informal">将过去的值收集为一个数组，并仅在其大小达到 `bufferSize` 时发送该数组。</span>
 *
 * ![](bufferCount.png)
 *
 * Buffers a number of values from the source Observable by `bufferSize` then
 * emits the buffer and clears it, and starts a new buffer each
 * `startBufferEvery` values. If `startBufferEvery` is not provided or is
 * `null`, then new buffers are started immediately at the start of the source
 * and when each buffer closes and is emitted.
 *
 * 通过 `bufferSize` 缓冲来自源 Observable 的多个值，然后发送缓冲区并清除它，并且每过 `startBufferEvery` 次就启动一个新缓冲区。如果 `startBufferEvery` 未提供或为 `null`，则新缓冲区会在源开始处以及每个缓冲区关闭并发送时启动新缓冲区。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Emit the last two click events as an array
 *
 * 将最后两个点击事件作为数组进行发送
 *
 * ```ts
 * import { fromEvent, bufferCount } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferCount(2));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * On every click, emit the last two click events as an array
 *
 * 每次单击时，将最后两个单击事件作为数组发送
 *
 * ```ts
 * import { fromEvent, bufferCount } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferCount(2, 1));
 * buffered.subscribe(x => console.log(x));
 * ```
 * @see {@link buffer}
 * @see {@link bufferTime}
 * @see {@link bufferToggle}
 * @see {@link bufferWhen}
 * @see {@link pairwise}
 * @see {@link windowCount}
 * @param {number} bufferSize The maximum size of the buffer emitted.
 *
 * 发送的缓冲区的最大大小。
 *
 * @param {number} [startBufferEvery] Interval at which to start a new buffer.
 * For example if `startBufferEvery` is `2`, then a new buffer will be started
 * on every other value from the source. A new buffer is started at the
 * beginning of the source by default.
 *
 * 用于开始新缓冲区的时间间隔。例如，如果 `startBufferEvery` 是 `2` ，那么将在源的每个其他值上启动一个新缓冲区。默认情况下，会在源的开头启动一个新缓冲区。
 *
 * @return A function that returns an Observable of arrays of buffered values.
 *
 * 一个返回 Observable 的函数，该 Observable 的值是一些缓冲区构成的数组。
 *
 */
export function bufferCount<T>(bufferSize: number, startBufferEvery: number | null = null): OperatorFunction<T, T[]> {
  // If no `startBufferEvery` value was supplied, then we're
  // opening and closing on the bufferSize itself.
  startBufferEvery = startBufferEvery ?? bufferSize;

  return operate((source, subscriber) => {
    let buffers: T[][] = [];
    let count = 0;

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        (value) => {
          let toEmit: T[][] | null = null;

          // Check to see if we need to start a buffer.
          // This will start one at the first value, and then
          // a new one every N after that.
          if (count++ % startBufferEvery! === 0) {
            buffers.push([]);
          }

          // Push our value into our active buffers.
          for (const buffer of buffers) {
            buffer.push(value);
            // Check to see if we're over the bufferSize
            // if we are, record it so we can emit it later.
            // If we emitted it now and removed it, it would
            // mutate the `buffers` array while we're looping
            // over it.
            if (bufferSize <= buffer.length) {
              toEmit = toEmit ?? [];
              toEmit.push(buffer);
            }
          }

          if (toEmit) {
            // We have found some buffers that are over the
            // `bufferSize`. Emit them, and remove them from our
            // buffers list.
            for (const buffer of toEmit) {
              arrRemove(buffers, buffer);
              subscriber.next(buffer);
            }
          }
        },
        () => {
          // When the source completes, emit all of our
          // active buffers.
          for (const buffer of buffers) {
            subscriber.next(buffer);
          }
          subscriber.complete();
        },
        // Pass all errors through to consumer.
        undefined,
        () => {
          // Clean up our memory when we finalize
          buffers = null!;
        }
      )
    );
  });
}
