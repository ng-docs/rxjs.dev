import { OperatorFunction, MonoTypeOperatorFunction, TruthyTypesOf } from '../types';
import { operate } from '../util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.
 *
 * 改用闭包而不是 `thisArg`。接受 `thisArg` 的签名将在 v8 中被删除。
 *
 */
export function filter<T, S extends T, A>(predicate: (this: A, value: T, index: number) => value is S, thisArg: A): OperatorFunction<T, S>;
export function filter<T, S extends T>(predicate: (value: T, index: number) => value is S): OperatorFunction<T, S>;
export function filter<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
/**
 * @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.
 *
 * 改用闭包而不是 `thisArg`。接受 `thisArg` 的签名将在 v8 中被删除。
 *
 */
export function filter<T, A>(predicate: (this: A, value: T, index: number) => boolean, thisArg: A): MonoTypeOperatorFunction<T>;
export function filter<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>;

/**
 * Filter items emitted by the source Observable by only emitting those that
 * satisfy a specified predicate.
 *
 * 过滤源 Observable 发送的条目，仅发送满足指定谓词的条目。
 *
 * <span class="informal">Like
 * [Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter),
 * it only emits a value from the source if it passes a criterion function.</span>
 *
 * <span class="informal">像 [Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) 一样，它只会发送源中满足指定条件的值。</span>
 *
 * ![](filter.png)
 *
 * Similar to the well-known `Array.prototype.filter` method, this operator
 * takes values from the source Observable, passes them through a `predicate`
 * function and only emits those values that yielded `true`.
 *
 * 类似于众所周知的 `Array.prototype.filter` 方法，该操作符会从源 Observable 获取值，将它们传给 `predicate` 函数，并且只发送那些计算结果为 `true` 的值。
 *
 * ## Example
 *
 * ## 例子
 *
 * Emit only click events whose target was a DIV element
 *
 * 只发送目标是 DIV 元素的点击事件
 *
 * ```ts
 * import { fromEvent, filter } from 'rxjs';
 *
 * const div = document.createElement('div');
 * div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
 * document.body.appendChild(div);
 *
 * const clicks = fromEvent(document, 'click');
 * const clicksOnDivs = clicks.pipe(filter(ev => (<HTMLElement>ev.target).tagName === 'DIV'));
 * clicksOnDivs.subscribe(x => console.log(x));
 * ```
 * @see {@link distinct}
 * @see {@link distinctUntilChanged}
 * @see {@link distinctUntilKeyChanged}
 * @see {@link ignoreElements}
 * @see {@link partition}
 * @see {@link skip}
 * @param predicate A function that
 * evaluates each value emitted by the source Observable. If it returns `true`,
 * the value is emitted, if `false` the value is not passed to the output
 * Observable. The `index` parameter is the number `i` for the i-th source
 * emission that has happened since the subscription, starting from the number
 * `0`.
 *
 * 用于评估源 Observable 发送的每个值的函数。如果它返回 `true`，则发送该值；如果为 `false`，则该值不会传给输出 Observable。`index` 参数是自订阅以来从源发出的第 `i` 个值中的这个 `i`，从数字 `0` 开始。
 *
 * @param thisArg An optional argument to determine the value of `this`
 * in the `predicate` function.
 *
 * 一个可选参数，用于确定 `predicate` 函数中 `this` 的值。
 *
 * @return A function that returns an Observable that emits items from the
 * source Observable that satisfy the specified `predicate`.
 *
 * 一个返回 Observable 的函数，该 Observable 会从源 Observable 发送那些满足指定 `predicate` 的条目。
 *
 */
export function filter<T>(predicate: (value: T, index: number) => boolean, thisArg?: any): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    // An index passed to our predicate function on each call.
    let index = 0;

    // Subscribe to the source, all errors and completions are
    // forwarded to the consumer.
    source.subscribe(
      // Call the predicate with the appropriate `this` context,
      // if the predicate returns `true`, then send the value
      // to the consumer.
      createOperatorSubscriber(subscriber, (value) => predicate.call(thisArg, value, index++) && subscriber.next(value))
    );
  });
}
