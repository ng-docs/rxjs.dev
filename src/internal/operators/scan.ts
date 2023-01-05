import { OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { scanInternals } from './scanInternals';

export function scan<V, A = V>(accumulator: (acc: A | V, value: V, index: number) => A): OperatorFunction<V, V | A>;
export function scan<V, A>(accumulator: (acc: A, value: V, index: number) => A, seed: A): OperatorFunction<V, A>;
export function scan<V, A, S>(accumulator: (acc: A | S, value: V, index: number) => A, seed: S): OperatorFunction<V, A>;

// TODO: link to a "redux pattern" section in the guide (location TBD)

/**
 * Useful for encapsulating and managing state. Applies an accumulator (or "reducer function")
 * to each value from the source after an initial state is established -- either via
 * a `seed` value (second argument), or from the first value from the source.
 *
 * 用于封装和管理状态。在使用 `seed` 值（第二个参数）或来自源的第一个值建立了初始状态之后，对来自源的每个值调用累加器（或“reducer 函数”）。
 *
 * <span class="informal">It's like {@link reduce}, but emits the current
 * accumulation state after each update</span>
 *
 * <span class="informal">类似于 {@link reduce}，但在每次更新后会发送当前的累积状态</span>
 *
 * ![](scan.png)
 *
 * This operator maintains an internal state and emits it after processing each value as follows:
 *
 * 该操作符会维护一个内部状态，并在处理每个值后发送它，如下所示：
 *
 * 1. First value arrives
 *
 *    第一个值抵达
 *
 * - If a `seed` value was supplied (as the second argument to `scan`), let `state = seed` and `value = firstValue`.
 *
 *   如果提供了 `seed` 值（作为 `scan` 的第二个参数），则让 `state = seed` 和 `value = firstValue`。
 *
 * - If NO `seed` value was supplied (no second argument), let `state = firstValue` and go to 3.
 *
 *   如果没有提供 `seed` 值（没有第二个参数），则让 `state = firstValue` 并转到 3。
 *
 * 2. Let `state = accumulator(state, value)`.
 *
 *    让 `state = accumulator(state, value)`。
 *
 * - If an error is thrown by `accumulator`, notify the consumer of an error. The process ends.
 *
 *   如果 `accumulator` 抛出错误，则向使用者通知一个错误。该过程结束。
 *
 * 3. Emit `state`.
 *
 *    发送 `state`。
 *
 * 4. Next value arrives, let `value = nextValue`, go to 2.
 *
 *    下一个值抵达，让 `value = nextValue`，转到 2。
 *
 * ## Examples
 *
 * ## 例子
 *
 * An average of previous numbers. This example shows how
 * not providing a `seed` can prime the stream with the
 * first value from the source.
 *
 * 先前数字的平均值。此示例显示了如果不提供 `seed` 就会使用来自源的第一个值来初始化流。
 *
 * ```ts
 * import { of, scan, map } from 'rxjs';
 *
 * const numbers$ = of(1, 2, 3);
 *
 * numbers$
 *   .pipe(
 *     // Get the sum of the numbers coming in.
 *     scan((total, n) => total + n),
 *     // Get the average by dividing the sum by the total number
 *     // received so far (which is 1 more than the zero-based index).
 *     map((sum, index) => sum / (index + 1))
 *   )
 *   .subscribe(console.log);
 * ```
 *
 * The Fibonacci sequence. This example shows how you can use
 * a seed to prime accumulation process. Also... you know... Fibonacci.
 * So important to like, computers and stuff that its whiteboarded
 * in job interviews. Now you can show them the Rx version! (Please don't, haha)
 *
 * 斐波那契数列。这个例子展示了如何使用种子来启动积累过程。另外，你懂的，斐波那契对于计算机和同事们非常重要，以至于它常常在求职面试中写在白板上。现在你可以向他们秀一下 Rx 版本了！（别当真，哈哈）
 *
 * ```ts
 * import { interval, scan, map, startWith } from 'rxjs';
 *
 * const firstTwoFibs = [0, 1];
 * // An endless stream of Fibonacci numbers.
 * const fibonacci$ = interval(1000).pipe(
 *   // Scan to get the fibonacci numbers (after 0, 1)
 *   scan(([a, b]) => [b, a + b], firstTwoFibs),
 *   // Get the second number in the tuple, it's the one you calculated
 *   map(([, n]) => n),
 *   // Start with our first two digits :)
 *   startWith(...firstTwoFibs)
 * );
 *
 * fibonacci$.subscribe(console.log);
 * ```
 * @see {@link expand}
 * @see {@link mergeScan}
 * @see {@link reduce}
 * @see {@link switchScan}
 * @param accumulator A "reducer function". This will be called for each value after an initial state is
 * acquired.
 *
 * 一个“归结器函数”。这将在获得初始状态后针对每个值进行调用。
 *
 * @param seed The initial state. If this is not provided, the first value from the source will
 * be used as the initial state, and emitted without going through the accumulator. All subsequent values
 * will be processed by the accumulator function. If this is provided, all values will go through
 * the accumulator function.
 *
 * 初始状态。如果未提供，则会把源中的第一个值用作初始状态，并在不经过累加器的情况下发送。则后续的所有值都会由累加器函数处理。如果提供了它，则所有值都会传给累加器函数。
 *
 * @return A function that returns an Observable of the accumulated values.
 *
 * 返回累加结果的 Observable 的函数。
 *
 */
export function scan<V, A, S>(accumulator: (acc: V | A | S, value: V, index: number) => A, seed?: S): OperatorFunction<V, V | A> {
  // providing a seed of `undefined` *should* be valid and trigger
  // hasSeed! so don't use `seed !== undefined` checks!
  // For this reason, we have to check it here at the original call site
  // otherwise inside Operator/Subscriber we won't know if `undefined`
  // means they didn't provide anything or if they literally provided `undefined`
  return operate(scanInternals(accumulator, seed as S, arguments.length >= 2, true));
}
