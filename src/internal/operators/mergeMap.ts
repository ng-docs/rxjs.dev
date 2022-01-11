import { ObservableInput, OperatorFunction, ObservedValueOf } from '../types';
import { map } from './map';
import { innerFrom } from '../observable/innerFrom';
import { operate } from '../util/lift';
import { mergeInternals } from './mergeInternals';
import { isFunction } from '../util/isFunction';

/* tslint:disable:max-line-length */
export function mergeMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  concurrent?: number
): OperatorFunction<T, ObservedValueOf<O>>;
/**
 * @deprecated The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: <https://rxjs.dev/deprecations/resultSelector>
 *
 * `resultSelector` 参数将在 v8 中删除。请改用内部 `map` 。详细信息： [https](https://rxjs.dev/deprecations/resultSelector) ://rxjs.dev/deprecations/resultSelector
 *
 */
export function mergeMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector: undefined,
  concurrent?: number
): OperatorFunction<T, ObservedValueOf<O>>;
/**
 * @deprecated The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: <https://rxjs.dev/deprecations/resultSelector>
 *
 * `resultSelector` 参数将在 v8 中删除。请改用内部 `map` 。详细信息： [https](https://rxjs.dev/deprecations/resultSelector) ://rxjs.dev/deprecations/resultSelector
 *
 */
export function mergeMap<T, R, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R,
  concurrent?: number
): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * Projects each source value to an Observable which is merged in the output
 * Observable.
 *
 * 将每个源值投影到一个 Observable，该 Observable 被合并到输出 Observable 中。
 *
 * <span class="informal">Maps each value to an Observable, then flattens all of
 * these inner Observables using {@link mergeAll}.</span>
 *
 * 将每个值映射到一个 Observable，然后使用 {@link mergeAll} 展平所有这些内部 Observable。
 *
 * ![](mergeMap.png)
 *
 * Returns an Observable that emits items based on applying a function that you
 * supply to each item emitted by the source Observable, where that function
 * returns an Observable, and then merging those resulting Observables and
 * emitting the results of this merger.
 *
 * 返回一个 Observable，该 Observable 基于将你提供的函数应用于源 Observable 发出的每个项目，其中该函数返回一个 Observable，然后合并这些结果 Observable 并发出此合并的结果，从而发出项目。
 *
 * ## Example
 *
 * ## 例子
 *
 * Map and flatten each letter to an Observable ticking every 1 second
 *
 * 每 1 秒将每个字母映射并展平到一个 Observable 滴答声
 *
 * ```ts
 * import { of, mergeMap, interval, map } from 'rxjs';
 *
 * const letters = of('a', 'b', 'c');
 * const result = letters.pipe(
 *   mergeMap(x => interval(1000).pipe(map(i => x + i)))
 * );
 *
 * result.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // a0
 * // b0
 * // c0
 * // a1
 * // b1
 * // c1
 * // continues to list a, b, c every second with respective ascending integers
 * ```
 * @see {@link concatMap}
 * @see {@link exhaustMap}
 * @see {@link merge}
 * @see {@link mergeAll}
 * @see {@link mergeMapTo}
 * @see {@link mergeScan}
 * @see {@link switchMap}
 * @param {function(value: T, ?index: number): ObservableInput} project A function
 * that, when applied to an item emitted by the source Observable, returns an
 * Observable.
 *
 * 一个函数，当应用于源 Observable 发出的项目时，返回一个 Observable。
 *
 * @param {number} [concurrent=Infinity] Maximum number of input
 * Observables being subscribed to concurrently.
 * @return A function that returns an Observable that emits the result of
 * applying the projection function (and the optional deprecated
 * `resultSelector`) to each item emitted by the source Observable and merging
 * the results of the Observables obtained from this transformation.
 *
 * 一个返回 Observable 的函数，该函数发出将投影函数（以及可选的不推荐使用的 `resultSelector` ）应用于源 Observable 发出的每个项目并合并从此转换获得的 Observables 的结果的结果。
 *
 */
export function mergeMap<T, R, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector?: ((outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R) | number,
  concurrent: number = Infinity
): OperatorFunction<T, ObservedValueOf<O> | R> {
  if (isFunction(resultSelector)) {
    // DEPRECATED PATH
    return mergeMap((a, i) => map((b: any, ii: number) => resultSelector(a, b, i, ii))(innerFrom(project(a, i))), concurrent);
  } else if (typeof resultSelector === 'number') {
    concurrent = resultSelector;
  }

  return operate((source, subscriber) => mergeInternals(source, subscriber, project, concurrent));
}
