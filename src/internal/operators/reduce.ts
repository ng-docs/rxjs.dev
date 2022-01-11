import { scanInternals } from './scanInternals';
import { OperatorFunction } from '../types';
import { operate } from '../util/lift';

export function reduce<V, A = V>(accumulator: (acc: A | V, value: V, index: number) => A): OperatorFunction<V, V | A>;
export function reduce<V, A>(accumulator: (acc: A, value: V, index: number) => A, seed: A): OperatorFunction<V, A>;
export function reduce<V, A, S = A>(accumulator: (acc: A | S, value: V, index: number) => A, seed: S): OperatorFunction<V, A>;

/**
 * Applies an accumulator function over the source Observable, and returns the
 * accumulated result when the source completes, given an optional seed value.
 *
 * 在源 Observable 上应用累加器函数，并在源完成时返回累积结果，给定一个可选的种子值。
 *
 * <span class="informal">Combines together all values emitted on the source,
 * using an accumulator function that knows how to join a new source value into
 * the accumulation from the past.</span>
 *
 * 使用累加器函数将源上发出的所有值组合在一起，该函数知道如何将新的源值加入过去的累加中。
 *
 * ![](reduce.png)
 *
 * Like
 * [Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce),
 * `reduce` applies an `accumulator` function against an accumulation and each
 * value of the source Observable (from the past) to reduce it to a single
 * value, emitted on the output Observable. Note that `reduce` will only emit
 * one value, only when the source Observable completes. It is equivalent to
 * applying operator {@link scan} followed by operator {@link last}.
 *
 * 与[Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)一样， `reduce` 对累积和源 Observable 的每个值（来自过去）应用 `accumulator` 函数以将其减少为单个值，在输出 Observable 上发出。请注意， `reduce` 只会在源 Observable 完成时发出一个值。这相当于应用运算符 {@link scan} 后跟运算符 {@link last}。
 *
 * Returns an Observable that applies a specified `accumulator` function to each
 * item emitted by the source Observable. If a `seed` value is specified, then
 * that value will be used as the initial value for the accumulator. If no seed
 * value is specified, the first item of the source is used as the seed.
 *
 * 返回一个 Observable，它将指定的 `accumulator` 函数应用于源 Observable 发出的每个项目。如果指定了 `seed` 值，则该值将用作累加器的初始值。如果未指定种子值，则将源的第一项用作种子。
 *
 * ## Example
 *
 * ## 例子
 *
 * Count the number of click events that happened in 5 seconds
 *
 * 统计 5 秒内发生的点击事件数
 *
 * ```ts
 * import { fromEvent, takeUntil, interval, map, reduce } from 'rxjs';
 *
 * const clicksInFiveSeconds = fromEvent(document, 'click')
 *   .pipe(takeUntil(interval(5000)));
 *
 * const ones = clicksInFiveSeconds.pipe(map(() => 1));
 * const seed = 0;
 * const count = ones.pipe(reduce((acc, one) => acc + one, seed));
 *
 * count.subscribe(x => console.log(x));
 * ```
 * @see {@link count}
 * @see {@link expand}
 * @see {@link mergeScan}
 * @see {@link scan}
 * @param {function(acc: A, value: V, index: number): A} accumulator The accumulator function
 * called on each source value.
 *
 * 对每个源值调用的累加器函数。
 *
 * @param {A} [seed] The initial accumulation value.
 * @return A function that returns an Observable that emits a single value that
 * is the result of accumulating the values emitted by the source Observable.
 *
 * 一个返回 Observable 的函数，该函数发出单个值，该值是源 Observable 发出的值的累加结果。
 *
 */
export function reduce<V, A>(accumulator: (acc: V | A, value: V, index: number) => A, seed?: any): OperatorFunction<V, V | A> {
  return operate(scanInternals(accumulator, seed, arguments.length >= 2, false, true));
}
