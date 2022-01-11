import { asyncScheduler } from '../scheduler/async';
import { Subscription } from '../Subscription';
import { MonoTypeOperatorFunction, SchedulerAction, SchedulerLike } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Emits a notification from the source Observable only after a particular time span
 * has passed without another source emission.
 *
 * 只有在特定时间跨度过去且没有其他源发射时，才从源 Observable 发出通知。
 *
 * <span class="informal">It's like {@link delay}, but passes only the most
 * recent notification from each burst of emissions.</span>
 *
 * <span class="informal">类似于 {@link delay}，但只传递每次发射爆发的最新通知。</span>
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
 * `debounceTime` 延迟源 Observable 发出的通知，但如果有新的通知到达源 Observable 上，则丢弃先前挂起的延迟发射。该操作符跟踪来自源 Observable 的最新通知，并且仅在 `dueTime` 已过且源 Observable 上没有出现任何其他通知时才发出该通知。如果在 `dueTime` 静音发生之前出现了新值，则先前的通知将被丢弃并且不会发出，并会安排新的 `dueTime`。如果完成事件在 `dueTime` 时间期间发生，则在完成事件被转发到输出 observable 之前发出最后一个缓存通知。如果错误事件在 `dueTime` 期间或之后发生，则仅将错误事件转发到输出 observable。在这种情况下不会发出缓存通知。
 *
 * This is a rate-limiting operator, because it is impossible for more than one
 * notification to be emitted in any time window of duration `dueTime`, but it is also
 * a delay-like operator since output emissions do not occur at the same time as
 * they did on the source Observable. Optionally takes a {@link SchedulerLike} for
 * managing timers.
 *
 * 这是一个限速算子，因为不可能在任何持续时间的时间窗口内发出多个 `dueTime`，但它也是一个类似延迟的算子，因为输出发射不会与它们同时发生在源 Observable 上。可以选择使用 {@link SchedulerLike} 来管理计时器。
 *
 * ## Example
 *
 * ## 例子
 *
 * Emit the most recent click after a burst of clicks
 *
 * 在一阵点击后发出最近的点击
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
 * 以毫秒为单位的超时持续时间（或由可选的 `scheduler` 内部确定的时间单位），用于在发出最近的源值之前等待发出静默所需的时间窗口。
 *
 * @param {SchedulerLike} [scheduler=async] The {@link SchedulerLike} to use for
 * managing the timers that handle the timeout for each value.
 *
 * 用于管理处理每个值超时的计时器。
 *
 * @return A function that returns an Observable that delays the emissions of
 * the source Observable by the specified `dueTime`, and may drop some values
 * if they occur too frequently.
 *
 * 一个返回 Observable 的函数，它将源 Observable 的发射延迟指定的 `dueTime`，并且如果它们发生得太频繁，可能会丢弃一些值。
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
      new OperatorSubscriber(
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
          // Teardown.
          lastValue = activeTask = null;
        }
      )
    );
  });
}
