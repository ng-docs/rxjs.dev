import { OperatorFunction, ObservableInputTuple } from '../types';
import { raceInit } from '../observable/race';
import { operate } from '../util/lift';
import { identity } from '../util/identity';

/**
 * Creates an Observable that mirrors the first source Observable to emit a next,
 * error or complete notification from the combination of the Observable to which
 * the operator is applied and supplied Observables.
 *
 * 返回一个 Observable，它会镜像所提供的这些源中首先发出 next、error 或 complete 的那个，这些源包括源 Observable 和那些传入的 Observable 参数。
 *
 * ## Example
 *
 * ## 例子
 *
 * ```ts
 * import { interval, map, raceWith } from 'rxjs';
 *
 * const obs1 = interval(7000).pipe(map(() => 'slow one'));
 * const obs2 = interval(3000).pipe(map(() => 'fast one'));
 * const obs3 = interval(5000).pipe(map(() => 'medium one'));
 *
 * obs1
 *   .pipe(raceWith(obs2, obs3))
 *   .subscribe(winner => console.log(winner));
 *
 * // Outputs
 * // a series of 'fast one'
 * ```
 * @param otherSources Sources used to race for which Observable emits first.
 *
 * 一些用于竞争哪个 Observable 最先发出条目的源。
 *
 * @return A function that returns an Observable that mirrors the output of the
 * first Observable to emit an item.
 *
 * 一个返回 Observable 的函数，该 Observable 会镜像首先发出了条目的 Observable 的输出。
 *
 */
export function raceWith<T, A extends readonly unknown[]>(
  ...otherSources: [...ObservableInputTuple<A>]
): OperatorFunction<T, T | A[number]> {
  return !otherSources.length
    ? identity
    : operate((source, subscriber) => {
        raceInit<T | A[number]>([source, ...otherSources])(subscriber);
      });
}
