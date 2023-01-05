import { OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { noop } from '../util/noop';
import { Subscriber } from '../Subscriber';

/**
 * Ignores all items emitted by the source Observable and only passes calls of `complete` or `error`.
 *
 * 忽略源 Observable 发送的所有条目，只传递 `complete` 或 `error` 的调用。
 *
 * ![](ignoreElements.png)
 *
 * The `ignoreElements` operator suppresses all items emitted by the source Observable,
 * but allows its termination notification (either `error` or `complete`) to pass through unchanged.
 *
 * `ignoreElements` 操作符会忽略源 Observable 发送的所有条目，但允许其终止通知（`error` 或 `complete`）正常通过。
 *
 * If you do not care about the items being emitted by an Observable, but you do want to be notified
 * when it completes or when it terminates with an error, you can apply the `ignoreElements` operator
 * to the Observable, which will ensure that it will never call its observers’ `next` handlers.
 *
 * 如果你不关心 Observable 发送的条目，但你确实希望在它完成或因错误终止时收到通知，你可以使用 `ignoreElements` 操作符，这将确保它永远不会调用其 Observer 的 `next` 处理器。
 *
 * ## Example
 *
 * ## 例子
 *
 * Ignore all `next` emissions from the source
 *
 * 忽略源发送的所有 `next` 值
 *
 * ```ts
 * import { of, ignoreElements } from 'rxjs';
 *
 * of('you', 'talking', 'to', 'me')
 *   .pipe(ignoreElements())
 *   .subscribe({
 *     next: word => console.log(word),
 *     error: err => console.log('error:', err),
 *     complete: () => console.log('the end'),
 *   });
 *
 * // result:
 * // 'the end'
 * ```
 * @return A function that returns an empty Observable that only calls
 * `complete` or `error`, based on which one is called by the source
 * Observable.
 *
 * 一个返回空 Observable 的函数，它只会调用 `complete` 或 `error`，具体取决于源 Observable 调用了哪个。
 *
 */
export function ignoreElements(): OperatorFunction<unknown, never> {
  return operate((source, subscriber) => {
    source.subscribe(createOperatorSubscriber(subscriber as Subscriber<unknown>, noop));
  });
}
