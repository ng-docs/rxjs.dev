import { combineLatest } from '../observable/combineLatest';
import { OperatorFunction, ObservableInput } from '../types';
import { joinAllInternals } from './joinAllInternals';

export function combineLatestAll<T>(): OperatorFunction<ObservableInput<T>, T[]>;
export function combineLatestAll<T>(): OperatorFunction<any, T[]>;
export function combineLatestAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
export function combineLatestAll<R>(project: (...values: Array<any>) => R): OperatorFunction<any, R>;

/**
 * Flattens an Observable-of-Observables by applying {@link combineLatest} when the Observable-of-Observables completes.
 *
 * 当高阶 Observable（Observable-of-Observables）完成时，应用 {@link combineLatest} 来展平它。
 *
 * ![](combineLatestAll.png)
 *
 * `combineLatestAll` takes an Observable of Observables, and collects all Observables from it. Once the outer Observable completes,
 * it subscribes to all collected Observables and combines their values using the {@link combineLatest} strategy, such that:
 *
 * `combineLatestAll` 会接受一个高阶 Observable 参数，并从中收集所有的 Observable。一旦外部 Observable 完成，它就会订阅所有收集到的 Observable 并使用 {@link combineLatest} 策略来组合它们的值，例如：
 *
 * * Every time an inner Observable emits, the output Observable emits
 *
 *   每次内部 Observable 发送时，输出 Observable 都会发出值
 *
 * * When the returned observable emits, it emits all of the latest values by:
 *
 *   当返回的这个 observable 发出值时，它会通过以下方式发送所有最新值：
 *
 *   - If a `project` function is provided, it is called with each recent value from each inner Observable in whatever order they
 *     arrived, and the result of the `project` function is what is emitted by the output Observable.
 *
 *     如果提供了一个 `project` 函数，每个内部 Observable 的最新值都会按照它们抵达的顺序调用此函数，而 `project` 函数的返回值就是输出 Observable 所发送的结果。
 *
 *   - If there is no `project` function, an array of all the most recent values is emitted by the output Observable.
 *
 *     如果没有 `project` 函数，则输出 Observable 会发送一个包含所有最新值的数组。
 *
 * ## Example
 *
 * ## 例子
 *
 * Map two click events to a finite interval Observable, then apply `combineLatestAll`
 *
 * 将两个点击事件映射到一个有限的随机间隔 Observable，然后对其应用 `combineLatestAll`
 *
 * ```ts
 * import { fromEvent, map, interval, take, combineLatestAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const higherOrder = clicks.pipe(
 *   map(() => interval(Math.random() * 2000).pipe(take(3))),
 *   take(2)
 * );
 * const result = higherOrder.pipe(combineLatestAll());
 *
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link combineLatest}
 * @see {@link combineLatestWith}
 * @see {@link mergeAll}
 * @param project optional function to map the most recent values from each inner Observable into a new result.
 * Takes each of the most recent values from each collected inner Observable as arguments, in order.
 *
 * 可选函数，用于将每个内部 Observable 的最新值映射到新结果中。每个收集到的内部 Observable 中的每个最新值都会依次调用此函数。
 *
 * @return A function that returns an Observable that flattens Observables
 * emitted by the source Observable.
 *
 * 一个返回 Observable 的函数，该函数会展平源 Observable 发送出来的这些 Observable。
 *
 */
export function combineLatestAll<R>(project?: (...values: Array<any>) => R) {
  return joinAllInternals(combineLatest, project);
}
