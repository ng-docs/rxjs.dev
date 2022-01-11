import { OperatorFunction, ObservableInput } from '../types';
import { zip } from '../observable/zip';
import { joinAllInternals } from './joinAllInternals';

/**
 * Collects all observable inner sources from the source, once the source completes,
 * it will subscribe to all inner sources, combining their values by index and emitting
 * them.
 *
 * 从源收集所有可观察的内部源，一旦源完成，它将订阅所有内部源，通过索引组合它们的值并发出它们。
 *
 * @see {@link zipWith}
 * @see {@link zip}
 */
export function zipAll<T>(): OperatorFunction<ObservableInput<T>, T[]>;
export function zipAll<T>(): OperatorFunction<any, T[]>;
export function zipAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
export function zipAll<R>(project: (...values: Array<any>) => R): OperatorFunction<any, R>;

export function zipAll<T, R>(project?: (...values: T[]) => R) {
  return joinAllInternals(zip, project);
}
