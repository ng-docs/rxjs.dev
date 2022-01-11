import { OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Groups pairs of consecutive emissions together and emits them as an array of
 * two values.
 *
 * 将成对的连续发射组合在一起，并将它们作为两个值的数组发射。
 *
 * <span class="informal">Puts the current value and previous value together as
 * an array, and emits that.</span>
 *
 * <span class="informal">将当前值和先前值放在一起作为一个数组，并发出它。</span>
 *
 * ![](pairwise.png)
 *
 * The Nth emission from the source Observable will cause the output Observable
 * to emit an array [(N-1)th, Nth] of the previous and the current value, as a
 * pair. For this reason, `pairwise` emits on the second and subsequent
 * emissions from the source Observable, but not on the first emission, because
 * there is no previous value in that case.
 *
 * 来自源 Observable 的第 N 个发射将导致输出 Observable 发射一个数组[(N-1)th，][(n-1)th,%20nth]前一个值和当前值的第 N 个，作为一对。出于这个原因，在源 Observable 的第二次和后续发射时，`pairwise` 发射，但不是在第一次发射时发射，因为在这种情况下没有先前的值。
 *
 * ## Example
 *
 * ## 例子
 *
 * On every click (starting from the second), emit the relative distance to the previous click
 *
 * 在每次点击时（从第二次开始），发出与前一次点击的相对距离
 *
 * ```ts
 * import { fromEvent, pairwise, map } from 'rxjs';
 *
 * const clicks = fromEvent<PointerEvent>(document, 'click');
 * const pairs = clicks.pipe(pairwise());
 * const distance = pairs.pipe(
 *   map(([first, second]) => {
 *     const x0 = first.clientX;
 *     const y0 = first.clientY;
 *     const x1 = second.clientX;
 *     const y1 = second.clientY;
 *     return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
 *   })
 * );
 *
 * distance.subscribe(x => console.log(x));
 * ```
 * @see {@link buffer}
 * @see {@link bufferCount}
 * @return A function that returns an Observable of pairs (as arrays) of
 * consecutive values from the source Observable.
 *
 * 一个从源 Observable 返回连续值对（作为数组）的 Observable 的函数。
 *
 */
export function pairwise<T>(): OperatorFunction<T, [T, T]> {
  return operate((source, subscriber) => {
    let prev: T;
    let hasPrev = false;
    source.subscribe(
      new OperatorSubscriber(subscriber, (value) => {
        const p = prev;
        prev = value;
        hasPrev && subscriber.next([p, value]);
        hasPrev = true;
      })
    );
  });
}
