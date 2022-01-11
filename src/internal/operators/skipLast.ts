import { MonoTypeOperatorFunction } from '../types';
import { identity } from '../util/identity';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Skip a specified number of values before the completion of an observable.
 *
 * 在完成 observable 之前跳过指定数量的值。
 *
 * ![](skipLast.png)
 *
 * Returns an observable that will emit values as soon as it can, given a number of
 * skipped values. For example, if you `skipLast(3)` on a source, when the source
 * emits its fourth value, the first value the source emitted will finally be emitted
 * from the returned observable, as it is no longer part of what needs to be skipped.
 *
 * 返回一个 observable，它会尽快发出值，给定一些跳过的值。例如，如果你在源上 `skipLast(3)`，当源发出其第四个值时，源发出的第一个值最终将从返回的 observable 中发出，因为它不再是需要跳过的一部分。
 *
 * All values emitted by the result of `skipLast(N)` will be delayed by `N` emissions,
 * as each value is held in a buffer until enough values have been emitted that that
 * the buffered value may finally be sent to the consumer.
 *
 * `skipLast(N)` 的结果发出的所有值都将延迟 `N` 个发射，因为每个值都保存在缓冲区中，直到发出足够的值，缓冲的值最终可以发送给消费者。
 *
 * After subscribing, unsubscribing will not result in the emission of the buffered
 * skipped values.
 *
 * 订阅后，取消订阅不会导致发送缓冲的跳过值。
 *
 * ## Example
 *
 * ## 例子
 *
 * Skip the last 2 values of an observable with many values
 *
 * 跳过具有许多值的 observable 的最后 2 个值
 *
 * ```ts
 * import { of, skipLast } from 'rxjs';
 *
 * const numbers = of(1, 2, 3, 4, 5);
 * const skipLastTwo = numbers.pipe(skipLast(2));
 * skipLastTwo.subscribe(x => console.log(x));
 *
 * // Results in:
 * // 1 2 3
 * // (4 and 5 are skipped)
 * ```
 * @see {@link skip}
 * @see {@link skipUntil}
 * @see {@link skipWhile}
 * @see {@link take}
 * @param skipCount Number of elements to skip from the end of the source Observable.
 *
 * 从源 Observable 末尾跳过的元素数。
 *
 * @return A function that returns an Observable that skips the last `count`
 * values emitted by the source Observable.
 *
 * 一个返回 Observable 的函数，它跳过源 Observable 发出的最后一个 `count` 数值。
 *
 */
export function skipLast<T>(skipCount: number): MonoTypeOperatorFunction<T> {
  return skipCount <= 0
    ? // For skipCounts less than or equal to zero, we are just mirroring the source.
      identity
    : operate((source, subscriber) => {
        // A ring buffer to hold the values while we wait to see
        // if we can emit it or it's part of the "skipped" last values.
        // Note that it is the _same size_ as the skip count.
        let ring: T[] = new Array(skipCount);
        // The number of values seen so far. This is used to get
        // the index of the current value when it arrives.
        let seen = 0;
        source.subscribe(
          new OperatorSubscriber(subscriber, (value) => {
            // Get the index of the value we have right now
            // relative to all other values we've seen, then
            // increment `seen`. This ensures we've moved to
            // the next slot in our ring buffer.
            const valueIndex = seen++;
            if (valueIndex < skipCount) {
              // If we haven't seen enough values to fill our buffer yet,
              // Then we aren't to a number of seen values where we can
              // emit anything, so let's just start by filling the ring buffer.
              ring[valueIndex] = value;
            } else {
              // We are traversing over the ring array in such
              // a way that when we get to the end, we loop back
              // and go to the start.
              const index = valueIndex % skipCount;
              // Pull the oldest value out so we can emit it,
              // and stuff the new value in it's place.
              const oldValue = ring[index];
              ring[index] = value;
              // Emit the old value. It is important that this happens
              // after we swap the value in the buffer, if it happens
              // before we swap the value in the buffer, then a synchronous
              // source can get the buffer out of whack.
              subscriber.next(oldValue);
            }
          })
        );

        return () => {
          // Release our values in memory
          ring = null!;
        };
      });
}
