import { Notification } from '../Notification';
import { OperatorFunction, ObservableNotification } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Represents all of the notifications from the source Observable as `next`
 * emissions marked with their original types within {@link Notification}
 * objects.
 *
 * 将来自源 Observable 的所有通知表示为在 {@link Notification} 对象中标记着其原始类型的值通过 `next` 进行发送。
 *
 * <span class="informal">Wraps `next`, `error` and `complete` emissions in
 * {@link Notification} objects, emitted as `next` on the output Observable.
 * </span>
 *
 * <span class="informal">把发来的 `next`、`error` 和 `complete` 包装在 {@link Notification} 对象中，作为输出 Observable 上的 `next` 进行发送。</span>
 *
 * ![](materialize.png)
 *
 * `materialize` returns an Observable that emits a `next` notification for each
 * `next`, `error`, or `complete` emission of the source Observable. When the
 * source Observable emits `complete`, the output Observable will emit `next` as
 * a Notification of type "complete", and then it will emit `complete` as well.
 * When the source Observable emits `error`, the output will emit `next` as a
 * Notification of type "error", and then `complete`.
 *
 * `materialize` 会返回一个 Observable，它会为源 Observable 的每个 `next`、`error` 或 `complete` 发送一个 `next` 通知。当源 Observable 发送 `complete` 时，输出 Observable 将作为 “complete” 类型的 Notification 发送一个 `next`，然后它自身也会发送一个 `complete`。当源 Observable 发送 `error` 时，输出将作为“error”类型的 Notification 发送一个 `next`，然后自身也会 `complete`。
 *
 * This operator is useful for producing metadata of the source Observable, to
 * be consumed as `next` emissions. Use it in conjunction with
 * {@link dematerialize}.
 *
 * 该操作符对于生成源 Observable 的元数据很有用，可以将这些元数据作为 `next` 值进行消费。要与 {@link dematerialize} 结合使用。
 *
 * ## Example
 *
 * ## 例子
 *
 * Convert a faulty Observable to an Observable of Notifications
 *
 * 将有缺陷的 Observable 转换为通知的 Observable
 *
 * ```ts
 * import { of, materialize, map } from 'rxjs';
 *
 * const letters = of('a', 'b', 13, 'd');
 * const upperCase = letters.pipe(map((x: any) => x.toUpperCase()));
 * const materialized = upperCase.pipe(materialize());
 *
 * materialized.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // - Notification { kind: 'N', value: 'A', error: undefined, hasValue: true }
 * // - Notification { kind: 'N', value: 'B', error: undefined, hasValue: true }
 * // - Notification { kind: 'E', value: undefined, error: TypeError { message: x.toUpperCase is not a function }, hasValue: false }
 * ```
 * @see {@link Notification}
 * @see {@link dematerialize}
 * @return A function that returns an Observable that emits
 * {@link Notification} objects that wrap the original emissions from the
 * source Observable with metadata.
 *
 * 一个返回 Observable 的函数，该 Observable 会发送 {@link Notification} 对象，这些对象会使用元数据包装来自源 Observable 的原始发送物。
 *
 */
export function materialize<T>(): OperatorFunction<T, Notification<T> & ObservableNotification<T>> {
  return operate((source, subscriber) => {
    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value) => {
          subscriber.next(Notification.createNext(value));
        },
        () => {
          subscriber.next(Notification.createComplete());
          subscriber.complete();
        },
        (err) => {
          subscriber.next(Notification.createError(err));
          subscriber.complete();
        }
      )
    );
  });
}
