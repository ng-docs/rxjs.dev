import { ObservableInputTuple, OperatorFunction } from '../types';
import { merge } from './merge';

/**
 * Merge the values from all observables to a single observable result.
 *
 * 将所有可观察对象的值合并为单个可观察结果。
 *
 * Creates an observable, that when subscribed to, subscribes to the source
 * observable, and all other sources provided as arguments. All values from
 * every source are emitted from the resulting subscription.
 *
 * 创建一个 observable，当订阅它时，它会订阅源 observable，以及作为参数提供的所有其他源。来自每个来源的所有值都是从生成的订阅中发出的。
 *
 * When all sources complete, the resulting observable will complete.
 *
 * 当所有源都完成时，生成的 observable 将完成。
 *
 * When any source errors, the resulting observable will error.
 *
 * 当任何源错误时，产生的 observable 都会出错。
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
 * 与当前源相结合的源。
 *
 * @return A function that returns an Observable that merges the values from
 * all given Observables.
 *
 * 一个返回 Observable 的函数，它合并来自所有给定 Observable 的值。
 *
 */
export function mergeWith<T, A extends readonly unknown[]>(
  ...otherSources: [...ObservableInputTuple<A>]
): OperatorFunction<T, T | A[number]> {
  return merge(...otherSources);
}
