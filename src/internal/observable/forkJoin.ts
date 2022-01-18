import { Observable } from '../Observable';
import { ObservedValueOf, ObservableInputTuple, ObservableInput } from '../types';
import { argsArgArrayOrObject } from '../util/argsArgArrayOrObject';
import { innerFrom } from './innerFrom';
import { popResultSelector } from '../util/args';
import { OperatorSubscriber } from '../operators/OperatorSubscriber';
import { mapOneOrManyArgs } from '../util/mapOneOrManyArgs';
import { createObject } from '../util/createObject';
import { AnyCatcher } from '../AnyCatcher';

// forkJoin(any)
// We put this first because we need to catch cases where the user has supplied
// _exactly `any`_ as the argument. Since `any` literally matches _anything_,
// we don't want it to randomly hit one of the other type signatures below,
// as we have no idea at build-time what type we should be returning when given an any.

/**
 * You have passed `any` here, we can't figure out if it is
 * an array or an object, so you're getting `unknown`. Use better types.
 *
 * 如果你在这里传入了 `any`，我们就无法确定它是数组还是对象，所以要使用 `unknown`。请使用更好的类型。
 *
 * @param arg Something typed as `any`
 *
 * 类型为 `any` 的参数
 *
 */
export function forkJoin<T extends AnyCatcher>(arg: T): Observable<unknown>;

// forkJoin(null | undefined)
export function forkJoin(scheduler: null | undefined): Observable<never>;

// forkJoin([a, b, c])
export function forkJoin(sources: readonly []): Observable<never>;
export function forkJoin<A extends readonly unknown[]>(sources: readonly [...ObservableInputTuple<A>]): Observable<A>;
export function forkJoin<A extends readonly unknown[], R>(
  sources: readonly [...ObservableInputTuple<A>],
  resultSelector: (...values: A) => R
): Observable<R>;

// forkJoin(a, b, c)
/**
 * @deprecated Pass an array of sources instead. The rest-parameters signature will be removed in v8. Details: <https://rxjs.dev/deprecations/array-argument>
 *
 * 改为传递一个源数组。其余参数签名将在 v8 中删除。详细信息： <https://rxjs.dev/deprecations/array-argument>
 *
 */
export function forkJoin<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A>;
/**
 * @deprecated Pass an array of sources instead. The rest-parameters signature will be removed in v8. Details: <https://rxjs.dev/deprecations/array-argument>
 *
 * 改为传递一个源数组。其余参数签名将在 v8 中删除。详细信息： <https://rxjs.dev/deprecations/array-argument>
 *
 */
export function forkJoin<A extends readonly unknown[], R>(
  ...sourcesAndResultSelector: [...ObservableInputTuple<A>, (...values: A) => R]
): Observable<R>;

// forkJoin({a, b, c})
export function forkJoin(sourcesObject: { [K in any]: never }): Observable<never>;
export function forkJoin<T extends Record<string, ObservableInput<any>>>(
  sourcesObject: T
): Observable<{ [K in keyof T]: ObservedValueOf<T[K]> }>;

/**
 * Accepts an `Array` of {@link ObservableInput} or a dictionary `Object` of {@link ObservableInput} and returns
 * an {@link Observable} that emits either an array of values in the exact same order as the passed array,
 * or a dictionary of values in the same shape as the passed dictionary.
 *
 * 接受一个 {@link ObservableInput} 的 `Array` 或 {@link ObservableInput} 的字典 `Object`，并返回一个 {@link Observable}，它用与传入的数组完全相同的顺序发出一个值数组，或者用与传入的字典相同的构型。
 *
 * <span class="informal">Wait for Observables to complete and then combine last values they emitted;
 * complete immediately if an empty array is passed.</span>
 *
 * <span class="informal">等待这些 Observables 完成，然后把它们发出的最后一个值组合起来；如果传递了一个空数组，则立即完成。</span>
 *
 * ![](forkJoin.png)
 *
 * `forkJoin` is an operator that takes any number of input observables which can be passed either as an array
 * or a dictionary of input observables. If no input observables are provided (e.g. an empty array is passed),
 * then the resulting stream will complete immediately.
 *
 * `forkJoin` 是一个操作符，它接受任意数量的输入 observable，这些输入 observable 可以作为数组或输入 observable 的字典传递。如果没有提供输入 observables（例如传递一个空数组），那么结果流将立即完成。
 *
 * `forkJoin` will wait for all passed observables to emit and complete and then it will emit an array or an object with last
 * values from corresponding observables.
 *
 * `forkJoin` 将等待所有传入的 observables 发出并完成，然后它会发出一个数组或一个对象，其中包含来自相应 observables 的最后一个值。
 *
 * If you pass an array of `n` observables to the operator, then the resulting
 * array will have `n` values, where the first value is the last one emitted by the first observable,
 * second value is the last one emitted by the second observable and so on.
 *
 * 如果你将一个包含 `n` 个 observable 的数组传给本操作符，那么结果数组将有 `n` 个值，其第一个值是第一个 observable 发出的最后一个值，第二个值是第二个 observable 发出的最后一个值，依此类推。
 *
 * If you pass a dictionary of observables to the operator, then the resulting
 * objects will have the same keys as the dictionary passed, with their last values they have emitted
 * located at the corresponding key.
 *
 * 如果你将 Observable 的字典传递给操作符，则生成的对象将具有与传递的字典相同的键名，它们发出的最后一个值位于相应的键名处。
 *
 * That means `forkJoin` will not emit more than once and it will complete after that. If you need to emit combined
 * values not only at the end of the lifecycle of passed observables, but also throughout it, try out {@link combineLatest}
 * or {@link zip} instead.
 *
 * 这意味着 `forkJoin` 不会发出超过一个值，并且会在此之后完成。如果你不仅需要在传入的 Observable 的生命周期结束时发出组合值，而且还需要在整个生命周期中发出组合值，请尝试使用 {@link combineLatest} 或 {@link zip}。
 *
 * In order for the resulting array to have the same length as the number of input observables, whenever any of
 * the given observables completes without emitting any value, `forkJoin` will complete at that moment as well
 * and it will not emit anything either, even if it already has some last values from other observables.
 * Conversely, if there is an observable that never completes, `forkJoin` will never complete either,
 * unless at any point some other observable completes without emitting a value, which brings us back to
 * the previous case. Overall, in order for `forkJoin` to emit a value, all given observables
 * have to emit something at least once and complete.
 *
 * 为了使结果数组的长度与输入的 observables 的数量相同，只要任何给定的 observables 完成而没有发出任何值，`forkJoin` 也会在那个时刻完成并且它也不会发出任何值，即使它已经具有来自其它 Observable 的一些最后值。相反，如果有一个 observable 永远不会完成，`forkJoin` 也永远不会完成，除非其它 observable 在某个时刻都完成而不发出值，这会让我们回到前面的情况。总而言之，为了让 `forkJoin` 发出一个值，所有给定的 observables 都必须至少发出一次并完成。
 *
 * If any given observable errors at some point, `forkJoin` will error as well and immediately unsubscribe
 * from the other observables.
 *
 * 如果在某个时候任何给定的 observable 出错，则 `forkJoin` 也会出错并立即退订其它 observables。
 *
 * Optionally `forkJoin` accepts a `resultSelector` function, that will be called with values which normally
 * would land in the emitted array. Whatever is returned by the `resultSelector`, will appear in the output
 * observable instead. This means that the default `resultSelector` can be thought of as a function that takes
 * all its arguments and puts them into an array. Note that the `resultSelector` will be called only
 * when `forkJoin` is supposed to emit a result.
 *
 * `forkJoin` 会接受一个可选的 `resultSelector` 函数为参数，该函数将使用要发出的数组中的值为参数进行调用。无论 `resultSelector` 返回什么，都会出现在输出 observable 中。这意味着默认的 `resultSelector` 可以被认为是一个函数，它接受它的所有参数并将它们放入一个数组中。请注意，只有当 `forkJoin` 应该发出结果时才会调用 `resultSelector`。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Use `forkJoin` with a dictionary of observable inputs
 *
 * 将 `forkJoin` 与可观察输入的字典一起使用
 *
 * ```ts
 * import { forkJoin, of, timer } from 'rxjs';
 *
 * const observable = forkJoin({
 *   foo: of(1, 2, 3, 4),
 *   bar: Promise.resolve(8),
 *   baz: timer(4000)
 * });
 * observable.subscribe({
 *  next: value => console.log(value),
 *  complete: () => console.log('This is how it ends!'),
 * });
 *
 * // Logs:
 * // { foo: 4, bar: 8, baz: 0 } after 4 seconds
 * // 'This is how it ends!' immediately after
 * ```
 *
 * Use `forkJoin` with an array of observable inputs
 *
 * 将 `forkJoin` 与可观察输入的数组一起使用
 *
 * ```ts
 * import { forkJoin, of, timer } from 'rxjs';
 *
 * const observable = forkJoin([
 *   of(1, 2, 3, 4),
 *   Promise.resolve(8),
 *   timer(4000)
 * ]);
 * observable.subscribe({
 *  next: value => console.log(value),
 *  complete: () => console.log('This is how it ends!'),
 * });
 *
 * // Logs:
 * // [4, 8, 0] after 4 seconds
 * // 'This is how it ends!' immediately after
 * ```
 * @see {@link combineLatest}
 * @see {@link zip}
 * @param {...ObservableInput} args Any number of Observables provided either as an array or as an arguments
 * passed directly to the operator.
 *
 * 任意数量的 Observables 以数组参数的形式提供，或作为直接传递给操作符的参数提供。
 *
 * @param {function} [project] Function that takes values emitted by input Observables and returns value
 * that will appear in resulting Observable instead of default array.
 *
 * 一个函数，接受输入 Observables 发出的值，并返回将出现在结果 Observable （而不是默认的数组）中的值。
 *
 * @return {Observable} Observable emitting either an array of last values emitted by passed Observables
 * or value from project function.
 *
 * Observable 发出由传入的 Observables 发出的最后一个值的数组或来自投影函数的值。
 *
 */
export function forkJoin(...args: any[]): Observable<any> {
  const resultSelector = popResultSelector(args);
  const { args: sources, keys } = argsArgArrayOrObject(args);
  const result = new Observable((subscriber) => {
    const { length } = sources;
    if (!length) {
      subscriber.complete();
      return;
    }
    const values = new Array(length);
    let remainingCompletions = length;
    let remainingEmissions = length;
    for (let sourceIndex = 0; sourceIndex < length; sourceIndex++) {
      let hasValue = false;
      innerFrom(sources[sourceIndex]).subscribe(
        new OperatorSubscriber(
          subscriber,
          (value) => {
            if (!hasValue) {
              hasValue = true;
              remainingEmissions--;
            }
            values[sourceIndex] = value;
          },
          () => remainingCompletions--,
          undefined,
          () => {
            if (!remainingCompletions || !hasValue) {
              if (!remainingEmissions) {
                subscriber.next(keys ? createObject(keys, values) : values);
              }
              subscriber.complete();
            }
          }
        )
      );
    }
  });
  return resultSelector ? result.pipe(mapOneOrManyArgs(resultSelector)) : result;
}
