import { OperatorFunction } from '../types';
import { reduce } from './reduce';

/**
 * Counts the number of emissions on the source and emits that number when the
 * source completes.
 *
 * 对源上发送过的值进行计数，并在源完成时发送该数量。
 *
 * <span class="informal">Tells how many values were emitted, when the source
 * completes.</span>
 *
 * <span class="informal">报告在源完成时发送过多少值。</span>
 *
 * ![](count.png)
 *
 * `count` transforms an Observable that emits values into an Observable that
 * emits a single value that represents the number of values emitted by the
 * source Observable. If the source Observable terminates with an error, `count`
 * will pass this error notification along without emitting a value first. If
 * the source Observable does not terminate at all, `count` will neither emit
 * a value nor terminate. This operator takes an optional `predicate` function
 * as argument, in which case the output emission will represent the number of
 * source values that matched `true` with the `predicate`.
 *
 * `count` 会将发送值的 Observable 转换为发送单个值的 Observable，该值表示源 Observable 发送过的值的数量。如果源 Observable 因错误而终止，`count` 将传递此错误通知，而不首先发送值。如果源 Observable 根本没有终止，则 `count` 既不会发送值也不会终止。此操作符将可选的 `predicate` 函数作为参数，在这种情况下，输出发送的是 `predicate` 的结果为 `true` 的源值的数量。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Counts how many seconds have passed before the first click happened
 *
 * 计算在首次点击之前经过了多少秒
 *
 * ```ts
 * import { interval, fromEvent, takeUntil, count } from 'rxjs';
 *
 * const seconds = interval(1000);
 * const clicks = fromEvent(document, 'click');
 * const secondsBeforeClick = seconds.pipe(takeUntil(clicks));
 * const result = secondsBeforeClick.pipe(count());
 * result.subscribe(x => console.log(x));
 * ```
 *
 * Counts how many odd numbers are there between 1 and 7
 *
 * 计算 1 到 7 之间有多少个奇数
 *
 * ```ts
 * import { range, count } from 'rxjs';
 *
 * const numbers = range(1, 7);
 * const result = numbers.pipe(count(i => i % 2 === 1));
 * result.subscribe(x => console.log(x));
 * // Results in:
 * // 4
 * ```
 * @see {@link max}
 * @see {@link min}
 * @see {@link reduce}
 * @param predicate A function that is used to analyze the value and the index and
 * determine whether or not to increment the count. Return `true` to increment the count,
 * and return `false` to keep the count the same.
 * If the predicate is not provided, every value will be counted.
 *
 * 用于分析值和序号并确定是否要增加计数的函数。返回 `true` 时增加计数，返回 `false` 时保持计数不变。如果未提供此谓词，则将对每个值进行计数。
 *
 * @return A function that returns an Observable that emits one number that
 * represents the count of emissions.
 *
 * 一个返回 Observable 的函数，该 Observable 会发送一个数量，表示已发送的值的技术结果。
 *
 */
export function count<T>(predicate?: (value: T, index: number) => boolean): OperatorFunction<T, number> {
  return reduce((total, value, i) => (!predicate || predicate(value, i) ? total + 1 : total), 0);
}
