import { Observable } from '../Observable';
import { MonoTypeOperatorFunction } from '../types';
import { concat } from '../observable/concat';
import { take } from './take';
import { ignoreElements } from './ignoreElements';
import { mapTo } from './mapTo';
import { mergeMap } from './mergeMap';

/**
 * @deprecated The `subscriptionDelay` parameter will be removed in v8.
 *
 * `subscriptionDelay` 参数将在 v8 中移除。
 *
 */
export function delayWhen<T>(
  delayDurationSelector: (value: T, index: number) => Observable<any>,
  subscriptionDelay: Observable<any>
): MonoTypeOperatorFunction<T>;
export function delayWhen<T>(delayDurationSelector: (value: T, index: number) => Observable<any>): MonoTypeOperatorFunction<T>;

/**
 * Delays the emission of items from the source Observable by a given time span
 * determined by the emissions of another Observable.
 *
 * 将源 Observable 中项目的发射延迟给定的时间跨度，该时间跨度由另一个 Observable 的发射确定。
 *
 * <span class="informal">It's like {@link delay}, but the time span of the
 * delay duration is determined by a second Observable.</span>
 *
 * <span class="informal">类似于 {@link delay}，但延迟持续时间的时间跨度由第二个 Observable 决定。</span>
 *
 * ![](delayWhen.png)
 *
 * `delayWhen` time shifts each emitted value from the source Observable by a
 * time span determined by another Observable. When the source emits a value,
 * the `delayDurationSelector` function is called with the source value as
 * argument, and should return an Observable, called the "duration" Observable.
 * The source value is emitted on the output Observable only when the duration
 * Observable emits a value or completes.
 * The completion of the notifier triggering the emission of the source value
 * is deprecated behavior and will be removed in future versions.
 *
 * `delayWhen` 将每个发出的值从源 Observable 偏移一个由另一个 Observable 确定的时间跨度。当源发出一个值时，以源值作为参数调用 `delayDurationSelector` 函数，并且应该返回一个 Observable，称为“duration” Observable。只有当持续时间 Observable 发出一个值或完成时，源值才会在输出 Observable 上发出。触发源值发射的通知程序的完成是不推荐的行为，将在未来的版本中删除。
 *
 * Optionally, `delayWhen` takes a second argument, `subscriptionDelay`, which
 * is an Observable. When `subscriptionDelay` emits its first value or
 * completes, the source Observable is subscribed to and starts behaving like
 * described in the previous paragraph. If `subscriptionDelay` is not provided,
 * `delayWhen` will subscribe to the source Observable as soon as the output
 * Observable is subscribed.
 *
 * 可选地， `delayWhen` 接受第二个参数， `subscriptionDelay` ，它是一个 Observable。当 `subscriptionDelay` 发出它的第一个值或完成时，源 Observable 被订阅并开始像上一段中描述的那样表现。如果未提供 `subscriptionDelay` ，则 `delayWhen` 将在订阅输出 Observable 后立即订阅源 Observable。
 *
 * ## Example
 *
 * ## 例子
 *
 * Delay each click by a random amount of time, between 0 and 5 seconds
 *
 * 将每次点击延迟随机的时间量，介于 0 到 5 秒之间
 *
 * ```ts
 * import { fromEvent, delayWhen, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const delayedClicks = clicks.pipe(
 *   delayWhen(() => interval(Math.random() * 5000))
 * );
 * delayedClicks.subscribe(x => console.log(x));
 * ```
 * @see {@link delay}
 * @see {@link throttle}
 * @see {@link throttleTime}
 * @see {@link debounce}
 * @see {@link debounceTime}
 * @see {@link sample}
 * @see {@link sampleTime}
 * @see {@link audit}
 * @see {@link auditTime}
 * @param {function(value: T, index: number): Observable} delayDurationSelector A function that
 * returns an Observable for each value emitted by the source Observable, which
 * is then used to delay the emission of that item on the output Observable
 * until the Observable returned from this function emits a value.
 *
 * 一个函数，它为源 Observable 发出的每个值返回一个 Observable，然后用于延迟该项目在输出 Observable 上的发射，直到从该函数返回的 Observable 发射一个值。
 *
 * @param {Observable} subscriptionDelay An Observable that triggers the
 * subscription to the source Observable once it emits any value.
 *
 * 一个 Observable，一旦它发出任何值，就会触发对源 Observable 的订阅。
 *
 * @return A function that returns an Observable that delays the emissions of
 * the source Observable by an amount of time specified by the Observable
 * returned by `delayDurationSelector`.
 *
 * 一个返回 Observable 的函数，该函数将源 Observable 的发射延迟由 `delayDurationSelector` 返回的 Observable 指定的时间量。
 *
 */
export function delayWhen<T>(
  delayDurationSelector: (value: T, index: number) => Observable<any>,
  subscriptionDelay?: Observable<any>
): MonoTypeOperatorFunction<T> {
  if (subscriptionDelay) {
    // DEPRECATED PATH
    return (source: Observable<T>) =>
      concat(subscriptionDelay.pipe(take(1), ignoreElements()), source.pipe(delayWhen(delayDurationSelector)));
  }

  return mergeMap((value, index) => delayDurationSelector(value, index).pipe(take(1), mapTo(value)));
}
