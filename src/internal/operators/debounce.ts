import { Subscriber } from '../Subscriber';
import { MonoTypeOperatorFunction, ObservableInput } from '../types';
import { operate } from '../util/lift';
import { noop } from '../util/noop';
import { OperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/innerFrom';

/**
 * Emits a notification from the source Observable only after a particular time span
 * determined by another Observable has passed without another source emission.
 *
 * 只有在另一个 Observable 确定的特定时间跨度过去且没有另一个源发射时，才从源 Observable 发出通知。
 *
 * <span class="informal">It's like {@link debounceTime}, but the time span of
 * emission silence is determined by a second Observable.</span>
 *
 * 就像 {@link debounceTime}，但发射静默的时间跨度由第二个 Observable 决定。
 *
 * ![](debounce.svg)
 *
 * `debounce` delays notifications emitted by the source Observable, but drops previous
 * pending delayed emissions if a new notification arrives on the source Observable.
 * This operator keeps track of the most recent notification from the source
 * Observable, and spawns a duration Observable by calling the
 * `durationSelector` function. The notification is emitted only when the duration
 * Observable emits a next notification, and if no other notification was emitted on
 * the source Observable since the duration Observable was spawned. If a new
 * notification appears before the duration Observable emits, the previous notification will
 * not be emitted and a new duration is scheduled from `durationSelector` is scheduled.
 * If the completing event happens during the scheduled duration the last cached notification
 * is emitted before the completion event is forwarded to the output observable.
 * If the error event happens during the scheduled duration or after it only the error event is
 * forwarded to the output observable. The cache notification is not emitted in this case.
 *
 * `debounce` 延迟源 Observable 发出的通知，但如果新的通知到达源 Observable 上，则丢弃先前挂起的延迟发射。该操作符跟踪来自源 Observable 的最新通知，并通过调用 `durationSelector` 函数生成一个持续时间 Observable。只有当持续时间 Observable 发出下一个通知时才会发出通知，并且如果自产生持续时间 Observable 以来没有在源 Observable 上发出其他通知。如果在 Observable 发出的持续时间之前出现了新的通知，则不会发出之前的通知，并且会从 `durationSelector` 调度一个新的持续时间。如果完成事件在计划的持续时间内发生，则在完成事件被转发到输出 observable 之前发出最后一个缓存的通知。如果错误事件发生在计划的持续时间内或之后，则仅将错误事件转发到输出 observable。在这种情况下不会发出缓存通知。
 *
 * Like {@link debounceTime}, this is a rate-limiting operator, and also a
 * delay-like operator since output emissions do not necessarily occur at the
 * same time as they did on the source Observable.
 *
 * 像 {@link debounceTime} 一样，这是一个限速算子，也是一个类似延迟的算子，因为输出发射不一定与源 Observable 上的同时发生。
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
 * import { fromEvent, scan, debounce, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   scan(i => ++i, 1),
 *   debounce(i => interval(200 * i))
 * );
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link audit}
 * @see {@link auditTime}
 * @see {@link debounceTime}
 * @see {@link delay}
 * @see {@link sample}
 * @see {@link sampleTime}
 * @see {@link throttle}
 * @see {@link throttleTime}
 * @param durationSelector A function
 * that receives a value from the source Observable, for computing the timeout
 * duration for each source value, returned as an Observable or a Promise.
 *
 * 从源 Observable 接收值的函数，用于计算每个源值的超时持续时间，以 Observable 或 Promise 形式返回。
 *
 * @return A function that returns an Observable that delays the emissions of
 * the source Observable by the specified duration Observable returned by
 * `durationSelector`, and may drop some values if they occur too frequently.
 *
 * 一个返回 Observable 的函数，该函数将源 Observable 的发射延迟由 `durationSelector` 返回的指定持续时间 Observable，如果它们发生得太频繁，可能会丢弃一些值。
 *
 */
export function debounce<T>(durationSelector: (value: T) => ObservableInput<any>): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let hasValue = false;
    let lastValue: T | null = null;
    // The subscriber/subscription for the current debounce, if there is one.
    let durationSubscriber: Subscriber<any> | null = null;

    const emit = () => {
      // Unsubscribe any current debounce subscription we have,
      // we only cared about the first notification from it, and we
      // want to clean that subscription up as soon as possible.
      durationSubscriber?.unsubscribe();
      durationSubscriber = null;
      if (hasValue) {
        // We have a value! Free up memory first, then emit the value.
        hasValue = false;
        const value = lastValue!;
        lastValue = null;
        subscriber.next(value);
      }
    };

    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value: T) => {
          // Cancel any pending debounce duration. We don't
          // need to null it out here yet tho, because we're just going
          // to create another one in a few lines.
          durationSubscriber?.unsubscribe();
          hasValue = true;
          lastValue = value;
          // Capture our duration subscriber, so we can unsubscribe it when we're notified
          // and we're going to emit the value.
          durationSubscriber = new OperatorSubscriber(subscriber, emit, noop);
          // Subscribe to the duration.
          innerFrom(durationSelector(value)).subscribe(durationSubscriber);
        },
        () => {
          // Source completed.
          // Emit any pending debounced values then complete
          emit();
          subscriber.complete();
        },
        // Pass all errors through to consumer
        undefined,
        () => {
          // Teardown.
          lastValue = durationSubscriber = null;
        }
      )
    );
  });
}
