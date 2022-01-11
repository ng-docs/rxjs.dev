import { Observable } from '../Observable';
import { noop } from '../util/noop';

/**
 * An Observable that emits no items to the Observer and never completes.
 *
 * 一个不会向 Observer 发送任何条目并且永远不会完成的 Observable。
 *
 * ![](never.png)
 *
 * A simple Observable that emits neither values nor errors nor the completion
 * notification. It can be used for testing purposes or for composing with other
 * Observables. Please note that by never emitting a complete notification, this
 * Observable keeps the subscription from being disposed automatically.
 * Subscriptions need to be manually disposed.
 *
 * 一个简单的 Observable，既不发送值也不发送错误，也不发送完成通知。它可用于测试中，或与其它 Observable 组合使用。请注意，通过从不发送完成通知，这个 Observable 可以防止订阅被自动释放。这些订阅需要手动处理。
 *
 * ## Example
 *
 * ## 例子
 *
 * Emit the number 7, then never emit anything else (not even complete)
 *
 * 发送数字 7，然后再不发送任何其它东西（甚至不会完成）
 *
 * ```ts
 * import { NEVER, startWith } from 'rxjs';
 *
 * const info = () => console.log('Will not be called');
 *
 * const result = NEVER.pipe(startWith(7));
 * result.subscribe({
 *   next: x => console.log(x),
 *   error: info,
 *   complete: info
 * });
 * ```
 * @see {@link Observable}
 * @see {@link EMPTY}
 * @see {@link of}
 * @see {@link throwError}
 */
export const NEVER = new Observable<never>(noop);

/**
 * @deprecated Replaced with the {@link NEVER} constant. Will be removed in v8.
 *
 * 已替换为 {@link NEVER} 常量。将在 v8 中删除。
 *
 */
export function never() {
  return NEVER;
}
