import { OperatorFunction, ObservableInput, ObservedValueOf } from '../types';
import { switchMap } from './switchMap';
import { identity } from '../util/identity';

/**
 * Converts a higher-order Observable into a first-order Observable
 * producing values only from the most recent observable sequence
 *
 * 将高阶 Observable 转换为一阶 Observable，仅从最近的 observable 序列中产生值
 *
 * <span class="informal">Flattens an Observable-of-Observables.</span>
*
 * <span class="informal">将 Observable-of-Observables 展平。</span>
 *
 * ![](switchAll.png)
 *
 * `switchAll` subscribes to a source that is an observable of observables, also known as a
 * "higher-order observable" (or `Observable<Observable<T>>`). It subscribes to the most recently
 * provided "inner observable" emitted by the source, unsubscribing from any previously subscribed
 * to inner observable, such that only the most recent inner observable may be subscribed to at
 * any point in time. The resulting observable returned by `switchAll` will only complete if the
 * source observable completes, *and* any currently subscribed to inner observable also has completed,
 * if there are any.
 *
 * `switchAll` 订阅的源是可观察对象的可观察对象，也称为“高阶可观察对象”（或 `Observable<Observable<T>>` ）。它订阅源发出的最近提供的“内部 observable”，取消订阅任何先前订阅的内部 observable，这样在任何时间点都只能订阅最近的内部 observable。 `switchAll` 返回的结果 observable 只有在源 observable 完成时才会完成，*并且*任何当前订阅的内部 observable 也已完成（如果有的话）。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Spawn a new interval observable for each click event, but for every new
 * click, cancel the previous interval and subscribe to the new one
 *
 * 为每个点击事件产生一个可观察的新间隔，但对于每个新点击，取消前一个间隔并订阅新的间隔
 *
 * ```ts
 * import { fromEvent, tap, map, interval, switchAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click').pipe(tap(() => console.log('click')));
 * const source = clicks.pipe(map(() => interval(1000)));
 *
 * source
 *   .pipe(switchAll())
 *   .subscribe(x => console.log(x));
 *
 * // Output
 * // click
 * // 0
 * // 1
 * // 2
 * // 3
 * // ...
 * // click
 * // 0
 * // 1
 * // 2
 * // ...
 * // click
 * // ...
 * ```
 * @see {@link combineLatestAll}
 * @see {@link concatAll}
 * @see {@link exhaustAll}
 * @see {@link switchMap}
 * @see {@link switchMapTo}
 * @see {@link mergeAll}
 * @return A function that returns an Observable that converts a higher-order
 * Observable into a first-order Observable producing values only from the most
 * recent Observable sequence.
 *
 * 一个返回 Observable 的函数，它将高阶 Observable 转换为一阶 Observable，仅从最近的 Observable 序列中产生值。
 *
 */
export function switchAll<O extends ObservableInput<any>>(): OperatorFunction<O, ObservedValueOf<O>> {
  return switchMap(identity);
}
