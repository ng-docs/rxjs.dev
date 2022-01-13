import { ObservableInputTuple, OperatorFunction } from '../types';
import { merge } from './merge';

/**
 * Merge the values from all observables to a single observable result.
 *
 * 将所有可观察者的值合并为单个可观察结果。
 *
 * Creates an observable, that when subscribed to, subscribes to the source
 * observable, and all other sources provided as arguments. All values from
 * every source are emitted from the resulting subscription.
 *
 * 创建一个 observable，当订阅它时，它就会订阅源 observable 以及作为参数传进来的所有其他源。来自每个来源的所有值都会从对结果的订阅中发出。
 *
 * When all sources complete, the resulting observable will complete.
 *
 * 当所有源都已完成时，结果 observable 就会完成。
 *
 * When any source errors, the resulting observable will error.
 *
 * 当任何一个源出错时，结果 observable 就会出错。
 *
 * ## Example
 *
 * ## 例子
 *
 * Joining all outputs from multiple user input event streams
 *
 * 连接来自多个用户输入事件流的所有输出
 *
 * ```ts
 * import { fromEvent, map, mergeWith } from 'rxjs';
 *
 * const clicks$ = fromEvent(document, 'click').pipe(map(() => 'click'));
 * const mousemoves$ = fromEvent(document, 'mousemove').pipe(map(() => 'mousemove'));
 * const dblclicks$ = fromEvent(document, 'dblclick').pipe(map(() => 'dblclick'));
 *
 * mousemoves$
 *   .pipe(mergeWith(clicks$, dblclicks$))
 *   .subscribe(x => console.log(x));
 *
 * // result (assuming user interactions)
 * // 'mousemove'
 * // 'mousemove'
 * // 'mousemove'
 * // 'click'
 * // 'click'
 * // 'dblclick'
 * ```
 * @see {@link merge}
 * @param otherSources the sources to combine the current source with.
 *
 * 要与当前源组合在一起的源。
 *
 * @return A function that returns an Observable that merges the values from
 * all given Observables.
 *
 * 一个返回 Observable 的函数，它会合并来自所有给定 Observable 的值。
 *
 */
export function mergeWith<T, A extends readonly unknown[]>(
  ...otherSources: [...ObservableInputTuple<A>]
): OperatorFunction<T, T | A[number]> {
  return merge(...otherSources);
}
