import { OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Groups pairs of consecutive emissions together and emits them as an array of
 * two values.
 *
 * 将连续发送的一些“值对（pair）”进行分组，并将它们作为一些双值数组进行发送。
 *
 * <span class="informal">Puts the current value and previous value together as
 * an array, and emits that.</span>
 *
 * <span class="informal">将当前值和先前值放在一起作成一个数组，并发送它。</span>
 *
 * ![](pairwise.png)
 *
 * The Nth emission from the source Observable will cause the output Observable
 * to emit an array [(N-1)th, Nth] of the previous and the current value, as a
 * pair. For this reason, `pairwise` emits on the second and subsequent
 * emissions from the source Observable, but not on the first emission, because
 * there is no previous value in that case.
 *
 * 来自源 Observable 的第 N 次发送将导致输出 Observable  把前一个值和当前值配成一对（`[(N-1)th, Nth]`）并作为数组发送。因此，`pairwise` 只会在源 Observable 的第二次和后续发来值时发送，而不会在第一次发来时发送，因为这时候还没有前一个值。
 *
 * ## Example
 *
 * ## 例子
 *
 * On every click (starting from the second), emit the relative distance to the previous click
 *
 * 在每次点击时（从第二次开始），发送与前一次点击的相对距离
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
 * 一个从源 Observable 返回连续值对（以数组形式）的 Observable 的函数。
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
