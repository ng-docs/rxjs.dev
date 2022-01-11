import { switchMap } from './switchMap';
import { ObservableInput, OperatorFunction, ObservedValueOf } from '../types';
import { isFunction } from '../util/isFunction';

/* tslint:disable:max-line-length */
export function switchMapTo<O extends ObservableInput<unknown>>(observable: O): OperatorFunction<unknown, ObservedValueOf<O>>;
/**
 * @deprecated The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: <https://rxjs.dev/deprecations/resultSelector>
 *
 * `resultSelector` 参数将在 v8 中删除。请改用内部 `map`。详细信息： <https://rxjs.dev/deprecations/resultSelector>
 *
 */
export function switchMapTo<O extends ObservableInput<unknown>>(
  observable: O,
  resultSelector: undefined
): OperatorFunction<unknown, ObservedValueOf<O>>;
/**
 * @deprecated The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: <https://rxjs.dev/deprecations/resultSelector>
 *
 * `resultSelector` 参数将在 v8 中删除。请改用内部 `map`。详细信息： <https://rxjs.dev/deprecations/resultSelector>
 *
 */
export function switchMapTo<T, R, O extends ObservableInput<unknown>>(
  observable: O,
  resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R
): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * Projects each source value to the same Observable which is flattened multiple
 * times with {@link switchMap} in the output Observable.
 *
 * 将每个源值投影到同一个 Observable，该 Observable 在输出 Observable 中使用 {@link switchMap} 进行多次展平。
 *
 * <span class="informal">It's like {@link switchMap}, but maps each value
 * always to the same inner Observable.</span>
 *
 * <span class="informal">它就像 {@link switchMap}，但总是将每个值映射到同一个内部 Observable。</span>
 *
 * ![](switchMapTo.png)
 *
 * Maps each source value to the given Observable `innerObservable` regardless
 * of the source value, and then flattens those resulting Observables into one
 * single Observable, which is the output Observable. The output Observables
 * emits values only from the most recently emitted instance of
 * `innerObservable`.
 *
 * 将每个源值映射到给定的 Observable `innerObservable`，而不考虑源值，然后将这些结果 Observable 展平为一个 Observable，即输出 Observable。输出 Observables 仅从最近发出的 `innerObservable` 实例发出值。
 *
 * ## Example
 *
 * ## 例子
 *
 * Restart an interval Observable on every click event
 *
 * 在每个点击事件上重新启动一个时间间隔 Observable
 *
 * ```ts
 * import { fromEvent, switchMapTo, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(switchMapTo(interval(1000)));
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link concatMapTo}
 * @see {@link switchAll}
 * @see {@link switchMap}
 * @see {@link mergeMapTo}
 * @param {ObservableInput} innerObservable An Observable to replace each value from
 * the source Observable.
 *
 * 用于替换源 Observable 中的每个值的 Observable。
 *
 * @return A function that returns an Observable that emits items from the
 * given `innerObservable` (and optionally transformed through the deprecated
 * `resultSelector`) every time a value is emitted on the source Observable,
 * and taking only the values from the most recently projected inner
 * Observable.
 *
 * 一个函数，它返回一个 Observable，每次在源 Observable 上发出一个值时，它会从给定的 `innerObservable` 发出项目（并且可以选择通过已弃用的 `resultSelector` 进行转换），并且只从最近投影的内部 Observable 中获取值。
 *
 */
export function switchMapTo<T, R, O extends ObservableInput<unknown>>(
  innerObservable: O,
  resultSelector?: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R
): OperatorFunction<T, ObservedValueOf<O> | R> {
  return isFunction(resultSelector) ? switchMap(() => innerObservable, resultSelector) : switchMap(() => innerObservable);
}
