import { Subject } from '../Subject';
import { asyncScheduler } from '../scheduler/async';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { Observer, OperatorFunction, SchedulerLike } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { arrRemove } from '../util/arrRemove';
import { popScheduler } from '../util/args';
import { executeSchedule } from '../util/executeSchedule';

export function windowTime<T>(windowTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
export function windowTime<T>(
  windowTimeSpan: number,
  windowCreationInterval: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, Observable<T>>;
export function windowTime<T>(
  windowTimeSpan: number,
  windowCreationInterval: number | null | void,
  maxWindowSize: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, Observable<T>>;

/**
 * Branch out the source Observable values as a nested Observable periodically
 * in time.
 *
 * 定期将源 Observable 值分支为嵌套的 Observable。
 *
 * <span class="informal">It's like {@link bufferTime}, but emits a nested
 * Observable instead of an array.</span>
 *
 * 它类似于 {@link bufferTime}，但发出一个嵌套的 Observable 而不是一个数组。
 *
 * ![](windowTime.png)
 *
 * Returns an Observable that emits windows of items it collects from the source
 * Observable. The output Observable starts a new window periodically, as
 * determined by the `windowCreationInterval` argument. It emits each window
 * after a fixed timespan, specified by the `windowTimeSpan` argument. When the
 * source Observable completes or encounters an error, the output Observable
 * emits the current window and propagates the notification from the source
 * Observable. If `windowCreationInterval` is not provided, the output
 * Observable starts a new window when the previous window of duration
 * `windowTimeSpan` completes. If `maxWindowCount` is provided, each window
 * will emit at most fixed number of values. Window will complete immediately
 * after emitting last value and next one still will open as specified by
 * `windowTimeSpan` and `windowCreationInterval` arguments.
 *
 * 返回一个 Observable，它发出从源 Observable 收集的项目的窗口。输出 Observable 定期启动一个新窗口，由 `windowCreationInterval` 参数确定。它在 `windowTimeSpan` 参数指定的固定时间跨度后发出每个窗口。当源 Observable 完成或遇到错误时，输出 Observable 会发出当前窗口并传播来自源 Observable 的通知。如果没有提供 `windowCreationInterval` ，则输出 Observable 会在前一个持续时间 `windowTimeSpan` 的窗口完成时启动一个新窗口。如果提供了 `maxWindowCount` ，则每个窗口将发出最多固定数量的值。窗口将在发出最后一个值后立即完成，并且下一个仍将按照 `windowTimeSpan` 和 `windowCreationInterval` 参数的指定打开。
 *
 * ## Examples
 *
 * ## 例子
 *
 * In every window of 1 second each, emit at most 2 click events
 *
 * 在每个 1 秒的窗口中，最多发出 2 个点击事件
 *
 * ```ts
 * import { fromEvent, windowTime, map, take, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowTime(1000),
 *   map(win => win.pipe(take(2))), // take at most 2 emissions from each window
 *   mergeAll()                     // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * Every 5 seconds start a window 1 second long, and emit at most 2 click events per window
 *
 * 每 5 秒启动一个 1 秒长的窗口，每个窗口最多发出 2 个点击事件
 *
 * ```ts
 * import { fromEvent, windowTime, map, take, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowTime(1000, 5000),
 *   map(win => win.pipe(take(2))), // take at most 2 emissions from each window
 *   mergeAll()                     // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * Same as example above but with `maxWindowCount` instead of `take`
 *
 * 与上面的示例相同，但使用 `maxWindowCount` 而不是 `take`
 *
 * ```ts
 * import { fromEvent, windowTime, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowTime(1000, 5000, 2), // take at most 2 emissions from each window
 *   mergeAll()                 // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link window}
 * @see {@link windowCount}
 * @see {@link windowToggle}
 * @see {@link windowWhen}
 * @see {@link bufferTime}
 * @param windowTimeSpan The amount of time, in milliseconds, to fill each window.
 *
 * 填充每个窗口的时间量（以毫秒为单位）。
 *
 * @param windowCreationInterval The interval at which to start new
 * windows.
 *
 * 启动新窗口的时间间隔。
 *
 * @param maxWindowSize Max number of
 * values each window can emit before completion.
 *
 * 每个窗口在完成之前可以发出的最大值数。
 *
 * @param scheduler The scheduler on which to schedule the
 * intervals that determine window boundaries.
 *
 * 调度确定窗口边界的间隔的调度程序。
 *
 * @return A function that returns an Observable of windows, which in turn are
 * Observables.
 *
 * 一个返回窗口的 Observable 的函数，这些窗口又是 Observables。
 *
 */
export function windowTime<T>(windowTimeSpan: number, ...otherArgs: any[]): OperatorFunction<T, Observable<T>> {
  const scheduler = popScheduler(otherArgs) ?? asyncScheduler;
  const windowCreationInterval = (otherArgs[0] as number) ?? null;
  const maxWindowSize = (otherArgs[1] as number) || Infinity;

  return operate((source, subscriber) => {
    // The active windows, their related subscriptions, and removal functions.
    let windowRecords: WindowRecord<T>[] | null = [];
    // If true, it means that every time we close a window, we want to start a new window.
    // This is only really used for when *just* the time span is passed.
    let restartOnClose = false;

    const closeWindow = (record: { window: Subject<T>; subs: Subscription }) => {
      const { window, subs } = record;
      window.complete();
      subs.unsubscribe();
      arrRemove(windowRecords, record);
      restartOnClose && startWindow();
    };

    /**
     * Called every time we start a new window. This also does
     * the work of scheduling the job to close the window.
     *
     * 每次我们启动一个新窗口时调用。这也完成了调度作业以关闭窗口的工作。
     *
     */
    const startWindow = () => {
      if (windowRecords) {
        const subs = new Subscription();
        subscriber.add(subs);
        const window = new Subject<T>();
        const record = {
          window,
          subs,
          seen: 0,
        };
        windowRecords.push(record);
        subscriber.next(window.asObservable());
        executeSchedule(subs, scheduler, () => closeWindow(record), windowTimeSpan);
      }
    };

    if (windowCreationInterval !== null && windowCreationInterval >= 0) {
      // The user passed both a windowTimeSpan (required), and a creation interval
      // That means we need to start new window on the interval, and those windows need
      // to wait the required time span before completing.
      executeSchedule(subscriber, scheduler, startWindow, windowCreationInterval, true);
    } else {
      restartOnClose = true;
    }

    startWindow();

    /**
     * We need to loop over a copy of the window records several times in this operator.
     * This is to save bytes over the wire more than anything.
     * The reason we copy the array is that reentrant code could mutate the array while
     * we are iterating over it.
     *
     * 我们需要在此运算符中多次循环窗口记录的副本。这是为了节省线路上的字节数。我们复制数组的原因是可重入代码在我们迭代数组时可能会改变它。
     *
     */
    const loop = (cb: (record: WindowRecord<T>) => void) => windowRecords!.slice().forEach(cb);

    /**
     * Used to notify all of the windows and the subscriber in the same way
     * in the error and complete handlers.
     *
     * 用于在错误和完成处理程序中以相同的方式通知所有窗口和订阅者。
     *
     */
    const terminate = (cb: (consumer: Observer<any>) => void) => {
      loop(({ window }) => cb(window));
      cb(subscriber);
      subscriber.unsubscribe();
    };

    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value: T) => {
          // Notify all windows of the value.
          loop((record) => {
            record.window.next(value);
            // If the window is over the max size, we need to close it.
            maxWindowSize <= ++record.seen && closeWindow(record);
          });
        },
        // Complete the windows and the downstream subscriber and clean up.
        () => terminate((consumer) => consumer.complete()),
        // Notify the windows and the downstream subscriber of the error and clean up.
        (err) => terminate((consumer) => consumer.error(err))
      )
    );

    // Additional teardown. This will be called when the
    // destination tears down. Other teardowns are registered implicitly
    // above via subscription.
    return () => {
      // Ensure that the buffer is released.
      windowRecords = null!;
    };
  });
}

interface WindowRecord<T> {
  seen: number;
  window: Subject<T>;
  subs: Subscription;
}
