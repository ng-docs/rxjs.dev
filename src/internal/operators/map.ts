import { OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

export function map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R>;
/**
 * @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.
 *
 * 使用闭包而不是 `thisArg`。接受 `thisArg` 的签名将在 v8 中被删除。
 *
 */
export function map<T, R, A>(project: (this: A, value: T, index: number) => R, thisArg: A): OperatorFunction<T, R>;

/**
 * Applies a given `project` function to each value emitted by the source
 * Observable, and emits the resulting values as an Observable.
 *
 * 将给定的 `project` 函数应用于源 Observable 发出的每个值，并将结果值作为 Observable 发出。
 *
 * <span class="informal">Like [Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map),
 * it passes each source value through a transformation function to get
 * corresponding output values.</span>
 *
 * <span class="informal">与[Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)一样，它通过转换函数将每个源值传递以获取相应的输出值。</span>
 *
 * ![](map.png)
 *
 * Similar to the well known `Array.prototype.map` function, this operator
 * applies a projection to each value and emits that projection in the output
 * Observable.
 *
 * 与众所周知的 `Array.prototype.map` 函数类似，此运算符对每个值应用一个投影，并在输出 Observable 中发出该投影。
 *
 * ## Example
 *
 * ## 例子
 *
 * Map every click to the `clientX` position of that click
 *
 * 将每次点击映射到该点击的 `clientX` 位置
 *
 * ```ts
 * import { fromEvent, map } from 'rxjs';
 *
 * const clicks = fromEvent<PointerEvent>(document, 'click');
 * const positions = clicks.pipe(map(ev => ev.clientX));
 *
 * positions.subscribe(x => console.log(x));
 * ```
 * @see {@link mapTo}
 * @see {@link pluck}
 * @param {function(value: T, index: number): R} project The function to apply
 * to each `value` emitted by the source Observable. The `index` parameter is
 * the number `i` for the i-th emission that has happened since the
 * subscription, starting from the number `0`.
 *
 * 应用于源 Observable 发出的每个 `value` 的函数。`index` 参数是自订阅以来发生的第 i 个发射的数字 `i`，从数字 `0` 开始。
 *
 * @param {any} [thisArg] An optional argument to define what `this` is in the
 * `project` function.
 * @return A function that returns an Observable that emits the values from the
 * source Observable transformed by the given `project` function.
 *
 * 一个返回 Observable 的函数，该函数从给定 `project` 函数转换的源 Observable 发出值。
 *
 */
export function map<T, R>(project: (value: T, index: number) => R, thisArg?: any): OperatorFunction<T, R> {
  return operate((source, subscriber) => {
    // The index of the value from the source. Used with projection.
    let index = 0;
    // Subscribe to the source, all errors and completions are sent along
    // to the consumer.
    source.subscribe(
      new OperatorSubscriber(subscriber, (value: T) => {
        // Call the projection function with the appropriate this context,
        // and send the resulting value to the consumer.
        subscriber.next(project.call(thisArg, value, index++));
      })
    );
  });
}
