import { Observable } from '../Observable';
import { noop } from '../util/noop';

/**
 * An Observable that emits no items to the Observer and never completes.
 *
 * 一个不向观察者发出任何项目并且永远不会完成的 Observable。
 *
 * ![](never.png)
 *
 * A simple Observable that emits neither values nor errors nor the completion
 * notification. It can be used for testing purposes or for composing with other
 * Observables. Please note that by never emitting a complete notification, this
 * Observable keeps the subscription from being disposed automatically.
 * Subscriptions need to be manually disposed.
 *
 * 一个简单的 Observable，既不发出值也不发出错误，也不发出完成通知。它可用于测试目的或与其他 Observable 组合。请注意，通过从不发出完整的通知，这个 Observable 可以防止订阅被自动释放。订阅需要手动处理。
 *
 * ## Example
 *
 * ## 例子
 *
 * Emit the number 7, then never emit anything else (not even complete)
 *
 * 发出数字 7，然后再不发出任何其他东西（甚至不完整）
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
 * 替换为 {@link NEVER} 常量。将在 v8 中删除。
 *
 */
export function never() {
  return NEVER;
}
