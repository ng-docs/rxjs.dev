import { ObservableInput, OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { mergeInternals } from './mergeInternals';

/**
 * Applies an accumulator function over the source Observable where the
 * accumulator function itself returns an Observable, then each intermediate
 * Observable returned is merged into the output Observable.
 *
 * 在源 Observable 上调用累加器函数，该函数会返回一个 Observable，然后把返回的每个中间 Observable 合并到输出 Observable 中。
 *
 * <span class="informal">It's like {@link scan}, but the Observables returned
 * by the accumulator are merged into the outer Observable.</span>
 *
 * <span class="informal">它很像 {@link scan}，但是该累加器返回的 Observable 会被合并到外部 Observable 中。</span>
 *
 * The first parameter of the `mergeScan` is an `accumulator` function which is
 * being called every time the source Observable emits a value. `mergeScan` will
 * subscribe to the value returned by the `accumulator` function and will emit
 * values to the subscriber emitted by inner Observable.
 *
 * `mergeScan` 的第一个参数是一个 `accumulator` 函数，每当源 Observable 发送一个值时都会调用它。`mergeScan` 会订阅 `accumulator` 函数返回的值，并将这些值发送给内部 Observable 的订阅者。
 *
 * The `accumulator` function is being called with three parameters passed to it:
 * `acc`, `value` and `index`. The `acc` parameter is used as the state parameter
 * whose value is initially set to the `seed` parameter (the second parameter
 * passed to the `mergeScan` operator).
 *
 * 调用 `accumulator` 函数时要传给它三个参数： `acc`、`value` 和 `index`。`acc` 参数用作状态参数，其值最初设置为 `seed` 参数（即传给 `mergeScan` 操作符的第二个参数）。
 *
 * `mergeScan` internally keeps the value of the `acc` parameter: as long as the
 * source Observable emits without inner Observable emitting, the `acc` will be
 * set to `seed`. The next time the inner Observable emits a value, `mergeScan`
 * will internally remember it and it will be passed to the `accumulator`
 * function as `acc` parameter the next time source emits.
 *
 * `mergeScan` 会在内部保留 `acc` 参数的值：当源 Observable 发出了值而内部 Observable 没有发送时，`acc` 就会被设置为 `seed`。下次当内部 Observable 发送一个值时，`mergeScan` 就会在内部记住它，并在下次 source 发出值时将它作为 `acc` 参数传给 `accumulator` 函数。
 *
 * The `value` parameter of the `accumulator` function is the value emitted by the
 * source Observable, while the `index` is a number which represent the order of the
 * current emission by the source Observable. It starts with 0.
 *
 * `accumulator` 函数的 `value` 参数是源 Observable 发出的值，而 `index` 是一个数字，表示源 Observable 当前发送的序号。它从 0 开始。
 *
 * The last parameter to the `mergeScan` is the `concurrent` value which defaults
 * to Infinity. It represents the maximum number of inner Observable subscriptions
 * at a time.
 *
 * `mergeScan` 的最后一个参数是 `concurrent` 值，默认为 Infinity。它表示每次订阅内部 Observable 的最大数量。
 *
 * ## Example
 *
 * ## 例子
 *
 * Count the number of click events
 *
 * 统计点击事件的数量
 *
 * ```ts
 * import { fromEvent, map, mergeScan, of } from 'rxjs';
 *
 * const click$ = fromEvent(document, 'click');
 * const one$ = click$.pipe(map(() => 1));
 * const seed = 0;
 * const count$ = one$.pipe(
 *   mergeScan((acc, one) => of(acc + one), seed)
 * );
 *
 * count$.subscribe(x => console.log(x));
 *
 * // Results:
 * // 1
 * // 2
 * // 3
 * // 4
 * // ...and so on for each click
 * ```
 * @see {@link scan}
 * @see {@link switchScan}
 * @param {function(acc: R, value: T): Observable<R>} accumulator
 * The accumulator function called on each source value.
 *
 * 要针对源的每个值进行调用的累加器函数。
 *
 * @param seed The initial accumulation value.
 *
 * 累加初始值。
 *
 * @param {number} [concurrent=Infinity] Maximum number of
 * input Observables being subscribed to concurrently.
 * @return A function that returns an Observable of the accumulated values.
 *
 * 返回累加结果的 Observable 的函数。
 *
 */
export function mergeScan<T, R>(
  accumulator: (acc: R, value: T, index: number) => ObservableInput<R>,
  seed: R,
  concurrent = Infinity
): OperatorFunction<T, R> {
  return operate((source, subscriber) => {
    // The accumulated state.
    let state = seed;

    return mergeInternals(
      source,
      subscriber,
      (value, index) => accumulator(state, value, index),
      concurrent,
      (value) => {
        state = value;
      },
      false,
      undefined,
      () => (state = null!)
    );
  });
}
