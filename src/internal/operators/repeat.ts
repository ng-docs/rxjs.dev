import { Subscription } from '../Subscription';
import { EMPTY } from '../observable/empty';
import { operate } from '../util/lift';
import { MonoTypeOperatorFunction, ObservableInput } from '../types';
import { OperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/innerFrom';
import { timer } from '../observable/timer';

export interface RepeatConfig {
  /**
   * The number of times to repeat the source. Defaults to `Infinity`.
   *
   * 此源要重复的次数。默认为 `Infinity`。
   *
   */
  count?: number;

  /**
   * If a `number`, will delay the repeat of the source by that number of milliseconds.
   * If a function, it will provide the number of times the source has been subscribed to,
   * and the return value should be a valid observable input that will notify when the source
   * should be repeated. If the notifier observable is empty, the result will complete.
   *
   * 如果是 `number`，则将源的重复延迟该毫秒数。如果是一个函数，它将提供源要订阅的次数，并且其返回值应该是一个有效的可观察输入，它将通知何时应该重复源。如果通知器 observable 为空，则结果此将完成。
   *
   */
  delay?: number | ((count: number) => ObservableInput<any>);
}

/**
 * Returns an Observable that will resubscribe to the source stream when the source stream completes.
 *
 * 返回一个 Observable，它将在源流完成时重新订阅源流。
 *
 * <span class="informal">Repeats all values emitted on the source. It's like {@link retry}, but for non error cases.</span>
 *
 * <span class="informal">重复源上发送的所有值。这就像 {@link retry}，但只针对无错的情况。</span>
 *
 * ![](repeat.png)
 *
 * Repeat will output values from a source until the source completes, then it will resubscribe to the
 * source a specified number of times, with a specified delay. Repeat can be particularly useful in
 * combination with closing operators like {@link take}, {@link takeUntil}, {@link first}, or {@link takeWhile},
 * as it can be used to restart a source again from scratch.
 *
 * repeat 将从源输出一些值，直到源完成，然后它将按指定的次数重新订阅源，并具有指定的延迟。repeat 一般会与 {@link take}、{@link takeUntil}、{@link first} 或 {@link takeWhile} 等关闭操作符结合使用，因为它可用于从头开始重新启动源。
 *
 * Repeat is very similar to {@link retry}, where {@link retry} will resubscribe to the source in the error case, but
 * `repeat` will resubscribe if the source completes.
 *
 * repeat 与 {@link retry} 非常相似，不过 {@link retry} 会在出错的情况下重新订阅源，而 `repeat` 会在源完成的情况下重新订阅。
 *
 * Note that `repeat` will _not_ catch errors. Use {@link retry} for that.
 *
 * 请注意，`repeat` *不会* 捕获错误。如果要捕获，请使用 {@link retry}。
 *
 * - `repeat(0)` returns an empty observable
 *
 *   `repeat(0)` 返回一个空的 observable
 *
 * - `repeat()` will repeat forever
 *
 *   `repeat()` 将永远重复
 *
 * - `repeat({ delay: 200 })` will repeat forever, with a delay of 200ms between repetitions.
 *
 *   `repeat({ delay: 200 })` 将永远重复，每次重复之间有 200ms 的延迟。
 *
 * - `repeat({ count: 2, delay: 400 })` will repeat twice, with a delay of 400ms between repetitions.
 *
 *   `repeat({ count: 2, delay: 400 })` 将重复两次，每次重复之间有 400ms 的延迟。
 *
 * - `repeat({ delay: (count) => timer(count * 1000) })` will repeat forever, but will have a delay that grows by one second for each repetition.
 *
 *   `repeat({ delay: (count) => timer(count * 1000) })` 将永远重复，但每次重复都会增加一秒的延迟。
 *
 * ## Example
 *
 * ## 例子
 *
 * Repeat a message stream
 *
 * 重复某个消息流
 *
 * ```ts
 * import { of, repeat } from 'rxjs';
 *
 * const source = of('Repeat message');
 * const result = source.pipe(repeat(3));
 *
 * result.subscribe(x => console.log(x));
 *
 * // Results
 * // 'Repeat message'
 * // 'Repeat message'
 * // 'Repeat message'
 * ```
 *
 * Repeat 3 values, 2 times
 *
 * 重复 3 个值，2 次
 *
 * ```ts
 * import { interval, take, repeat } from 'rxjs';
 *
 * const source = interval(1000);
 * const result = source.pipe(take(3), repeat(2));
 *
 * result.subscribe(x => console.log(x));
 *
 * // Results every second
 * // 0
 * // 1
 * // 2
 * // 0
 * // 1
 * // 2
 * ```
 *
 * Defining two complex repeats with delays on the same source.
 * Note that the second repeat cannot be called until the first
 * repeat as exhausted it's count.
 *
 * 在同一个源上定义两个自带延迟的复杂重复。请注意，在第一次重复用尽它的计数之前，不会调用第二次重复。
 *
 * ```ts
 * import { defer, of, repeat } from 'rxjs';
 *
 * const source = defer(() => {
 *    return of(`Hello, it is ${new Date()}`)
 * });
 *
 * source.pipe(
 *    // Repeat 3 times with a delay of 1 second between repetitions
 *    repeat({
 *      count: 3,
 *      delay: 1000,
 *    }),
 *
 *    // *Then* repeat forever, but with an exponential step-back
 *    // maxing out at 1 minute.
 *    repeat({
 *      delay: (count) => timer(Math.min(60000, 2 ^ count * 1000))
 *    })
 * )
 * ```
 * @see {@link repeatWhen}
 * @see {@link retry}
 * @param count The number of times the source Observable items are repeated, a count of 0 will yield
 * an empty Observable.
 *
 * 源 Observable 的条目要重复的次数，如果计数为 0 将产生一个空的 Observable。
 *
 */
export function repeat<T>(countOrConfig?: number | RepeatConfig): MonoTypeOperatorFunction<T> {
  let count = Infinity;
  let delay: RepeatConfig['delay'];

  if (countOrConfig != null) {
    if (typeof countOrConfig === 'object') {
      ({ count = Infinity, delay } = countOrConfig);
    } else {
      count = countOrConfig;
    }
  }

  return count <= 0
    ? () => EMPTY
    : operate((source, subscriber) => {
        let soFar = 0;
        let sourceSub: Subscription | null;

        const resubscribe = () => {
          sourceSub?.unsubscribe();
          sourceSub = null;
          if (delay != null) {
            const notifier = typeof delay === 'number' ? timer(delay) : innerFrom(delay(soFar));
            const notifierSubscriber = new OperatorSubscriber(subscriber, () => {
              notifierSubscriber.unsubscribe();
              subscribeToSource();
            });
            notifier.subscribe(notifierSubscriber);
          } else {
            subscribeToSource();
          }
        };

        const subscribeToSource = () => {
          let syncUnsub = false;
          sourceSub = source.subscribe(
            new OperatorSubscriber(subscriber, undefined, () => {
              if (++soFar < count) {
                if (sourceSub) {
                  resubscribe();
                } else {
                  syncUnsub = true;
                }
              } else {
                subscriber.complete();
              }
            })
          );

          if (syncUnsub) {
            resubscribe();
          }
        };

        subscribeToSource();
      });
}
