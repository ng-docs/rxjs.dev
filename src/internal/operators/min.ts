import { reduce } from './reduce';
import { MonoTypeOperatorFunction } from '../types';
import { isFunction } from '../util/isFunction';

/**
 * The Min operator operates on an Observable that emits numbers (or items that can be compared with a provided function),
 * and when source Observable completes it emits a single item: the item with the smallest value.
 *
 * Min 运算符对发出数字（或可与提供的函数比较的项目）的 Observable 进行操作，当源 Observable 完成时，它会发出单个项目：具有最小值的项目。
 *
 * ![](min.png)
 *
 * ## Examples
 *
 * ## 例子
 *
 * Get the minimal value of a series of numbers
 *
 * 获取一系列数字的最小值
 *
 * ```ts
 * import { of, min } from 'rxjs';
 *
 * of(5, 4, 7, 2, 8)
 *   .pipe(min())
 *   .subscribe(x => console.log(x));
 *
 * // Outputs
 * // 2
 * ```
 *
 * Use a comparer function to get the minimal item
 *
 * 使用比较器函数获取最小项目
 *
 * ```ts
 * import { of, min } from 'rxjs';
 *
 * of(
 *   { age: 7, name: 'Foo' },
 *   { age: 5, name: 'Bar' },
 *   { age: 9, name: 'Beer' }
 * ).pipe(
 *   min((a, b) => a.age < b.age ? -1 : 1)
 * )
 * .subscribe(x => console.log(x.name));
 *
 * // Outputs
 * // 'Bar'
 * ```
 * @see {@link max}
 * @param {Function} [comparer] - Optional comparer function that it will use instead of its default to compare the
 * value of two items.
 * @return A function that returns an Observable that emits item with the
 * smallest value.
 *
 * 一个返回 Observable 的函数，该 Observable 发出具有最小值的项目。
 *
 */
export function min<T>(comparer?: (x: T, y: T) => number): MonoTypeOperatorFunction<T> {
  return reduce(isFunction(comparer) ? (x, y) => (comparer(x, y) < 0 ? x : y) : (x, y) => (x < y ? x : y));
}
