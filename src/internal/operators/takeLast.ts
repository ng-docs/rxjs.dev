import { EMPTY } from '../observable/empty';
import { MonoTypeOperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Waits for the source to complete, then emits the last N values from the source,
 * as specified by the `count` argument.
 *
 * 等待源完成，然后从源发出最后 N 个值，由 `count` 参数指定。
 *
 * ![](takeLast.png)
 *
 * `takeLast` results in an observable that will hold values up to `count` values in memory,
 * until the source completes. It then pushes all values in memory to the consumer, in the
 * order they were received from the source, then notifies the consumer that it is
 * complete.
 *
 * `takeLast` 产生一个 observable，它将在内存中保存最多 `count` 值，直到源完成。然后它将内存中的所有值按从源接收的顺序推送给消费者，然后通知消费者它已完成。
 *
 * If for some reason the source completes before the `count` supplied to `takeLast` is reached,
 * all values received until that point are emitted, and then completion is notified.
 *
 * 如果由于某种原因源在达到提供给 `takeLast` 的 `count` 之前完成，则发出直到该点接收到的所有值，然后通知完成。
 *
 * **Warning**: Using `takeLast` with an observable that never completes will result
 * in an observable that never emits a value.
 *
 * **警告**：将 `takeLast` 与永远不会完成的可观察对象一起使用将导致永远不会发出值的可观察对象。
 *
 * ## Example
 *
 * ## 例子
 *
 * Take the last 3 values of an Observable with many values
 *
 * 取具有多个值的 Observable 的最后 3 个值
 *
 * ```ts
 * import { range, takeLast } from 'rxjs';
 *
 * const many = range(1, 100);
 * const lastThree = many.pipe(takeLast(3));
 * lastThree.subscribe(x => console.log(x));
 * ```
 * @see {@link take}
 * @see {@link takeUntil}
 * @see {@link takeWhile}
 * @see {@link skip}
 * @param count The maximum number of values to emit from the end of
 * the sequence of values emitted by the source Observable.
 *
 * 从源 Observable 发出的值序列的末尾发出的最大值数。
 *
 * @return A function that returns an Observable that emits at most the last
 * `count` values emitted by the source Observable.
 *
 * 一个返回 Observable 的函数，该函数最多发出源 Observable 发出的最后一个 `count` 数值。
 *
 */
export function takeLast<T>(count: number): MonoTypeOperatorFunction<T> {
  return count <= 0
    ? () => EMPTY
    : operate((source, subscriber) => {
        // This buffer will hold the values we are going to emit
        // when the source completes. Since we only want to take the
        // last N values, we can't emit until we're sure we're not getting
        // any more values.
        let buffer: T[] = [];
        source.subscribe(
          new OperatorSubscriber(
            subscriber,
            (value) => {
              // Add the most recent value onto the end of our buffer.
              buffer.push(value);
              // If our buffer is now larger than the number of values we
              // want to take, we remove the oldest value from the buffer.
              count < buffer.length && buffer.shift();
            },
            () => {
              // The source completed, we now know what are last values
              // are, emit them in the order they were received.
              for (const value of buffer) {
                subscriber.next(value);
              }
              subscriber.complete();
            },
            // Errors are passed through to the consumer
            undefined,
            () => {
              // During teardown release the values in our buffer.
              buffer = null!;
            }
          )
        );
      });
}
