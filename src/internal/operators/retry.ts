import { MonoTypeOperatorFunction, ObservableInput } from '../types';
import { operate } from '../util/lift';
import { Subscription } from '../Subscription';
import { OperatorSubscriber } from './OperatorSubscriber';
import { identity } from '../util/identity';
import { timer } from '../observable/timer';
import { innerFrom } from '../observable/innerFrom';

export interface RetryConfig {
  /**
   * The maximum number of times to retry.
   *
   * 重试的最大次数。
   *
   */
  count?: number;
  /**
   * The number of milliseconds to delay before retrying, OR a function to
   * return a notifier for delaying. If a function is given, that function should
   * return a notifier that, when it emits will retry the source. If the notifier
   * completes _without_ emitting, the resulting observable will complete without error,
   * if the notifier errors, the error will be pushed to the result.
   *
   * 重试前延迟的毫秒数，或返回延迟通知器的函数。如果给定一个函数，该函数应该返回一个通知器，当它发出时将重试源。如果通知器在 _ 没有 _ 发出的情况下完成，则生成的 observable 将在没有错误的情况下完成，如果通知器出错，错误将被推送到结果中。
   *
   */
  delay?: number | ((error: any, retryCount: number) => ObservableInput<any>);
  /**
   * Whether or not to reset the retry counter when the retried subscription
   * emits its first value.
   *
   * 当重试订阅发出其第一个值时是否重置重试计数器。
   *
   */
  resetOnSuccess?: boolean;
}

/**
 * Returns an Observable that mirrors the source Observable with the exception of an `error`. If the source Observable
 * calls `error`, this method will resubscribe to the source Observable for a maximum of `count` resubscriptions (given
 * as a number parameter) rather than propagating the `error` call.
 *
 * 返回一个镜像源 Observable 的 Observable，但 `error` 除外。如果源 Observable 调用 `error`，此方法将重新订阅源 Observable 最多重新订阅 `count`（作为数字参数给出），而不是传播 `error` 调用。
 *
 * ![](retry.png)
 *
 * Any and all items emitted by the source Observable will be emitted by the resulting Observable, even those emitted
 * during failed subscriptions. For example, if an Observable fails at first but emits `[1, 2]` then succeeds the second
 * time and emits: `[1, 2, 3, 4, 5]` then the complete stream of emissions and notifications
 * would be: `[1, 2, 1, 2, 3, 4, 5, complete]`.
 *
 * 源 Observable 发出的任何和所有项目都将由结果 Observable 发出，即使是在订阅失败期间发出的那些。例如，如果一个 Observable 第一次失败但发出 `[1, 2]` 然后第二次成功并发出： `[1, 2, 3, 4, 5]` 那么完整的发射和通知流将是： `[1, 2, 1, 2, 3, 4, 5, complete]`。
 *
 * ## Example
 *
 * ## 例子
 *
 * ```ts
 * import { interval, mergeMap, throwError, of, retry } from 'rxjs';
 *
 * const source = interval(1000);
 * const result = source.pipe(
 *   mergeMap(val => val > 5 ? throwError(() => 'Error!') : of(val)),
 *   retry(2) // retry 2 times on error
 * );
 *
 * result.subscribe({
 *   next: value => console.log(value),
 *   error: err => console.log(`${ err }: Retried 2 times then quit!`)
 * });
 *
 * // Output:
 * // 0..1..2..3..4..5..
 * // 0..1..2..3..4..5..
 * // 0..1..2..3..4..5..
 * // 'Error!: Retried 2 times then quit!'
 * ```
 * @see {@link retryWhen}
 * @param count - Number of retry attempts before failing.
 *
 *   失败前的重试次数。
 *
 * @param resetOnSuccess - When set to `true` every successful emission will reset the error count
 *
 *   当设置为 `true` 时，每次成功的发射都会重置错误计数
 *
 * @return A function that returns an Observable that will resubscribe to the
 * source stream when the source stream errors, at most `count` times.
 *
 * 一个返回 Observable 的函数，当源流出错时将重新订阅源流，最多 `count` 次。
 *
 */
export function retry<T>(count?: number): MonoTypeOperatorFunction<T>;

/**
 * Returns an observable that mirrors the source observable unless it errors. If it errors, the source observable
 * will be resubscribed to (or "retried") based on the configuration passed here. See documentation
 * for {@link RetryConfig} for more details.
 *
 * 返回一个镜像源 observable 的 observable，除非它出错。如果出错，源 observable 将根据此处传递的配置重新订阅（或“重试”）。有关详细信息，请参阅 {@link RetryConfig} 的文档。
 *
 * @param config - The retry configuration
 *
 *   重试配置
 *
 */
export function retry<T>(config: RetryConfig): MonoTypeOperatorFunction<T>;

export function retry<T>(configOrCount: number | RetryConfig = Infinity): MonoTypeOperatorFunction<T> {
  let config: RetryConfig;
  if (configOrCount && typeof configOrCount === 'object') {
    config = configOrCount;
  } else {
    config = {
      count: configOrCount,
    };
  }
  const { count = Infinity, delay, resetOnSuccess: resetOnSuccess = false } = config;

  return count <= 0
    ? identity
    : operate((source, subscriber) => {
        let soFar = 0;
        let innerSub: Subscription | null;
        const subscribeForRetry = () => {
          let syncUnsub = false;
          innerSub = source.subscribe(
            new OperatorSubscriber(
              subscriber,
              (value) => {
                // If we're resetting on success
                if (resetOnSuccess) {
                  soFar = 0;
                }
                subscriber.next(value);
              },
              // Completions are passed through to consumer.
              undefined,
              (err) => {
                if (soFar++ < count) {
                  // We are still under our retry count
                  const resub = () => {
                    if (innerSub) {
                      innerSub.unsubscribe();
                      innerSub = null;
                      subscribeForRetry();
                    } else {
                      syncUnsub = true;
                    }
                  };

                  if (delay != null) {
                    // The user specified a retry delay.
                    // They gave us a number, use a timer, otherwise, it's a function,
                    // and we're going to call it to get a notifier.
                    const notifier = typeof delay === 'number' ? timer(delay) : innerFrom(delay(err, soFar));
                    const notifierSubscriber = new OperatorSubscriber(
                      subscriber,
                      () => {
                        // After we get the first notification, we
                        // unsubscribe from the notifer, because we don't want anymore
                        // and we resubscribe to the source.
                        notifierSubscriber.unsubscribe();
                        resub();
                      },
                      () => {
                        // The notifier completed without emitting.
                        // The author is telling us they want to complete.
                        subscriber.complete();
                      }
                    );
                    notifier.subscribe(notifierSubscriber);
                  } else {
                    // There was no notifier given. Just resub immediately.
                    resub();
                  }
                } else {
                  // We're past our maximum number of retries.
                  // Just send along the error.
                  subscriber.error(err);
                }
              }
            )
          );
          if (syncUnsub) {
            innerSub.unsubscribe();
            innerSub = null;
            subscribeForRetry();
          }
        };
        subscribeForRetry();
      });
}
