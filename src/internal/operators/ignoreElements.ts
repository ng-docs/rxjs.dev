import { OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { noop } from '../util/noop';

/**
 * Ignores all items emitted by the source Observable and only passes calls of `complete` or `error`.
 *
 * 忽略源 Observable 发出的所有项目，只传递 `complete` 或 `error` 的调用。
 *
 * ![](ignoreElements.png)
 *
 * The `ignoreElements` operator suppresses all items emitted by the source Observable,
 * but allows its termination notification (either `error` or `complete`) to pass through unchanged.
 *
 * `ignoreElements` 操作符抑制源 Observable 发出的所有项目，但允许其终止通知（`error` 或 `complete`）通过不变。
 *
 * If you do not care about the items being emitted by an Observable, but you do want to be notified
 * when it completes or when it terminates with an error, you can apply the `ignoreElements` operator
 * to the Observable, which will ensure that it will never call its observers’ `next` handlers.
 *
 * 如果你不关心 Observable 发出的项目，但你确实希望在它完成或因错误终止时收到通知，你可以将 `ignoreElements` 操作符应用于 Observable，这将确保它永远不会调用它的观察者的 `next` 处理程序。
 *
 * ## Example
 *
 * ## 例子
 *
 * Ignore all `next` emissions from the source
 *
 * 忽略源头的所有 `next` 排放
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
 * 一个返回一个空 Observable 的函数，它只调用 `complete` 或 `error`，基于哪个由源 Observable 调用。
 *
 */
export function ignoreElements(): OperatorFunction<unknown, never> {
  return operate((source, subscriber) => {
    source.subscribe(new OperatorSubscriber(subscriber, noop));
  });
}
