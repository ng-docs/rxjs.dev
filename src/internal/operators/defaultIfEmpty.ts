import { OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * Emits a given value if the source Observable completes without emitting any
 * `next` value, otherwise mirrors the source Observable.
 *
 * 如果源 Observable 已完成而没有发送任何 `next` 值，则发送给定值，否则就会镜像源 Observable。
 *
 * <span class="informal">If the source Observable turns out to be empty, then
 * this operator will emit a default value.</span>
 *
 * <span class="informal">如果源 Observable 为空，则此操作符将发送一个默认值。</span>
 *
 * ![](defaultIfEmpty.png)
 *
 * `defaultIfEmpty` emits the values emitted by the source Observable or a
 * specified default value if the source Observable is empty (completes without
 * having emitted any `next` value).
 *
 * `defaultIfEmpty` 会发送由源 Observable 发送的值，或者如果源 Observable 为空（在还没有发送任何 `next` 值时就已完成）则发送指定的默认值。
 *
 * ## Example
 *
 * ## 例子
 *
 * If no clicks happen in 5 seconds, then emit 'no clicks'
 *
 * 如果在 5 秒内没有点击，则发送 'no clicks'
 *
 * ```ts
 * import { fromEvent, takeUntil, interval, defaultIfEmpty } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const clicksBeforeFive = clicks.pipe(takeUntil(interval(5000)));
 * const result = clicksBeforeFive.pipe(defaultIfEmpty('no clicks'));
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link empty}
 * @see {@link last}
 * @param defaultValue The default value used if the source
 * Observable is empty.
 *
 * 如果源 Observable 为空，则使用此默认值。
 *
 * @return A function that returns an Observable that emits either the
 * specified `defaultValue` if the source Observable emits no items, or the
 * values emitted by the source Observable.
 *
 * 返回一个 Observable 的函数，如果源 Observable 没有发送任何条目，则该 Observable 就会发送指定的 `defaultValue`，否则就发出源 Observable 发来的值。
 *
 */
export function defaultIfEmpty<T, R>(defaultValue: R): OperatorFunction<T, T | R> {
  return operate((source, subscriber) => {
    let hasValue = false;
    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        (value) => {
          hasValue = true;
          subscriber.next(value);
        },
        () => {
          if (!hasValue) {
            subscriber.next(defaultValue!);
          }
          subscriber.complete();
        }
      )
    );
  });
}
