import { distinctUntilChanged } from './distinctUntilChanged';
import { MonoTypeOperatorFunction } from '../types';

/* tslint:disable:max-line-length */
export function distinctUntilKeyChanged<T>(key: keyof T): MonoTypeOperatorFunction<T>;
export function distinctUntilKeyChanged<T, K extends keyof T>(key: K, compare: (x: T[K], y: T[K]) => boolean): MonoTypeOperatorFunction<T>;
/* tslint:enable:max-line-length */

/**
 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from the previous item,
 * using a property accessed by using the key provided to check if the two items are distinct.
 *
 * 返回一个 Observable，该 Observable 发出源 Observable 发出的所有通过比较与前一个项目不同的项目，使用通过使用提供的键访问的属性来检查这两个项目是否不同。
 *
 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
 *
 * 如果提供了一个比较器函数，那么它将为每个项目调用以测试是否应该发出该值。
 *
 * If a comparator function is not provided, an equality check is used by default.
 *
 * 如果未提供比较器功能，则默认使用相等检查。
 *
 * ## Examples
 *
 * ## 例子
 *
 * An example comparing the name of persons
 *
 * 一个比较人名的例子
 *
 * ```ts
 * import { of, distinctUntilKeyChanged } from 'rxjs';
 *
 * of(
 *   { age: 4, name: 'Foo' },
 *   { age: 7, name: 'Bar' },
 *   { age: 5, name: 'Foo' },
 *   { age: 6, name: 'Foo' }
 * ).pipe(
 *   distinctUntilKeyChanged('name')
 * )
 * .subscribe(x => console.log(x));
 *
 * // displays:
 * // { age: 4, name: 'Foo' }
 * // { age: 7, name: 'Bar' }
 * // { age: 5, name: 'Foo' }
 * ```
 *
 * An example comparing the first letters of the name
 *
 * 比较名称的第一个字母的示例
 *
 * ```ts
 * import { of, distinctUntilKeyChanged } from 'rxjs';
 *
 * of(
 *   { age: 4, name: 'Foo1' },
 *   { age: 7, name: 'Bar' },
 *   { age: 5, name: 'Foo2' },
 *   { age: 6, name: 'Foo3' }
 * ).pipe(
 *   distinctUntilKeyChanged('name', (x, y) => x.substring(0, 3) === y.substring(0, 3))
 * )
 * .subscribe(x => console.log(x));
 *
 * // displays:
 * // { age: 4, name: 'Foo1' }
 * // { age: 7, name: 'Bar' }
 * // { age: 5, name: 'Foo2' }
 * ```
 * @see {@link distinct}
 * @see {@link distinctUntilChanged}
 * @param {string} key String key for object property lookup on each item.
 *
 * 用于在每个项目上查找对象属性的字符串键。
 *
 * @param {function} [compare] Optional comparison function called to test if an item is distinct from the previous item in the source.
 * @return A function that returns an Observable that emits items from the
 * source Observable with distinct values based on the key specified.
 *
 * 一个返回 Observable 的函数，它根据指定的键从源 Observable 发出具有不同值的项目。
 *
 */
export function distinctUntilKeyChanged<T, K extends keyof T>(key: K, compare?: (x: T[K], y: T[K]) => boolean): MonoTypeOperatorFunction<T> {
  return distinctUntilChanged((x: T, y: T) => compare ? compare(x[key], y[key]) : x[key] === y[key]);
}
