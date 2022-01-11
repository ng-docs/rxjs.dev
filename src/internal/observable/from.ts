import { Observable } from '../Observable';
import { ObservableInput, SchedulerLike, ObservedValueOf } from '../types';
import { scheduled } from '../scheduled/scheduled';
import { innerFrom } from './innerFrom';

export function from<O extends ObservableInput<any>>(input: O): Observable<ObservedValueOf<O>>;
/**
 * @deprecated The `scheduler` parameter will be removed in v8. Use `scheduled`. Details: <https://rxjs.dev/deprecations/scheduler-argument>
 *
 * `scheduler` 参数将在 v8 中删除。使用 `scheduled` 的 .详细信息： [https](https://rxjs.dev/deprecations/scheduler-argument) ://rxjs.dev/deprecations/scheduler-argument
 *
 */
export function from<O extends ObservableInput<any>>(input: O, scheduler: SchedulerLike | undefined): Observable<ObservedValueOf<O>>;

/**
 * Creates an Observable from an Array, an array-like object, a Promise, an iterable object, or an Observable-like object.
 *
 * 从 Array、类数组对象、Promise、可迭代对象或类 Observable 对象创建 Observable。
 *
 * <span class="informal">Converts almost anything to an Observable.</span>
 *
 * 将几乎任何东西都转换为 Observable。
 *
 * ![](from.png)
 *
 * `from` converts various other objects and data types into Observables. It also converts a Promise, an array-like, or an
 * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable" target="_blank">iterable</a>
 * object into an Observable that emits the items in that promise, array, or iterable. A String, in this context, is treated
 * as an array of characters. Observable-like objects (contains a function named with the ES2015 Symbol for Observable) can also be
 * converted through this operator.
 *
 * `from` 将各种其他对象和数据类型转换为 Observables。它还将 Promise、类数组或[可迭代](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable)对象转换为可发出该 Promise、数组或可迭代项中的项的 Observable。在这种情况下，字符串被视为字符数组。类似 Observable 的对象（包含一个以 ES2015 Symbol for Observable 命名的函数）也可以通过这个操作符进行转换。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Converts an array to an Observable
 *
 * 将数组转换为 Observable
 *
 * ```ts
 * import { from } from 'rxjs';
 *
 * const array = [10, 20, 30];
 * const result = from(array);
 *
 * result.subscribe(x => console.log(x));
 *
 * // Logs:
 * // 10
 * // 20
 * // 30
 * ```
 *
 * Convert an infinite iterable (from a generator) to an Observable
 *
 * 将无限迭代（从生成器）转换为 Observable
 *
 * ```ts
 * import { from, take } from 'rxjs';
 *
 * function* generateDoubles(seed) {
 *    let i = seed;
 *    while (true) {
 *      yield i;
 *      i = 2 * i; // double it
 *    }
 * }
 *
 * const iterator = generateDoubles(3);
 * const result = from(iterator).pipe(take(10));
 *
 * result.subscribe(x => console.log(x));
 *
 * // Logs:
 * // 3
 * // 6
 * // 12
 * // 24
 * // 48
 * // 96
 * // 192
 * // 384
 * // 768
 * // 1536
 * ```
 *
 * With `asyncScheduler`
 *
 * 使用 `asyncScheduler`
 *
 * ```ts
 * import { from, asyncScheduler } from 'rxjs';
 *
 * console.log('start');
 *
 * const array = [10, 20, 30];
 * const result = from(array, asyncScheduler);
 *
 * result.subscribe(x => console.log(x));
 *
 * console.log('end');
 *
 * // Logs:
 * // 'start'
 * // 'end'
 * // 10
 * // 20
 * // 30
 * ```
 * @see {@link fromEvent}
 * @see {@link fromEventPattern}
 * @param {ObservableInput<T>} A subscription object, a Promise, an Observable-like,
 * an Array, an iterable, or an array-like object to be converted.
 *
 * 要转换的订阅对象、Promise、Observable-like、Array、iterable 或类似数组的对象。
 *
 * @param {SchedulerLike} An optional {@link SchedulerLike} on which to schedule the emission of values.
 *
 * 可选的 {@link SchedulerLike} 用于调度值的发射。
 *
 * @return {Observable<T>}
 */
export function from<T>(input: ObservableInput<T>, scheduler?: SchedulerLike): Observable<T> {
  return scheduler ? scheduled(input, scheduler) : innerFrom(input);
}
