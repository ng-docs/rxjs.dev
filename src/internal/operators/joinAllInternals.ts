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
 * 从源 Observable 中收集所有内部源。一旦此源完成，就使用给定的静态联结函数来联结这些值。
 *
 * This is used for {@link combineLatestAll} and {@link zipAll} which both have the
 * same behavior of collecting all inner observables, then operating on them.
 *
 * 这已被 {@link combineLatestAll} 和 {@link zipAll} 使用了，它们都具有这种共同行为：收集所有内部 observables，然后对它们进行操作。
 *
 * @param joinFn The type of static join to apply to the sources collected
 *
 * 用于收集源的静态联结的类型
 *
 * @param project The projection function to apply to the values, if any
 *
 * 用来生成值的投影函数（如果有）
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
