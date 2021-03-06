import { MonoTypeOperatorFunction } from '../types';
import { filter } from './filter';

/**
 * Returns an Observable that skips the first `count` items emitted by the source Observable.
 *
 * 返回一个会跳过源 Observable 发出的前 `count` 个条目的 Observable。
 *
 * ![](skip.png)
 *
 * Skips the values until the sent notifications are equal or less than provided skip count. It raises
 * an error if skip count is equal or more than the actual number of emits and source raises an error.
 *
 * 跳过这些值，直到发送的通知等于或小于所提供的跳过数量。如果跳过计数等于或大于实际发送次数并且源引发了错误，则会引发错误。
 *
 * ## Example
 *
 * ## 例子
 *
 * Skip the values before the emission
 *
 * 在发送前跳过一些值
 *
 * ```ts
 * import { interval, skip } from 'rxjs';
 *
 * // emit every half second
 * const source = interval(500);
 * // skip the first 10 emitted values
 * const result = source.pipe(skip(10));
 *
 * result.subscribe(value => console.log(value));
 * // output: 10...11...12...13...
 * ```
 * @see {@link last}
 * @see {@link skipWhile}
 * @see {@link skipUntil}
 * @see {@link skipLast}
 * @param {Number} count - The number of times, items emitted by source Observable should be skipped.
 *
 *   一个次数，表示应该跳过多少个源 Observable 的产出物。
 *
 * @return A function that returns an Observable that skips the first `count`
 * values emitted by the source Observable.
 *
 * 一个返回 Observable 的函数，它会跳过源 Observable 发送的前 `count` 个值。
 *
 */
export function skip<T>(count: number): MonoTypeOperatorFunction<T> {
  return filter((_, index) => count <= index);
}
