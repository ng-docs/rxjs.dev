import { not } from '../util/not';
import { filter } from '../operators/filter';
import { ObservableInput } from '../types';
import { Observable } from '../Observable';
import { innerFrom } from './innerFrom';

/**
 * @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.
 *
 * 使用闭包而不是 `thisArg` 。接受 `thisArg` 的签名将在 v8 中被删除。
 *
 */
export function partition<T, U extends T, A>(
  source: ObservableInput<T>,
  predicate: (this: A, value: T, index: number) => value is U,
  thisArg: A
): [Observable<U>, Observable<Exclude<T, U>>];
export function partition<T, U extends T>(
  source: ObservableInput<T>,
  predicate: (value: T, index: number) => value is U
): [Observable<U>, Observable<Exclude<T, U>>];

/**
 * @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.
 *
 * 使用闭包而不是 `thisArg` 。接受 `thisArg` 的签名将在 v8 中被删除。
 *
 */
export function partition<T, A>(
  source: ObservableInput<T>,
  predicate: (this: A, value: T, index: number) => boolean,
  thisArg: A
): [Observable<T>, Observable<T>];
export function partition<T>(source: ObservableInput<T>, predicate: (value: T, index: number) => boolean): [Observable<T>, Observable<T>];

/**
 * Splits the source Observable into two, one with values that satisfy a
 * predicate, and another with values that don't satisfy the predicate.
 *
 * 将源 Observable 拆分为两个，一个具有满足谓词的值，另一个具有不满足谓词的值。
 *
 * <span class="informal">It's like {@link filter}, but returns two Observables:
 * one like the output of {@link filter}, and the other with values that did not
 * pass the condition.</span>
 *
 * 它类似于 {@link filter}，但返回两个 Observable：一个类似于 {@link filter} 的输出，另一个具有未通过条件的值。
 *
 * ![](partition.png)
 *
 * `partition` outputs an array with two Observables that partition the values
 * from the source Observable through the given `predicate` function. The first
 * Observable in that array emits source values for which the predicate argument
 * returns true. The second Observable emits source values for which the
 * predicate returns false. The first behaves like {@link filter} and the second
 * behaves like {@link filter} with the predicate negated.
 *
 * `partition` 输出一个包含两个 Observable 的数组，它们通过给定的 `predicate` 函数对源 Observable 中的值进行分区。该数组中的第一个 Observable 发出谓词参数返回 true 的源值。第二个 Observable 发出谓词返回 false 的源值。第一个行为类似于 {@link filter}，第二个行为类似于 {@link filter}，谓词被否定。
 *
 * ## Example
 *
 * ## 例子
 *
 * Partition a set of numbers into odds and evens observables
 *
 * 将一组数字划分为奇数和偶数可观测值
 *
 * ```ts
 * import { of, partition } from 'rxjs';
 *
 * const observableValues = of(1, 2, 3, 4, 5, 6);
 * const [evens$, odds$] = partition(observableValues, value => value % 2 === 0);
 *
 * odds$.subscribe(x => console.log('odds', x));
 * evens$.subscribe(x => console.log('evens', x));
 *
 * // Logs:
 * // odds 1
 * // odds 3
 * // odds 5
 * // evens 2
 * // evens 4
 * // evens 6
 * ```
 * @see {@link filter}
 * @param {function(value: T, index: number): boolean} predicate A function that
 * evaluates each value emitted by the source Observable. If it returns `true`,
 * the value is emitted on the first Observable in the returned array, if
 * `false` the value is emitted on the second Observable in the array. The
 * `index` parameter is the number `i` for the i-th source emission that has
 * happened since the subscription, starting from the number `0`.
 *
 * 评估源 Observable 发出的每个值的函数。如果返回 `true` ，则在返回数组中的第一个 Observable 上发出该值，如果为 `false` ，则在数组中的第二个 Observable 上发出该值。 `index` 参数是自订阅以来发生的第 i 个源排放的数字 `i` ，从数字 `0` 开始。
 *
 * @param {any} [thisArg] An optional argument to determine the value of `this`
 * in the `predicate` function.
 * @return {[Observable<T>, Observable<T>]} An array with two Observables: one
 * with values that passed the predicate, and another with values that did not
 * pass the predicate.
 *
 * 一个包含两个 Observable 的数组：一个具有通过谓词的值，另一个具有未通过谓词的值。
 *
 */
export function partition<T>(
  source: ObservableInput<T>,
  predicate: (this: any, value: T, index: number) => boolean,
  thisArg?: any
): [Observable<T>, Observable<T>] {
  return [filter(predicate, thisArg)(innerFrom(source)), filter(not(predicate, thisArg))(innerFrom(source))] as [
    Observable<T>,
    Observable<T>
  ];
}
