import { ArgumentOutOfRangeError } from '../util/ArgumentOutOfRangeError';
import { Observable } from '../Observable';
import { OperatorFunction } from '../types';
import { filter } from './filter';
import { throwIfEmpty } from './throwIfEmpty';
import { defaultIfEmpty } from './defaultIfEmpty';
import { take } from './take';

/**
 * Emits the single value at the specified `index` in a sequence of emissions
 * from the source Observable.
 *
 * 在源 Observable 的发射序列中在指定 `index` 处发射单个值。
 *
 * <span class="informal">Emits only the i-th value, then completes.</span>
 *
 * 仅发出第 i 个值，然后完成。
 *
 * ![](elementAt.png)
 *
 * `elementAt` returns an Observable that emits the item at the specified
 * `index` in the source Observable, or a default value if that `index` is out
 * of range and the `default` argument is provided. If the `default` argument is
 * not given and the `index` is out of range, the output Observable will emit an
 * `ArgumentOutOfRangeError` error.
 *
 * `elementAt` 返回一个 Observable，它在源 Observable 中的指定 `index` 处发出项目，或者如果该 `index` 超出范围并且提供了 `default` 参数，则返回一个默认值。如果未给出 `default` 参数并且 `index` 超出范围，则输出 Observable 将发出 `ArgumentOutOfRangeError` 错误。
 *
 * ## Example
 *
 * ## 例子
 *
 * Emit only the third click event
 *
 * 仅发出第三次点击事件
 *
 * ```ts
 * import { fromEvent, elementAt } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(elementAt(2));
 * result.subscribe(x => console.log(x));
 *
 * // Results in:
 * // click 1 = nothing
 * // click 2 = nothing
 * // click 3 = MouseEvent object logged to console
 * ```
 * @see {@link first}
 * @see {@link last}
 * @see {@link skip}
 * @see {@link single}
 * @see {@link take}
 * @throws {ArgumentOutOfRangeError} When using `elementAt(i)`, it delivers an
 * ArgumentOutOfRangeError to the Observer's `error` callback if `i < 0` or the
 * Observable has completed before emitting the i-th `next` notification.
 *
 * 使用 `elementAt(i)` 时，如果 `i < 0` 或 Observable 在发出第 i 个 `next` 通知之前已完成，它会将 ArgumentOutOfRangeError 传递给 Observer 的 `error` 回调。
 *
 * @param {number} index Is the number `i` for the i-th source emission that has
 * happened since the subscription, starting from the number `0`.
 *
 * 是自订阅以来发生的第 i 个源排放的数字 `i` ，从数字 `0` 开始。
 *
 * @param {T} [defaultValue] The default value returned for missing indices.
 * @return A function that returns an Observable that emits a single item, if
 * it is found. Otherwise, it will emit the default value if given. If not, it
 * emits an error.
 *
 * 一个返回 Observable 的函数，该 Observable 发出单个项目（如果找到的话）。否则，如果给定，它将发出默认值。如果不是，它会发出错误。
 *
 */
export function elementAt<T, D = T>(index: number, defaultValue?: D): OperatorFunction<T, T | D> {
  if (index < 0) {
    throw new ArgumentOutOfRangeError();
  }
  const hasDefaultValue = arguments.length >= 2;
  return (source: Observable<T>) =>
    source.pipe(
      filter((v, i) => i === index),
      take(1),
      hasDefaultValue ? defaultIfEmpty(defaultValue!) : throwIfEmpty(() => new ArgumentOutOfRangeError())
    );
}
