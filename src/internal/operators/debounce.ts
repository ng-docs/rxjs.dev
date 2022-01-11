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
 * 只有当已经过去了由另一个 Observable 确定的时间段，而且在此期间源没有发出过其它值时，才会从源 Observable 上发出通知。
 *
 * <span class="informal">It's like {@link debounceTime}, but the time span of
 * emission silence is determined by a second Observable.</span>
 *
 * <span class="informal">它很像 {@link debounceTime}，不过它发送时的静默时间跨度由第二个 Observable 决定。</span>
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
 * `debounce` 会推迟源 Observable 发送的通知，但如果源 Observable 上来了新的值，则会丢弃以前挂起的延迟发送物。该操作符会跟踪来自源 Observable 的最新通知，并通过调用 `durationSelector` 函数生成一个控制持续时间的 Observable。只有当持续时间 Observable 发出了 next 通知，并且自生成持续时间 Observable 以源 Observable 上没有发送过其它通知，它才会发出此通知。如果在持续时间 Observable 发送值之前出现了新的通知，则不会再发送早先的那些通知，并且会将新通知安排在由 `durationSelector` 确定的新持续时间。如果在计划的持续时间内发生了 complete 事件，则会在 complete 事件被转发到输出 observable 之前发送最后一个缓存的通知。如果在计划的持续时间内或之后发生了 error 事件，则仅将此 error 事件转发到输出 observable。在这种情况下不会发送缓存的通知。
 *
 * Like {@link debounceTime}, this is a rate-limiting operator, and also a
 * delay-like operator since output emissions do not necessarily occur at the
 * same time as they did on the source Observable.
 *
 * 像 {@link debounceTime} 一样，这是一个限速操作符，也是一个延迟类的操作符，因为输出上的发送不一定会与源 Observable 上的发送同时发生。
 *
 * ## Example
 *
 * ## 例子
 *
 * Emit the most recent click after a burst of clicks
 *
 * 当收到一阵疯狂点击之后只发送最近的点击
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
 * 用于从源 Observable 接收值的函数，用于计算每个源值的超时持续时间，以 Observable 或 Promise 形式返回。
 *
 * @return A function that returns an Observable that delays the emissions of
 * the source Observable by the specified duration Observable returned by
 * `durationSelector`, and may drop some values if they occur too frequently.
 *
 * 一个返回 Observable 的函数。该函数将源 Observable 的发送进行延迟，其发送时间由 `durationSelector` 返回的持续时间 Observable 决定，如果它们发生得太频繁，可能会丢弃一些值。
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
