import { reduce } from './reduce';
import { MonoTypeOperatorFunction } from '../types';
import { isFunction } from '../util/isFunction';

/**
 * The Max operator operates on an Observable that emits numbers (or items that can be compared with a provided function),
 * and when source Observable completes it emits a single item: the item with the largest value.
 *
 * `max` 操作符会对发送数字（或可用所提供的函数进行比较的条目）的 Observable 进行操作，当源 Observable 完成时，它会发送单个条目：具有最大值的条目。
 *
 * ![](max.png)
 *
 * ## Examples
 *
 * ## 例子
 *
 * Get the maximal value of a series of numbers
 *
 * 获取一系列数字的最大值
 *
 * ```ts
 * import { of, max } from 'rxjs';
 *
 * of(5, 4, 7, 2, 8)
 *   .pipe(max())
 *   .subscribe(x => console.log(x));
 *
 * // Outputs
 * // 8
 * ```
 *
 * Use a comparer function to get the maximal item
 *
 * 使用比较器函数获取最大条目
 *
 * ```ts
 * import { of, max } from 'rxjs';
 *
 * of(
 *   { age: 7, name: 'Foo' },
 *   { age: 5, name: 'Bar' },
 *   { age: 9, name: 'Beer' }
 * ).pipe(
 *   max((a, b) => a.age < b.age ? -1 : 1)
 * )
 * .subscribe(x => console.log(x.name));
 *
 * // Outputs
 * // 'Beer'
 * ```
 * @see {@link min}
 * @param {Function} [comparer] - Optional comparer function that it will use instead of its default to compare the
 *   value of two items.
 *
 *   可选的比较器函数，将使用它来比较两个条目的值，以代替默认的比较逻辑。
 *
 * @return A function that returns an Observable that emits item with the
 * largest value.
 *
 * 一个返回 Observable 的函数，该 Observable 会发送具有最大值的条目。
 *
 */
export function max<T>(comparer?: (x: T, y: T) => number): MonoTypeOperatorFunction<T> {
  return reduce(isFunction(comparer) ? (x, y) => (comparer(x, y) > 0 ? x : y) : (x, y) => (x > y ? x : y));
}
