import { Observable } from '../Observable';
import { ObservableInputTuple, SchedulerLike } from '../types';
import { concatAll } from '../operators/concatAll';
import { popScheduler } from '../util/args';
import { from } from './from';

export function concat<T extends readonly unknown[]>(...inputs: [...ObservableInputTuple<T>]): Observable<T[number]>;
export function concat<T extends readonly unknown[]>(
  ...inputsAndScheduler: [...ObservableInputTuple<T>, SchedulerLike]
): Observable<T[number]>;

/**
 * Creates an output Observable which sequentially emits all values from the first given
 * Observable and then moves on to the next.
 *
 * 创建一个输出 Observable，它顺序地从第一个给定的 Observable 发出所有值，然后移动到下一个。
 *
 * <span class="informal">Concatenates multiple Observables together by
 * sequentially emitting their values, one Observable after the other.</span>
 *
 * 通过顺序发出它们的值来连接多个 Observable，一个 Observable 一个接一个。
 *
 * ![](concat.png)
 *
 * `concat` joins multiple Observables together, by subscribing to them one at a time and
 * merging their results into the output Observable. You can pass either an array of
 * Observables, or put them directly as arguments. Passing an empty array will result
 * in Observable that completes immediately.
 *
 * `concat` 通过一次订阅一个并将其结果合并到输出 Observable 中，将多个 Observable 连接在一起。你可以传递 Observable 数组，也可以将它们直接作为参数。传递一个空数组将导致 Observable 立即完成。
 *
 * `concat` will subscribe to first input Observable and emit all its values, without
 * changing or affecting them in any way. When that Observable completes, it will
 * subscribe to then next Observable passed and, again, emit its values. This will be
 * repeated, until the operator runs out of Observables. When last input Observable completes,
 * `concat` will complete as well. At any given moment only one Observable passed to operator
 * emits values. If you would like to emit values from passed Observables concurrently, check out
 * {@link merge} instead, especially with optional `concurrent` parameter. As a matter of fact,
 * `concat` is an equivalent of `merge` operator with `concurrent` parameter set to `1`.
 *
 * `concat` 将订阅第一个输入 Observable 并发出其所有值，而不会以任何方式更改或影响它们。当该 Observable 完成时，它将订阅然后传递的下一个 Observable，并再次发出其值。这将重复，直到操作员用完 Observables。当最后一个输入 Observable 完成时，`concat` 也将完成。在任何给定时刻，只有一个传递给操作员的 Observable 发出值。如果你想同时从传递的 Observable 中发出值，请查看 {@link merge}，尤其是使用可选的 `concurrent` 参数。事实上，`concat` 相当于将 `concurrent` 参数设置为 `1` 的 `merge` 运算符。
 *
 * Note that if some input Observable never completes, `concat` will also never complete
 * and Observables following the one that did not complete will never be subscribed. On the other
 * hand, if some Observable simply completes immediately after it is subscribed, it will be
 * invisible for `concat`, which will just move on to the next Observable.
 *
 * 请注意，如果某些输入 Observable 永远不会完成，则 `concat` 也永远不会完成，并且未完成的 Observable 将永远不会被订阅。另一方面，如果某个 Observable 在订阅后立即完成，那么它对于 `concat` 将是不可见的，它只会移动到下一个 Observable。
 *
 * If any Observable in chain errors, instead of passing control to the next Observable,
 * `concat` will error immediately as well. Observables that would be subscribed after
 * the one that emitted error, never will.
 *
 * 如果链中的任何 Observable 出错，而不是将控制权传递给下一个 Observable，`concat` 也会立即出错。在发出错误之后订阅的 Observables 永远不会。
 *
 * If you pass to `concat` the same Observable many times, its stream of values
 * will be "replayed" on every subscription, which means you can repeat given Observable
 * as many times as you like. If passing the same Observable to `concat` 1000 times becomes tedious,
 * you can always use {@link repeat}.
 *
 * 如果你多次传递 `concat` 相同的 Observable，它的值流将在每个订阅上“重播”，这意味着你可以重复给定的 Observable 任意多次。如果将相同的 Observable 传递给 `concat` 1000 次变得乏味，你始终可以使用 {@link repeat}。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Concatenate a timer counting from 0 to 3 with a synchronous sequence from 1 to 10
 *
 * 连接一个从 0 到 3 的计时器与从 1 到 10 的同步序列
 *
 * ```ts
 * import { interval, take, range, concat } from 'rxjs';
 *
 * const timer = interval(1000).pipe(take(4));
 * const sequence = range(1, 10);
 * const result = concat(timer, sequence);
 * result.subscribe(x => console.log(x));
 *
 * // results in:
 * // 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3 -immediate-> 1 ... 10
 * ```
 *
 * Concatenate 3 Observables
 *
 * 连接 3 个 Observables
 *
 * ```ts
 * import { interval, take, concat } from 'rxjs';
 *
 * const timer1 = interval(1000).pipe(take(10));
 * const timer2 = interval(2000).pipe(take(6));
 * const timer3 = interval(500).pipe(take(10));
 *
 * const result = concat(timer1, timer2, timer3);
 * result.subscribe(x => console.log(x));
 *
 * // results in the following:
 * // (Prints to console sequentially)
 * // -1000ms-> 0 -1000ms-> 1 -1000ms-> ... 9
 * // -2000ms-> 0 -2000ms-> 1 -2000ms-> ... 5
 * // -500ms-> 0 -500ms-> 1 -500ms-> ... 9
 * ```
 *
 * Concatenate the same Observable to repeat it
 *
 * 连接相同的 Observable 以重复它
 *
 * ```ts
 * import { interval, take, concat } from 'rxjs';
 *
 * const timer = interval(1000).pipe(take(2));
 *
 * concat(timer, timer) // concatenating the same Observable!
 *   .subscribe({
 *     next: value => console.log(value),
 *     complete: () => console.log('...and it is done!')
 *   });
 *
 * // Logs:
 * // 0 after 1s
 * // 1 after 2s
 * // 0 after 3s
 * // 1 after 4s
 * // '...and it is done!' also after 4s
 * ```
 * @see {@link concatAll}
 * @see {@link concatMap}
 * @see {@link concatMapTo}
 * @see {@link startWith}
 * @see {@link endWith}
 * @param args Input Observables to concatenate.
 *
 * 输入 Observables 进行连接。
 *
 */
export function concat(...args: any[]): Observable<unknown> {
  return concatAll()(from(args, popScheduler(args)));
}
