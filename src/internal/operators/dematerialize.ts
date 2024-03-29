import { observeNotification } from '../Notification';
import { OperatorFunction, ObservableNotification, ValueFromNotification } from '../types';
import { operate } from '../util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * Converts an Observable of {@link ObservableNotification} objects into the emissions
 * that they represent.
 *
 * 将 {@link ObservableNotification} 对象的 Observable 转换为它们所代表的发送物。
 *
 * <span class="informal">Unwraps {@link ObservableNotification} objects as actual `next`,
 * `error` and `complete` emissions. The opposite of {@link materialize}.</span>
 *
 * <span class="informal">将 {@link ObservableNotification} 对象解包为实际的 `next`、`error` 和 `complete` 进行发出。是 {@link materialize} 的反义词。</span>
 *
 * ![](dematerialize.png)
 *
 * `dematerialize` is assumed to operate an Observable that only emits
 * {@link ObservableNotification} objects as `next` emissions, and does not emit any
 * `error`. Such Observable is the output of a `materialize` operation. Those
 * notifications are then unwrapped using the metadata they contain, and emitted
 * as `next`, `error`, and `complete` on the output Observable.
 *
 * `dematerialize` 假设对 Observable 的操作只会将 {@link ObservableNotification} 对象作为 `next` 通知进行发送，并且不会发送任何 `error`。这样的 Observable 就是 `materialize` 操作的输出。然后使用它们包含的元数据对这些通知进行解包，并在输出 Observable 上发送 `next`、`error` 和 `complete`。
 *
 * Use this operator in conjunction with {@link materialize}.
 *
 * 将此操作符与 {@link materialize} 结合使用。
 *
 * ## Example
 *
 * ## 例子
 *
 * Convert an Observable of Notifications to an actual Observable
 *
 * 将通知的 Observable 转换为实际的 Observable
 *
 * ```ts
 * import { NextNotification, ErrorNotification, of, dematerialize } from 'rxjs';
 *
 * const notifA: NextNotification<string> = { kind: 'N', value: 'A' };
 * const notifB: NextNotification<string> = { kind: 'N', value: 'B' };
 * const notifE: ErrorNotification = { kind: 'E', error: new TypeError('x.toUpperCase is not a function') };
 *
 * const materialized = of(notifA, notifB, notifE);
 *
 * const upperCase = materialized.pipe(dematerialize());
 * upperCase.subscribe({
 *   next: x => console.log(x),
 *   error: e => console.error(e)
 * });
 *
 * // Results in:
 * // A
 * // B
 * // TypeError: x.toUpperCase is not a function
 * ```
 * @see {@link materialize}
 * @return A function that returns an Observable that emits items and
 * notifications embedded in Notification objects emitted by the source
 * Observable.
 *
 * 一个返回 Observable 的函数，该 Observable 会发送由源 Observable 发送的 Notification 对象中内嵌的各种条目和通知。
 *
 */
export function dematerialize<N extends ObservableNotification<any>>(): OperatorFunction<N, ValueFromNotification<N>> {
  return operate((source, subscriber) => {
    source.subscribe(createOperatorSubscriber(subscriber, (notification) => observeNotification(notification, subscriber)));
  });
}
