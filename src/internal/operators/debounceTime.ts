import { asyncScheduler } from '../scheduler/async';
import { Subscription } from '../Subscription';
import { MonoTypeOperatorFunction, SchedulerAction, SchedulerLike } from '../types';
import { operate } from '../util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * Emits a notification from the source Observable only after a particular time span
 * has passed without another source emission.
 *
 * 只有在特定时间跨度过去且源没有发送其它值时，才会从源 Observable 发送通知。
 *
 * <span class="informal">It's like {@link delay}, but passes only the most
 * recent notification from each burst of emissions.</span>
 *
 * <span class="informal">类似于 {@link delay}，但只传出每一轮密集发送时的最新通知。</span>
 *
 * ![](debounceTime.png)
 *
 * `debounceTime` delays notifications emitted by the source Observable, but drops
 * previous pending delayed emissions if a new notification arrives on the source
 * Observable. This operator keeps track of the most recent notification from the
 * source Observable, and emits that only when `dueTime` has passed
 * without any other notification appearing on the source Observable. If a new value
 * appears before `dueTime` silence occurs, the previous notification will be dropped
 * and will not be emitted and a new `dueTime` is scheduled.
 * If the completing event happens during `dueTime` the last cached notification
 * is emitted before the completion event is forwarded to the output observable.
 * If the error event happens during `dueTime` or after it only the error event is
 * forwarded to the output observable. The cache notification is not emitted in this case.
 *
 * `debounceTime` 会延迟源 Observable 发送的通知，但如果源 Observable 上来了新的通知，则会丢弃先前已挂起的延迟发送物。该操作符会跟踪来自源 Observable 的最新通知，并且仅在已经过去了 `dueTime` 且源 Observable 上没有出现任何其它通知时才发送此通知。如果在 `dueTime` 静默期之前出现了新值，则先前的通知将被丢弃而不会发送，并且会安排在新的 `dueTime`。如果在 `dueTime` 期间发生了 complete 事件，则把此前发送的最后一个已缓存通知转发到输出 observable 。如果在 `dueTime` 期间或之后发生了 error 事件，则仅将此 error 事件转发到输出 observable。在这种情况下不会发送已缓存的通知。
 *
 * This is a rate-limiting operator, because it is impossible for more than one
 * notification to be emitted in any time window of duration `dueTime`, but it is also
 * a delay-like operator since output emissions do not occur at the same time as
 * they did on the source Observable. Optionally takes a {@link SchedulerLike} for
 * managing timers.
 *
 * 这是一个限速操作符，因为不可能在任何持续时间的时间窗口内发送多个 `dueTime`，但它同时也是一个延迟类的操作符，因为输出 Observable 上的值不会与源 Observable 上的值同时发出。可以选择使用 {@link SchedulerLike} 来管理定时器。
 *
 * ## Example
 *
 * ## 例子
 *
 * Emit the most recent click after a burst of clicks
 *
 * 在收到一阵疯狂点击之后只发出最近的点击
 *
 * ```ts
 * import { fromEvent, debounceTime } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(debounceTime(1000));
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link audit}
 * @see {@link auditTime}
 * @see {@link debounce}
 * @see {@link sample}
 * @see {@link sampleTime}
 * @see {@link throttle}
 * @see {@link throttleTime}
 * @param {number} dueTime The timeout duration in milliseconds (or the time
 * unit determined internally by the optional `scheduler`) for the window of
 * time required to wait for emission silence before emitting the most recent
 * source value.
 *
 * 以毫秒为单位的超时持续时间（或由可选的 `scheduler` 自行设定的时间单位），用于在发送最近的源值之前等待发送静默时所需的时间窗口。
 *
 * @param {SchedulerLike} [scheduler=async] The {@link SchedulerLike} to use for
 * managing the timers that handle the timeout for each value.
 *
 * 此 {@link SchedulerLike} 用来管理定时器，此定时器会用来处理每个值的超时。
 *
 * @return A function that returns an Observable that delays the emissions of
 * the source Observable by the specified `dueTime`, and may drop some values
 * if they occur too frequently.
 *
 * 一个返回 Observable 的函数，它会将源 Observable 发出的值延迟指定的 `dueTime`，如果它们发生得太频繁，可能会丢弃一些值。
 *
 */
export function debounceTime<T>(dueTime: number, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let activeTask: Subscription | null = null;
    let lastValue: T | null = null;
    let lastTime: number | null = null;

    const emit = () => {
      if (activeTask) {
        // We have a value! Free up memory first, then emit the value.
        activeTask.unsubscribe();
        activeTask = null;
        const value = lastValue!;
        lastValue = null;
        subscriber.next(value);
      }
    };
    function emitWhenIdle(this: SchedulerAction<unknown>) {
      // This is called `dueTime` after the first value
      // but we might have received new values during this window!

      const targetTime = lastTime! + dueTime;
      const now = scheduler.now();
      if (now < targetTime) {
        // On that case, re-schedule to the new target
        activeTask = this.schedule(undefined, targetTime - now);
        subscriber.add(activeTask);
        return;
      }

      emit();
    }

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        (value: T) => {
          lastValue = value;
          lastTime = scheduler.now();

          // Only set up a task if it's not already up
          if (!activeTask) {
            activeTask = scheduler.schedule(emitWhenIdle, dueTime);
            subscriber.add(activeTask);
          }
        },
        () => {
          // Source completed.
          // Emit any pending debounced values then complete
          emit();
          subscriber.complete();
        },
        // Pass all errors through to consumer.
        undefined,
        () => {
          // Finalization.
          lastValue = activeTask = null;
        }
      )
    );
  });
}
