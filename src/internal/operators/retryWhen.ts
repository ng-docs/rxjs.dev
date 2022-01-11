import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { Subscription } from '../Subscription';

import { MonoTypeOperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Returns an Observable that mirrors the source Observable with the exception of an `error`. If the source Observable
 * calls `error`, this method will emit the Throwable that caused the error to the Observable returned from `notifier`.
 * If that Observable calls `complete` or `error` then this method will call `complete` or `error` on the child
 * subscription. Otherwise this method will resubscribe to the source Observable.
 *
 * 返回一个镜像源 Observable 的 Observable，但 `error` 除外。如果源 Observable 调用 `error` ，该方法会将导致错误的 Throwable 发送到从 `notifier` 返回的 Observable。如果该 Observable 调用 `complete` 或 `error` ，则此方法将在子订阅上调用 `complete` 或 `error` 。否则此方法将重新订阅源 Observable。
 *
 * ![](retryWhen.png)
 *
 * Retry an observable sequence on error based on custom criteria.
 *
 * 根据自定义标准重试可观察到的错误序列。
 *
 * ## Example
 *
 * ## 例子
 *
 * ```ts
 * import { interval, map, retryWhen, tap, delayWhen, timer } from 'rxjs';
 *
 * const source = interval(1000);
 * const result = source.pipe(
 *   map(value => {
 *     if (value > 5) {
 *       // error will be picked up by retryWhen
 *       throw value;
 *     }
 *     return value;
 *   }),
 *   retryWhen(errors =>
 *     errors.pipe(
 *       // log error message
 *       tap(value => console.log(`Value ${ value } was too high!`)),
 *       // restart in 5 seconds
 *       delayWhen(value => timer(value * 1000))
 *     )
 *   )
 * );
 *
 * result.subscribe(value => console.log(value));
 *
 * // results:
 * // 0
 * // 1
 * // 2
 * // 3
 * // 4
 * // 5
 * // 'Value 6 was too high!'
 * // - Wait 5 seconds then repeat
 * ```
 * @see {@link retry}
 * @param {function(errors: Observable): Observable} notifier - Receives an Observable of notifications with which a
 *   user can `complete` or `error`, aborting the retry.
 *
 *   接收一个 Observable 通知，用户可以使用这些通知 `complete` 或 `error` ，中止重试。
 *
 * @return A function that returns an Observable that mirrors the source
 * Observable with the exception of an `error`.
 *
 * 一个返回 Observable 的函数，该 Observable 镜像源 Observable，但 `error` 除外。
 *
 */
export function retryWhen<T>(notifier: (errors: Observable<any>) => Observable<any>): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let innerSub: Subscription | null;
    let syncResub = false;
    let errors$: Subject<any>;

    const subscribeForRetryWhen = () => {
      innerSub = source.subscribe(
        new OperatorSubscriber(subscriber, undefined, undefined, (err) => {
          if (!errors$) {
            errors$ = new Subject();
            notifier(errors$).subscribe(
              new OperatorSubscriber(subscriber, () =>
                // If we have an innerSub, this was an asynchronous call, kick off the retry.
                // Otherwise, if we don't have an innerSub yet, that's because the inner subscription
                // call hasn't even returned yet. We've arrived here synchronously.
                // So we flag that we want to resub, such that we can ensure teardown
                // happens before we resubscribe.
                innerSub ? subscribeForRetryWhen() : (syncResub = true)
              )
            );
          }
          if (errors$) {
            // We have set up the notifier without error.
            errors$.next(err);
          }
        })
      );

      if (syncResub) {
        // Ensure that the inner subscription is torn down before
        // moving on to the next subscription in the synchronous case.
        // If we don't do this here, all inner subscriptions will not be
        // torn down until the entire observable is done.
        innerSub.unsubscribe();
        innerSub = null;
        // We may need to do this multiple times, so reset the flag.
        syncResub = false;
        // Resubscribe
        subscribeForRetryWhen();
      }
    };

    // Start the subscription
    subscribeForRetryWhen();
  });
}
