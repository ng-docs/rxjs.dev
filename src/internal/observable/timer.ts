import { Observable } from '../Observable';
import { SchedulerLike } from '../types';
import { async as asyncScheduler } from '../scheduler/async';
import { isScheduler } from '../util/isScheduler';
import { isValidDate } from '../util/isDate';

/**
 * Creates an observable that will wait for a specified time period, or exact date, before
 * emitting the number 0.
 *
 * 创建一个 observable，它将等待指定的时间段或确切的日期，然后发出数字 0。
 *
 * <span class="informal">Used to emit a notification after a delay.</span>
 *
 * 用于在延迟后发出通知。
 *
 * This observable is useful for creating delays in code, or racing against other values
 * for ad-hoc timeouts.
 *
 * 此 observable 对于在代码中创建延迟或与其他值竞争即席超时非常有用。
 *
 * The `delay` is specified by default in milliseconds, however providing a custom scheduler could
 * create a different behavior.
 *
 * 默认情况下以毫秒为单位指定 `delay` ，但是提供自定义调度程序可能会创建不同的行为。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Wait 3 seconds and start another observable
 *
 * 等待 3 秒，然后启动另一个 observable
 *
 * You might want to use `timer` to delay subscription to an
 * observable by a set amount of time. Here we use a timer with
 * {@link concatMapTo} or {@link concatMap} in order to wait
 * a few seconds and start a subscription to a source.
 *
 * 你可能希望使用 `timer` 将订阅可观察对象延迟设定的时间。在这里，我们使用带有 {@link concatMapTo} 或 {@link concatMap} 的计时器，以便等待几秒钟并开始订阅源。
 *
 * ```ts
 * import { of, timer, concatMap } from 'rxjs';
 *
 * // This could be any observable
 * const source = of(1, 2, 3);
 *
 * timer(3000)
 *   .pipe(concatMap(() => source))
 *   .subscribe(console.log);
 * ```
 *
 * Take all values until the start of the next minute
 *
 * 取所有值直到下一分钟开始
 *
 * Using a `Date` as the trigger for the first emission, you can
 * do things like wait until midnight to fire an event, or in this case,
 * wait until a new minute starts (chosen so the example wouldn't take
 * too long to run) in order to stop watching a stream. Leveraging
 * {@link takeUntil}.
 *
 * 使用 `Date` 作为第一次发射的触发器，你可以在为了停止观看流。利用 {@link takeUntil}。
 *
 * ```ts
 * import { interval, takeUntil, timer } from 'rxjs';
 *
 * // Build a Date object that marks the
 * // next minute.
 * const currentDate = new Date();
 * const startOfNextMinute = new Date(
 *   currentDate.getFullYear(),
 *   currentDate.getMonth(),
 *   currentDate.getDate(),
 *   currentDate.getHours(),
 *   currentDate.getMinutes() + 1
 * );
 *
 * // This could be any observable stream
 * const source = interval(1000);
 *
 * const result = source.pipe(
 *   takeUntil(timer(startOfNextMinute))
 * );
 *
 * result.subscribe(console.log);
 * ```
 *
 * ### Known Limitations
 *
 * ### 已知限制
 *
 * - The {@link asyncScheduler} uses `setTimeout` which has limitations for how far in the future it can be scheduled.
 *
 *   {@link asyncScheduler} 使用 `setTimeout` ，它对未来可以调度多远有限制。
 *
 * - If a `scheduler` is provided that returns a timestamp other than an epoch from `now()`, and
 *   a `Date` object is passed to the `dueTime` argument, the calculation for when the first emission
 *   should occur will be incorrect. In this case, it would be best to do your own calculations
 *   ahead of time, and pass a `number` in as the `dueTime`.
 *
 *   如果提供的 `scheduler` 从 `now()` 返回除纪元以外的时间戳，并且将 `Date` 对象传递给 `dueTime` 参数，则首次发射时间的计算将不正确。在这种情况下，最好提前进行自己的计算，并传入一个 `number` 作为 `dueTime` 。
 *
 * @param due If a `number`, the amount of time in milliseconds to wait before emitting.
 * If a `Date`, the exact time at which to emit.
 *
 * 如果是 `number` ，则在发射前等待的时间量（以毫秒为单位）。如果是 `Date` ，则发出的确切时间。
 *
 * @param scheduler The scheduler to use to schedule the delay. Defaults to {@link asyncScheduler}.
 *
 * 用于调度延迟的调度程序。默认为 {@link asyncScheduler}。
 *
 */
export function timer(due: number | Date, scheduler?: SchedulerLike): Observable<0>;

/**
 * Creates an observable that starts an interval after a specified delay, emitting incrementing numbers -- starting at `0` --
 * on each interval after words.
 *
 * 创建一个 observable，它在指定的延迟后开始一个间隔，在单词之后的每个间隔上发出递增的数字——从 `0` 开始。
 *
 * The `delay` and `intervalDuration` are specified by default in milliseconds, however providing a custom scheduler could
 * create a different behavior.
 *
 * 默认情况下， `delay` 和 `intervalDuration` 以毫秒为单位指定，但是提供自定义调度程序可能会创建不同的行为。
 *
 * ## Example
 *
 * ## 例子
 *
 * ### Start an interval that starts right away
 *
 * ### 开始一个立即开始的间隔
 *
 * Since {@link interval} waits for the passed delay before starting,
 * sometimes that's not ideal. You may want to start an interval immediately.
 * `timer` works well for this. Here we have both side-by-side so you can
 * see them in comparison.
 *
 * 由于 {@link interval} 在开始之前等待传递的延迟，因此有时这并不理想。你可能想立即开始一个间隔。 `timer` 适用于此。在这里，我们将两者并排放置，因此你可以比较它们。
 *
 * Note that this observable will never complete.
 *
 * 请注意，这个 observable 永远不会完成。
 *
 * ```ts
 * import { timer, interval } from 'rxjs';
 *
 * timer(0, 1000).subscribe(n => console.log('timer', n));
 * interval(1000).subscribe(n => console.log('interval', n));
 * ```
 *
 * ### Known Limitations
 *
 * ### 已知限制
 *
 * - The {@link asyncScheduler} uses `setTimeout` which has limitations for how far in the future it can be scheduled.
 *
 *   {@link asyncScheduler} 使用 `setTimeout` ，它对未来可以调度多远有限制。
 *
 * - If a `scheduler` is provided that returns a timestamp other than an epoch from `now()`, and
 *   a `Date` object is passed to the `dueTime` argument, the calculation for when the first emission
 *   should occur will be incorrect. In this case, it would be best to do your own calculations
 *   ahead of time, and pass a `number` in as the `startDue`.
 *
 *   如果提供的 `scheduler` 从 `now()` 返回除纪元以外的时间戳，并且将 `Date` 对象传递给 `dueTime` 参数，则首次发射时间的计算将不正确。在这种情况下，最好提前进行自己的计算，并传入一个 `number` 作为 `startDue` 。
 *
 * @param startDue If a `number`, is the time to wait before starting the interval.
 * If a `Date`, is the exact time at which to start the interval.
 *
 * 如果是 `number` ，是开始间隔之前等待的时间。如果是 `Date` ，则为开始间隔的确切时间。
 *
 * @param intervalDuration The delay between each value emitted in the interval. Passing a
 * negative number here will result in immediate completion after the first value is emitted, as though
 * no `intervalDuration` was passed at all.
 *
 * 间隔中发出的每个值之间的延迟。在此处传递负数将导致在发出第一个值后立即完成，就好像根本没有传递任何 `intervalDuration` 一样。
 *
 * @param scheduler The scheduler to use to schedule the delay. Defaults to {@link asyncScheduler}.
 *
 * 用于调度延迟的调度程序。默认为 {@link asyncScheduler}。
 *
 */
export function timer(startDue: number | Date, intervalDuration: number, scheduler?: SchedulerLike): Observable<number>;

/**
 * @deprecated The signature allowing `undefined` to be passed for `intervalDuration` will be removed in v8. Use the `timer(dueTime, scheduler?)` signature instead.
 *
 * 允许为 `intervalDuration` 传递 `undefined` 的签名将在 v8 中删除。请改用 `timer(dueTime, scheduler?)` 签名。
 *
 */
export function timer(dueTime: number | Date, unused: undefined, scheduler?: SchedulerLike): Observable<0>;

export function timer(
  dueTime: number | Date = 0,
  intervalOrScheduler?: number | SchedulerLike,
  scheduler: SchedulerLike = asyncScheduler
): Observable<number> {
  // Since negative intervalDuration is treated as though no
  // interval was specified at all, we start with a negative number.
  let intervalDuration = -1;

  if (intervalOrScheduler != null) {
    // If we have a second argument, and it's a scheduler,
    // override the scheduler we had defaulted. Otherwise,
    // it must be an interval.
    if (isScheduler(intervalOrScheduler)) {
      scheduler = intervalOrScheduler;
    } else {
      // Note that this *could* be negative, in which case
      // it's like not passing an intervalDuration at all.
      intervalDuration = intervalOrScheduler;
    }
  }

  return new Observable((subscriber) => {
    // If a valid date is passed, calculate how long to wait before
    // executing the first value... otherwise, if it's a number just schedule
    // that many milliseconds (or scheduler-specified unit size) in the future.
    let due = isValidDate(dueTime) ? +dueTime - scheduler!.now() : dueTime;

    if (due < 0) {
      // Ensure we don't schedule in the future.
      due = 0;
    }

    // The incrementing value we emit.
    let n = 0;

    // Start the timer.
    return scheduler.schedule(function () {
      if (!subscriber.closed) {
        // Emit the next value and increment.
        subscriber.next(n++);

        if (0 <= intervalDuration) {
          // If we have a interval after the initial timer,
          // reschedule with the period.
          this.schedule(undefined, intervalDuration);
        } else {
          // We didn't have an interval. So just complete.
          subscriber.complete();
        }
      }
    }, due);
  });
}
