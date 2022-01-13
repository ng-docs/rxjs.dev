import { OperatorFunction, ObservedValueOf, ObservableInput } from '../types';
import { mergeMap } from './mergeMap';
import { isFunction } from '../util/isFunction';

/* tslint:disable:max-line-length */
export function mergeMapTo<O extends ObservableInput<unknown>>(
  innerObservable: O,
  concurrent?: number
): OperatorFunction<unknown, ObservedValueOf<O>>;
/**
 * @deprecated The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: <https://rxjs.dev/deprecations/resultSelector>
 *
 * `resultSelector` 参数将在 v8 中删除。请改用内部 `map` 。详细信息： <https://rxjs.dev/deprecations/resultSelector>
 *
 */
export function mergeMapTo<T, R, O extends ObservableInput<unknown>>(
  innerObservable: O,
  resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R,
  concurrent?: number
): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * Projects each source value to the same Observable which is merged multiple
 * times in the output Observable.
 *
 * 将每个源值投影到同一个 Observable，该 Observable 在输出 Observable 中多次合并。
 *
 * <span class="informal">It's like {@link mergeMap}, but maps each value always
 * to the same inner Observable.</span>
 *
 * 它就像 {@link mergeMap}，但总是将每个值映射到同一个内部 Observable。
 *
 * ![](mergeMapTo.png)
 *
 * Maps each source value to the given Observable `innerObservable` regardless
 * of the source value, and then merges those resulting Observables into one
 * single Observable, which is the output Observable.
 *
 * 无论源值如何，都将每个源值映射到给定的 Observable `innerObservable` Observable，然后将这些生成的 Observable 合并为一个 Observable，即输出 Observable。
 *
 * ## Example
 *
 * ## 例子
 *
 * For each click event, start an interval Observable ticking every 1 second
 *
 * 对于每个点击事件，开始一个间隔 Observable 每 1 秒滴答一次
 *
 * ```ts
 * import { fromEvent, mergeMapTo, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(mergeMapTo(interval(1000)));
 *
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link concatMapTo}
 * @see {@link merge}
 * @see {@link mergeAll}
 * @see {@link mergeMap}
 * @see {@link mergeScan}
 * @see {@link switchMapTo}
 * @param {ObservableInput} innerObservable An Observable to replace each value from
 * the source Observable.
 *
 * 用于替换源 Observable 中的每个值的 Observable。
 *
 * @param {number} [concurrent=Infinity] Maximum number of input
 * Observables being subscribed to concurrently.
 * @return A function that returns an Observable that emits items from the
 * given `innerObservable`.
 *
 * 一个返回 Observable 的函数，该 Observable 从给定的 `innerObservable` 发出项目。
 *
 */
export function mergeMapTo<T, R, O extends ObservableInput<unknown>>(
  innerObservable: O,
  resultSelector?: ((outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R) | number,
  concurrent: number = Infinity
): OperatorFunction<T, ObservedValueOf<O> | R> {
  if (isFunction(resultSelector)) {
    return mergeMap(() => innerObservable, resultSelector, concurrent);
  }
  if (typeof resultSelector === 'number') {
    concurrent = resultSelector;
  }
  return mergeMap(() => innerObservable, concurrent);
}
