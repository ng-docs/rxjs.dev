import { mergeMap } from './mergeMap';
import { ObservableInput, OperatorFunction, ObservedValueOf } from '../types';
import { isFunction } from '../util/isFunction';

/* tslint:disable:max-line-length */
export function concatMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O
): OperatorFunction<T, ObservedValueOf<O>>;
/**
 * @deprecated The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: <https://rxjs.dev/deprecations/resultSelector>
 *
 * `resultSelector` 参数将在 v8 中删除。请改用内部 `map`。详细信息： <https://rxjs.dev/deprecations/resultSelector>
 *
 */
export function concatMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector: undefined
): OperatorFunction<T, ObservedValueOf<O>>;
/**
 * @deprecated The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: <https://rxjs.dev/deprecations/resultSelector>
 *
 * `resultSelector` 参数将在 v8 中删除。请改用内部 `map`。详细信息： <https://rxjs.dev/deprecations/resultSelector>
 *
 */
export function concatMap<T, R, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R
): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * Projects each source value to an Observable which is merged in the output
 * Observable, in a serialized fashion waiting for each one to complete before
 * merging the next.
 *
 * 将每个源值投影到一个 Observable，该 Observable 会合并到输出 Observable 中，会以串行的方式等待每个源值完成，然后再合并下一个。
 *
 * <span class="informal">Maps each value to an Observable, then flattens all of
 * these inner Observables using {@link concatAll}.</span>
 *
 * <span class="informal">将每个值映射到一个 Observable，然后使用 {@link concatAll} 展平所有这些内部 Observable。</span>
 *
 * ![](concatMap.png)
 *
 * Returns an Observable that emits items based on applying a function that you
 * supply to each item emitted by the source Observable, where that function
 * returns an (so-called "inner") Observable. Each new inner Observable is
 * concatenated with the previous inner Observable.
 *
 * 返回一个 Observable，该 Observable 会针对源 Observable 的每个条目调用你提供的 `project` 函数，并发送其结果，函数会返回一个 内部 Observable。每个新的内部 Observable 都会与之前的内部 Observable 串联起来。
 *
 * __Warning:__ if source values arrive endlessly and faster than their
 * corresponding inner Observables can complete, it will result in memory issues
 * as inner Observables amass in an unbounded buffer waiting for their turn to
 * be subscribed to.
 *
 * **警告：** 如果源值（内部 Observable）会无休止地抵达并且比这些内部 Observable 自身完成的速度更快，就会导致内存问题，因为这些内部 Observable 会积压在一个无限的缓冲区中等待被订阅。
 *
 * Note: `concatMap` is equivalent to `mergeMap` with concurrency parameter set
 * to `1`.
 *
 * 注意：`concatMap` 等价于将并发（concurrency）参数设置为 `1` 的 `mergeMap`。
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
 * import { fromEvent, concatMap, interval, take } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   concatMap(ev => interval(1000).pipe(take(4)))
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
 * @see {@link concatMapTo}
 * @see {@link exhaustMap}
 * @see {@link mergeMap}
 * @see {@link switchMap}
 * @param {function(value: T, ?index: number): ObservableInput} project A function
 * that, when applied to an item emitted by the source Observable, returns an
 * Observable.
 *
 * 一个函数，每当以源 Observable 发出的条目为参数进行调用时，会返回一个 Observable。
 *
 * @return A function that returns an Observable that emits the result of
 * applying the projection function (and the optional deprecated
 * `resultSelector`) to each item emitted by the source Observable and taking
 * values from each projected inner Observable sequentially.
 *
 * 一个返回 Observable 的函数，该 Observable 会针对源 Observable 发送的每个条目调用投影函数（另一个是已弃用的可选参数 `resultSelector`），并依次从每个投影后的内部 Observable 中获取值。
 *
 */
export function concatMap<T, R, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector?: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R
): OperatorFunction<T, ObservedValueOf<O> | R> {
  return isFunction(resultSelector) ? mergeMap(project, resultSelector, 1) : mergeMap(project, 1);
}
