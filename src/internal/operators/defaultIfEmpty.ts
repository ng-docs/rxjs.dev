import { OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Emits a given value if the source Observable completes without emitting any
 * `next` value, otherwise mirrors the source Observable.
 *
 * 如果源 Observable 完成而没有发出任何 `next` 值，则发出给定值，否则镜像源 Observable。
 *
 * <span class="informal">If the source Observable turns out to be empty, then
 * this operator will emit a default value.</span>
 *
 * <span class="informal">如果源 Observable 为空，则此操作符将发出一个默认值。</span>
 *
 * ![](defaultIfEmpty.png)
 *
 * `defaultIfEmpty` emits the values emitted by the source Observable or a
 * specified default value if the source Observable is empty (completes without
 * having emitted any `next` value).
 *
 * `defaultIfEmpty` 发出由源 Observable 发出的值，或者如果源 Observable 为空则发出指定的默认值（在没有发出任何 `next` 值的情况下完成）。
 *
 * ## Example
 *
 * ## 例子
 *
 * If no clicks happen in 5 seconds, then emit 'no clicks'
 *
 * 如果在 5 秒内没有点击，则发出 'no clicks'
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
 * 如果源 Observable 为空，则使用默认值。
 *
 * @return A function that returns an Observable that emits either the
 * specified `defaultValue` if the source Observable emits no items, or the
 * values emitted by the source Observable.
 *
 * 返回一个 Observable 的函数，如果源 Observable 没有发出任何项，则该 Observable 发出指定的 `defaultValue`，或者源 Observable 发出的值。
 *
 */
export function defaultIfEmpty<T, R>(defaultValue: R): OperatorFunction<T, T | R> {
  return operate((source, subscriber) => {
    let hasValue = false;
    source.subscribe(
      new OperatorSubscriber(
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
