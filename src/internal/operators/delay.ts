import { asyncScheduler } from '../scheduler/async';
import { MonoTypeOperatorFunction, SchedulerLike } from '../types';
import { delayWhen } from './delayWhen';
import { timer } from '../observable/timer';

/**
 * Delays the emission of items from the source Observable by a given timeout or
 * until a given Date.
 *
 * 将源 Observable 的条目的发送延迟给定的超时时长或等到给定的时间（Date）。
 *
 * <span class="informal">Time shifts each item by some specified amount of
 * milliseconds.</span>
 *
 * <span class="informal">将每个条目的发送时间推迟某个指定的毫秒数。</span>
 *
 * ![](delay.png)
 *
 * If the delay argument is a Number, this operator time shifts the source
 * Observable by that amount of time expressed in milliseconds. The relative
 * time intervals between the values are preserved.
 *
 * 如果延迟参数是一个数字，则此操作符会将源 Observable 推迟某个以毫秒为单位的时间量。各个值之间的相对时间间隔会保持原样。
 *
 * If the delay argument is a Date, this operator time shifts the start of the
 * Observable execution until the given date occurs.
 *
 * 如果延迟参数是日期，则此操作符会将 Observable 执行的开始时间推迟到给定的日期上发生。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Delay each click by one second
 *
 * 把每次点击延迟一秒
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
 * 延迟所有点击，一直等到未来的某个特定日期为止
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
 * 以毫秒为单位的延迟持续时间（一个 `number`）或一个 `Date`，在此之前源条目的发送被延迟。
 *
 * @param {SchedulerLike} [scheduler=async] The {@link SchedulerLike} to use for
 * managing the timers that handle the time-shift for each item.
 *
 * 此 {@link SchedulerLike} 用来管理定时器，此定时器会用来处理每个值的时间偏移。
 *
 * @return A function that returns an Observable that delays the emissions of
 * the source Observable by the specified timeout or Date.
 *
 * 一个返回 Observable 的函数，它将源 Observable 的发送延迟指定的超时量或推迟到指定的时间（Date）。
 *
 */
export function delay<T>(due: number | Date, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T> {
  const duration = timer(due, scheduler);
  return delayWhen(() => duration);
}
