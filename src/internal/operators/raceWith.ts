import { OperatorFunction, ObservableInputTuple } from '../types';
import { raceInit } from '../observable/race';
import { operate } from '../util/lift';
import { identity } from '../util/identity';

/**
 * Creates an Observable that mirrors the first source Observable to emit a next,
 * error or complete notification from the combination of the Observable to which
 * the operator is applied and supplied Observables.
 *
 * 创建一个镜像第一个源 Observable 的 Observable，以从应用操作符的 Observable 和提供的 Observables 的组合发出下一个、错误或完成通知。
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
 * 用于竞争 Observable 首先发出的源。
 *
 * @return A function that returns an Observable that mirrors the output of the
 * first Observable to emit an item.
 *
 * 一个返回 Observable 的函数，该函数反映了第一个 Observable 的输出以发射项目。
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
