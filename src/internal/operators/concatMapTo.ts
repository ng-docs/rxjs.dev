import { concatMap } from './concatMap';
import { ObservableInput, OperatorFunction, ObservedValueOf } from '../types';
import { isFunction } from '../util/isFunction';

/* tslint:disable:max-line-length */
export function concatMapTo<O extends ObservableInput<unknown>>(observable: O): OperatorFunction<unknown, ObservedValueOf<O>>;
/**
 * @deprecated The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: <https://rxjs.dev/deprecations/resultSelector>
 *
 * `resultSelector` 参数将在 v8 中删除。请改用内部 `map` 。详细信息： <https://rxjs.dev/deprecations/resultSelector>
 *
 */
export function concatMapTo<O extends ObservableInput<unknown>>(
  observable: O,
  resultSelector: undefined
): OperatorFunction<unknown, ObservedValueOf<O>>;
/**
 * @deprecated The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: <https://rxjs.dev/deprecations/resultSelector>
 *
 * `resultSelector` 参数将在 v8 中删除。请改用内部 `map` 。详细信息： <https://rxjs.dev/deprecations/resultSelector>
 *
 */
export function concatMapTo<T, R, O extends ObservableInput<unknown>>(
  observable: O,
  resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R
): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * Projects each source value to the same Observable which is merged multiple
 * times in a serialized fashion on the output Observable.
 *
 * 将每个源值投影到同一个 Observable，该 Observable 在输出 Observable 上以序列化方式多次合并。
 *
 * <span class="informal">It's like {@link concatMap}, but maps each value
 * always to the same inner Observable.</span>
 *
 * 它就像 {@link concatMap}，但总是将每个值映射到同一个内部 Observable。
 *
 * ![](concatMapTo.png)
 *
 * Maps each source value to the given Observable `innerObservable` regardless
 * of the source value, and then flattens those resulting Observables into one
 * single Observable, which is the output Observable. Each new `innerObservable`
 * instance emitted on the output Observable is concatenated with the previous
 * `innerObservable` instance.
 *
 * 将每个源值映射到给定的 Observable `innerObservable` ，而不考虑源值，然后将这些结果 Observable 展平为一个 Observable，即输出 Observable。在输出 Observable 上发出的每个新的 `innerObservable` 实例都与前一个 `innerObservable` 实例连接。
 *
 * __Warning:__ if source values arrive endlessly and faster than their
 * corresponding inner Observables can complete, it will result in memory issues
 * as inner Observables amass in an unbounded buffer waiting for their turn to
 * be subscribed to.
 *
 * __ 警告：__ 如果源值无休止地到达并且比它们相应的内部 Observable 完成的速度更快，这将导致内存问题，因为内部 Observable 堆积在一个无限的缓冲区中等待轮到它们被订阅。
 *
 * Note: `concatMapTo` is equivalent to `mergeMapTo` with concurrency parameter
 * set to `1`.
 *
 * 注意： `concatMapTo` 等价于将并发参数设置为 `1` 的 `mergeMapTo` 。
 *
 * ## Example
 *
 * ## 例子
 *
 * For each click event, tick every second from 0 to 3, with no concurrency
 *
 * 对于每个点击事件，每秒从 0 到 3 打勾，没有并发
 *
 * ```ts
 * import { fromEvent, concatMapTo, interval, take } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   concatMapTo(interval(1000).pipe(take(4)))
 * );
 * result.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // (results are not concurrent)
 * // For every click on the "document" it will emit values 0 to 3 spaced
 * // on a 1000ms interval
 * // one click = 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3
 * ```
 * @see {@link concat}
 * @see {@link concatAll}
 * @see {@link concatMap}
 * @see {@link mergeMapTo}
 * @see {@link switchMapTo}
 * @param {ObservableInput} innerObservable An Observable to replace each value from
 * the source Observable.
 *
 * 用于替换源 Observable 中的每个值的 Observable。
 *
 * @return A function that returns an Observable of values merged together by
 * joining the passed Observable with itself, one after the other, for each
 * value emitted from the source.
 *
 * 一个函数，该函数通过将传递的 Observable 与自身一个接一个地连接到源中发出的每个值，返回一个合并在一起的值的 Observable。
 *
 */
export function concatMapTo<T, R, O extends ObservableInput<unknown>>(
  innerObservable: O,
  resultSelector?: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R
): OperatorFunction<T, ObservedValueOf<O> | R> {
  return isFunction(resultSelector) ? concatMap(() => innerObservable, resultSelector) : concatMap(() => innerObservable);
}
