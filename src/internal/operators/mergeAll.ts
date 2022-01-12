import { mergeMap } from './mergeMap';
import { identity } from '../util/identity';
import { OperatorFunction, ObservableInput, ObservedValueOf } from '../types';

/**
 * Converts a higher-order Observable into a first-order Observable which
 * concurrently delivers all values that are emitted on the inner Observables.
 *
 * 将高阶 Observable 转换为一阶 Observable，它同时传递在内部 Observable 上发出的所有值。
 *
 * <span class="informal">Flattens an Observable-of-Observables.</span>
*
 * <span class="informal">将 Observable-of-Observables 展平。</span>
 *
 * ![](mergeAll.png)
 *
 * `mergeAll` subscribes to an Observable that emits Observables, also known as
 * a higher-order Observable. Each time it observes one of these emitted inner
 * Observables, it subscribes to that and delivers all the values from the
 * inner Observable on the output Observable. The output Observable only
 * completes once all inner Observables have completed. Any error delivered by
 * a inner Observable will be immediately emitted on the output Observable.
 *
 * `mergeAll` 订阅一个发出 Observable 的 Observable，也称为高阶 Observable。每次它观察到其中一个发出的内部 Observable 时，它都会订阅它并将内部 Observable 的所有值传递到输出 Observable 上。输出 Observable 仅在所有内部 Observable 完成后才完成。内部 Observable 传递的任何错误都会立即在输出 Observable 上发出。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Spawn a new interval Observable for each click event, and blend their outputs as one Observable
 *
 * 为每个点击事件生成一个新的间隔 Observable，并将它们的输出混合为一个 Observable
 *
 * ```ts
 * import { fromEvent, map, interval, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const higherOrder = clicks.pipe(map(() => interval(1000)));
 * const firstOrder = higherOrder.pipe(mergeAll());
 *
 * firstOrder.subscribe(x => console.log(x));
 * ```
 *
 * Count from 0 to 9 every second for each click, but only allow 2 concurrent timers
 *
 * 每次点击每秒从 0 计数到 9，但只允许 2 个并发计时器
 *
 * ```ts
 * import { fromEvent, map, interval, take, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const higherOrder = clicks.pipe(
 *   map(() => interval(1000).pipe(take(10)))
 * );
 * const firstOrder = higherOrder.pipe(mergeAll(2));
 *
 * firstOrder.subscribe(x => console.log(x));
 * ```
 * @see {@link combineLatestAll}
 * @see {@link concatAll}
 * @see {@link exhaustAll}
 * @see {@link merge}
 * @see {@link mergeMap}
 * @see {@link mergeMapTo}
 * @see {@link mergeScan}
 * @see {@link switchAll}
 * @see {@link switchMap}
 * @see {@link zipAll}
 * @param {number} [concurrent=Infinity] Maximum number of inner
 * Observables being subscribed to concurrently.
 * @return A function that returns an Observable that emits values coming from
 * all the inner Observables emitted by the source Observable.
 *
 * 一个返回 Observable 的函数，该 Observable 发出来自源 Observable 发出的所有内部 Observable 的值。
 *
 */
export function mergeAll<O extends ObservableInput<any>>(concurrent: number = Infinity): OperatorFunction<O, ObservedValueOf<O>> {
  return mergeMap(identity, concurrent);
}
