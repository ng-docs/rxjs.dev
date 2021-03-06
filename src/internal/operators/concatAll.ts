import { mergeAll } from './mergeAll';
import { OperatorFunction, ObservableInput, ObservedValueOf } from '../types';

/**
 * Converts a higher-order Observable into a first-order Observable by
 * concatenating the inner Observables in order.
 *
 * 依次连接各个内部 Observable，将高阶 Observable 转换为一阶 Observable。
 *
 * <span class="informal">Flattens an Observable-of-Observables by putting one
 * inner Observable after the other.</span>
 *
 * <span class="informal">通过将一个内部 Observable 串联在另一个之后来展平高阶 Observable（Observable-of-Observables）。</span>
 *
 * ![](concatAll.svg)
 *
 * Joins every Observable emitted by the source (a higher-order Observable), in
 * a serial fashion. It subscribes to each inner Observable only after the
 * previous inner Observable has completed, and merges all of their values into
 * the returned observable.
 *
 * 以串行方式连接源（高阶 Observable）发送的每个 Observable。它仅在前一个内部 Observable 完成后才逐个订阅后一个内部 Observable，并将它们的所有值合并到结果 observable 中。
 *
 * __Warning:__ If the source Observable emits Observables quickly and
 * endlessly, and the inner Observables it emits generally complete slower than
 * the source emits, you can run into memory issues as the incoming Observables
 * collect in an unbounded buffer.
 *
 * **警告：** 如果源 Observable 会快速且无休止地发送内部 Observable，并且这些内部 Observable 又比源发送的慢，那么当要把传入的 Observable 收集到无界缓冲区中时，你可能会遇到内存问题。
 *
 * Note: `concatAll` is equivalent to `mergeAll` with concurrency parameter set
 * to `1`.
 *
 * 注意：`concatAll` 等价于将并发（concurrency）参数设置为 `1` 的 `mergeAll`。
 *
 * ## Example
 *
 * ## 例子
 *
 * For each click event, tick every second from 0 to 3, with no concurrency
 *
 * 对于每个点击事件，每秒会依次发出 0 到 3，非并发
 *
 * ```ts
 * import { fromEvent, map, interval, take, concatAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const higherOrder = clicks.pipe(
 *   map(() => interval(1000).pipe(take(4)))
 * );
 * const firstOrder = higherOrder.pipe(concatAll());
 * firstOrder.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // (results are not concurrent)
 * // For every click on the "document" it will emit values 0 to 3 spaced
 * // on a 1000ms interval
 * // one click = 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3
 * ```
 * @see {@link combineLatestAll}
 * @see {@link concat}
 * @see {@link concatMap}
 * @see {@link concatMapTo}
 * @see {@link exhaustAll}
 * @see {@link mergeAll}
 * @see {@link switchAll}
 * @see {@link switchMap}
 * @see {@link zipAll}
 * @return A function that returns an Observable emitting values from all the
 * inner Observables concatenated.
 *
 * 一个函数，它返回一个 Observable，其值为所有内部 Observable 值的串联结果。
 *
 */
export function concatAll<O extends ObservableInput<any>>(): OperatorFunction<O, ObservedValueOf<O>> {
  return mergeAll(1);
}
