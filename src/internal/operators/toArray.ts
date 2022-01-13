import { reduce } from './reduce';
import { OperatorFunction } from '../types';
import { operate } from '../util/lift';

const arrReducer = (arr: any[], value: any) => (arr.push(value), arr);

/**
 * Collects all source emissions and emits them as an array when the source completes.
 *
 * 收集所有源排放，并在源完成时将它们作为数组发送。
 *
 * <span class="informal">Get all values inside an array when the source completes</span>
*
 * <span class="informal">源完成时获取数组中的所有值</span>
 *
 * ![](toArray.png)
 *
 * `toArray` will wait until the source Observable completes before emitting
 * the array containing all emissions. When the source Observable errors no
 * array will be emitted.
 *
 * `toArray` 将等到源 Observable 完成后再发送包含所有发送的数组。当源 Observable 错误时，不会发送任何数组。
 *
 * ## Example
 *
 * ## 例子
 *
 * ```ts
 * import { interval, take, toArray } from 'rxjs';
 *
 * const source = interval(1000);
 * const example = source.pipe(
 *   take(10),
 *   toArray()
 * );
 *
 * example.subscribe(value => console.log(value));
 *
 * // output: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
 * ```
 * @return A function that returns an Observable that emits an array of items
 * emitted by the source Observable when source completes.
 *
 * 一个函数，它返回一个 Observable，它在源完成时发送源 Observable 发送的一组条目。
 *
 */
export function toArray<T>(): OperatorFunction<T, T[]> {
  // Because arrays are mutable, and we're mutating the array in this
  // reducer process, we have to escapulate the creation of the initial
  // array within this `operate` function.
  return operate((source, subscriber) => {
    reduce(arrReducer, [] as T[])(source).subscribe(subscriber);
  });
}
