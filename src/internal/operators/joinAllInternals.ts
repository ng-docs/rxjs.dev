import { Observable } from '../Observable';
import { ObservableInput, OperatorFunction } from '../types';
import { identity } from '../util/identity';
import { mapOneOrManyArgs } from '../util/mapOneOrManyArgs';
import { pipe } from '../util/pipe';
import { mergeMap } from './mergeMap';
import { toArray } from './toArray';

/**
 * Collects all of the inner sources from source observable. Then, once the
 * source completes, joins the values using the given static.
 *
 * 从来源可观察者中收集所有内部源。然后，一旦源完成，使用给定的静态连接值。
 *
 * This is used for {@link combineLatestAll} and {@link zipAll} which both have the
 * same behavior of collecting all inner observables, then operating on them.
 *
 * 这用于 {@link combineLatestAll} 和 {@link zipAll}，它们都具有收集所有内部 observables 的相同行为，然后对它们进行操作。
 *
 * @param joinFn The type of static join to apply to the sources collected
 *
 * 应用于收集的源的静态连接类型
 *
 * @param project The projection function to apply to the values, if any
 *
 * 应用于值的投影函数（如果有）
 *
 */
export function joinAllInternals<T, R>(joinFn: (sources: ObservableInput<T>[]) => Observable<T>, project?: (...args: any[]) => R) {
  return pipe(
    // Collect all inner sources into an array, and emit them when the
    // source completes.
    toArray() as OperatorFunction<ObservableInput<T>, ObservableInput<T>[]>,
    // Run the join function on the collected array of inner sources.
    mergeMap((sources) => joinFn(sources)),
    // If a projection function was supplied, apply it to each result.
    project ? mapOneOrManyArgs(project) : (identity as any)
  );
}
