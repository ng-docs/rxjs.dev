import { Observable } from '../Observable';
import { SchedulerLike } from '../types';
import { from } from './from';

/**
 * @deprecated Use `from(Object.entries(obj))` instead. Will be removed in v8.
 *
 * 使用 `from(Object.entries(obj))` 代替。将在 v8 中删除。
 *
 */
export function pairs<T>(arr: readonly T[], scheduler?: SchedulerLike): Observable<[string, T]>;
/**
 * @deprecated Use `from(Object.entries(obj))` instead. Will be removed in v8.
 *
 * 使用 `from(Object.entries(obj))` 代替。将在 v8 中删除。
 *
 */
export function pairs<O extends Record<string, unknown>>(obj: O, scheduler?: SchedulerLike): Observable<[keyof O, O[keyof O]]>;
/**
 * @deprecated Use `from(Object.entries(obj))` instead. Will be removed in v8.
 *
 * 使用 `from(Object.entries(obj))` 代替。将在 v8 中删除。
 *
 */
export function pairs<T>(iterable: Iterable<T>, scheduler?: SchedulerLike): Observable<[string, T]>;
/**
 * @deprecated Use `from(Object.entries(obj))` instead. Will be removed in v8.
 *
 * 使用 `from(Object.entries(obj))` 代替。将在 v8 中删除。
 *
 */
export function pairs(
  n: number | bigint | boolean | ((...args: any[]) => any) | symbol,
  scheduler?: SchedulerLike
): Observable<[never, never]>;

/**
 * Convert an object into an Observable of `[key, value]` pairs.
 *
 * 将对象转换为 `[key, value]` 对的 Observable。
 *
 * <span class="informal">Turn entries of an object into a stream.</span>
 *
 * 将对象的条目转换为流。
 *
 * ![](pairs.png)
 *
 * `pairs` takes an arbitrary object and returns an Observable that emits arrays. Each
 * emitted array has exactly two elements - the first is a key from the object
 * and the second is a value corresponding to that key. Keys are extracted from
 * an object via `Object.keys` function, which means that they will be only
 * enumerable keys that are present on an object directly - not ones inherited
 * via prototype chain.
 *
 * `pairs` 接受一个任意对象并返回一个发出数组的 Observable。每个发出的数组都有两个元素——第一个是来自对象的键，第二个是对应于该键的值。键是通过 `Object.keys` 函数从对象中提取的，这意味着它们只是直接存在于对象上的可枚举键——而不是通过原型链继承的键。
 *
 * By default, these arrays are emitted synchronously. To change that you can
 * pass a {@link SchedulerLike} as a second argument to `pairs`.
 *
 * 默认情况下，这些数组是同步发出的。要改变这一点，你可以将 {@link SchedulerLike} 作为第二个参数传递给 `pairs` 。
 *
 * ## Example
 *
 * ## 例子
 *
 * Converts an object to an Observable
 *
 * 将对象转换为 Observable
 *
 * ```ts
 * import { pairs } from 'rxjs';
 *
 * const obj = {
 *   foo: 42,
 *   bar: 56,
 *   baz: 78
 * };
 *
 * pairs(obj).subscribe({
 *   next: value => console.log(value),
 *   complete: () => console.log('Complete!')
 * });
 *
 * // Logs:
 * // ['foo', 42]
 * // ['bar', 56]
 * // ['baz', 78]
 * // 'Complete!'
 * ```
 *
 * ### Object.entries required
 *
 * ### 需要对象条目
 *
 * In IE, you will need to polyfill `Object.entries` in order to use this.
 * [MDN has a polyfill here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
 *
 * 在 IE 中，你需要填充 `Object.entries` 才能使用它。 [MDN 这里有一个 polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
 *
 * @param {Object} obj The object to inspect and turn into an
 * Observable sequence.
 *
 * 要检查并转换为 Observable 序列的对象。
 *
 * @param {Scheduler} [scheduler] An optional IScheduler to schedule
 * when resulting Observable will emit values.
 * @returns {(Observable<Array<string|T>>)} An observable sequence of
 * [key, value] pairs from the object.
 *
 * 对象中可观察到的[键值][key,%20value]对序列。
 *
 * @deprecated Use `from(Object.entries(obj))` instead. Will be removed in v8.
 *
 * 使用 `from(Object.entries(obj))` 代替。将在 v8 中删除。
 *
 */
export function pairs(obj: any, scheduler?: SchedulerLike) {
  return from(Object.entries(obj), scheduler as any);
}
