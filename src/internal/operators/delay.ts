import { asyncScheduler } from '../scheduler/async';
import { MonoTypeOperatorFunction, SchedulerLike } from '../types';
import { delayWhen } from './delayWhen';
import { timer } from '../observable/timer';

/**
 * Delays the emission of items from the source Observable by a given timeout or
 * until a given Date.
 *
 * 将源 Observable 的项目的发射延迟给定的超时时间或直到给定的日期。
 *
 * <span class="informal">Time shifts each item by some specified amount of
 * milliseconds.</span>
 *
 * <span class="informal">时间将每个项目移动某个指定的毫秒数。</span>
 *
 * ![](delay.png)
 *
 * If the delay argument is a Number, this operator time shifts the source
 * Observable by that amount of time expressed in milliseconds. The relative
 * time intervals between the values are preserved.
 *
 * 如果延迟参数是一个数字，则此操作符将源 Observable 移动以毫秒为单位的时间量。值之间的相对时间间隔被保留。
 *
 * If the delay argument is a Date, this operator time shifts the start of the
 * Observable execution until the given date occurs.
 *
 * 如果延迟参数是日期，则此运算符将 Observable 执行的开始时间转移到给定日期发生。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Delay each click by one second
 *
 * 每次点击延迟一秒
 *
 * ```ts
 * import { fromEvent, delay } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const delayedClicks = clicks.pipe(delay(1000)); // each click emitted after 1 second
 * delayedClicks.subscribe(x => console.log(x));
 * ```
 *
 * Delay all clicks until a future date happens
 *
 * 延迟所有点击，直到未来的日期发生
 *
 * ```ts
 * import { fromEvent, delay } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const date = new Date('March 15, 2050 12:00:00'); // in the future
 * const delayedClicks = clicks.pipe(delay(date)); // click emitted only after that date
 * delayedClicks.subscribe(x => console.log(x));
 * ```
 * @see {@link delayWhen}
 * @see {@link throttle}
 * @see {@link throttleTime}
 * @see {@link debounce}
 * @see {@link debounceTime}
 * @see {@link sample}
 * @see {@link sampleTime}
 * @see {@link audit}
 * @see {@link auditTime}
 * @param {number|Date} due The delay duration in milliseconds (a `number`) or
 * a `Date` until which the emission of the source items is delayed.
 *
 * 以毫秒为单位的延迟持续时间（一个 `number` ）或一个 `Date` ，在此之前源项目的发射被延迟。
 *
 * @param {SchedulerLike} [scheduler=async] The {@link SchedulerLike} to use for
 * managing the timers that handle the time-shift for each item.
 *
 * 用于管理处理每个项目的时移的计时器。
 *
 * @return A function that returns an Observable that delays the emissions of
 * the source Observable by the specified timeout or Date.
 *
 * 一个返回 Observable 的函数，它将源 Observable 的发射延迟指定的超时或日期。
 *
 */
export function delay<T>(due: number | Date, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T> {
  const duration = timer(due, scheduler);
  return delayWhen(() => duration);
}
