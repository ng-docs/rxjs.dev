import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { Subscription } from '../Subscription';

import { MonoTypeOperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Returns an Observable that mirrors the source Observable with the exception of a `complete`. If the source
 * Observable calls `complete`, this method will emit to the Observable returned from `notifier`. If that Observable
 * calls `complete` or `error`, then this method will call `complete` or `error` on the child subscription. Otherwise
 * this method will resubscribe to the source Observable.
 *
 * 返回一个镜像源 Observable 的 Observable，但 `complete` 除外。如果源 Observable 调用 `complete` ，此方法将发送到从 `notifier` 返回的 Observable。如果该 Observable 调用 `complete` 或 `error` ，那么此方法将在子订阅上调用 `complete` 或 `error` 。否则此方法将重新订阅源 Observable。
 *
 * ![](repeatWhen.png)
 *
 * ## Example
 *
 * ## 例子
 *
 * Repeat a message stream on click
 *
 * 单击时重复消息流
 *
 * ```ts
 * import { of, fromEvent, repeatWhen } from 'rxjs';
 *
 * const source = of('Repeat message');
 * const documentClick$ = fromEvent(document, 'click');
 *
 * const result = source.pipe(repeatWhen(() => documentClick$));
 *
 * result.subscribe(data => console.log(data))
 * ```
 * @see {@link repeat}
 * @see {@link retry}
 * @see {@link retryWhen}
 * @param {function(notifications: Observable): Observable} notifier - Receives an Observable of notifications with
 *   which a user can `complete` or `error`, aborting the repetition.
 *
 *   接收用户可以 `complete` 或 `error` 的通知的 Observable，中止重复。
 *
 * @return A function that returns an Observable that that mirrors the source
 * Observable with the exception of a `complete`.
 *
 * 一个返回 Observable 的函数，该 Observable 镜像源 Observable，但 `complete` 除外。
 *
 */
export function repeatWhen<T>(notifier: (notifications: Observable<void>) => Observable<any>): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let innerSub: Subscription | null;
    let syncResub = false;
    let completions$: Subject<void>;
    let isNotifierComplete = false;
    let isMainComplete = false;

    /**
     * Checks to see if we can complete the result, completes it, and returns `true` if it was completed.
     *
     * 检查我们是否可以完成结果，完成它，如果完成则返回 `true` 。
     *
     */
    const checkComplete = () => isMainComplete && isNotifierComplete && (subscriber.complete(), true);
    /**
     * Gets the subject to send errors through. If it doesn't exist,
     * we know we need to setup the notifier.
     *
     * 获取要发送错误的主题。如果它不存在，我们知道我们需要设置通知程序。
     *
     */
    const getCompletionSubject = () => {
      if (!completions$) {
        completions$ = new Subject();

        // If the call to `notifier` throws, it will be caught by the OperatorSubscriber
        // In the main subscription -- in `subscribeForRepeatWhen`.
        notifier(completions$).subscribe(
          new OperatorSubscriber(
            subscriber,
            () => {
              if (innerSub) {
                subscribeForRepeatWhen();
              } else {
                // If we don't have an innerSub yet, that's because the inner subscription
                // call hasn't even returned yet. We've arrived here synchronously.
                // So we flag that we want to resub, such that we can ensure teardown
                // happens before we resubscribe.
                syncResub = true;
              }
            },
            () => {
              isNotifierComplete = true;
              checkComplete();
            }
          )
        );
      }
      return completions$;
    };

    const subscribeForRepeatWhen = () => {
      isMainComplete = false;

      innerSub = source.subscribe(
        new OperatorSubscriber(subscriber, undefined, () => {
          isMainComplete = true;
          // Check to see if we are complete, and complete if so.
          // If we are not complete. Get the subject. This calls the `notifier` function.
          // If that function fails, it will throw and `.next()` will not be reached on this
          // line. The thrown error is caught by the _complete handler in this
          // `OperatorSubscriber` and handled appropriately.
          !checkComplete() && getCompletionSubject().next();
        })
      );

      if (syncResub) {
        // Ensure that the inner subscription is torn down before
        // moving on to the next subscription in the synchronous case.
        // If we don't do this here, all inner subscriptions will not be
        // torn down until the entire observable is done.
        innerSub.unsubscribe();
        // It is important to null this out. Not only to free up memory, but
        // to make sure code above knows we are in a subscribing state to
        // handle synchronous resubscription.
        innerSub = null;
        // We may need to do this multiple times, so reset the flags.
        syncResub = false;
        // Resubscribe
        subscribeForRepeatWhen();
      }
    };

    // Start the subscription
    subscribeForRepeatWhen();
  });
}
