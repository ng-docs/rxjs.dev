import { OperatorFunction } from '../types';
import { map } from './map';

export function mapTo<R>(value: R): OperatorFunction<unknown, R>;
/**
 * @deprecated Do not specify explicit type parameters. Signatures with type parameters that cannot be inferred will be removed in v8.
 *
 * 不要指定显式类型参数。带有无法推断的类型参数的签名将在 v8 中删除。
 *
 */
export function mapTo<T, R>(value: R): OperatorFunction<T, R>;

/**
 * Emits the given constant value on the output Observable every time the source
 * Observable emits a value.
 *
 * 每当源 Observable 发出一个值时，就在输出 Observable 上发送一个给定的常量值。
 *
 * <span class="informal">Like {@link map}, but it maps every source value to
 * the same output value every time.</span>
 *
 * <span class="informal">与 {@link map} 类似，但它每次都将每个源值映射为同一个输出值。</span>
 *
 * ![](mapTo.png)
 *
 * Takes a constant `value` as argument, and emits that whenever the source
 * Observable emits a value. In other words, ignores the actual source value,
 * and simply uses the emission moment to know when to emit the given `value`.
 *
 * 将一个常量 `value` 作为参数，并且每当源 Observable 上发来一个值时就发送该值。换句话说，忽略实际的源值，并单纯根据发送时机来决定何时发送给定的 `value`。
 *
 * ## Example
 *
 * ## 例子
 *
 * Map every click to the string `'Hi'`
 *
 * 将每次点击都映射为字符串 `'Hi'`
 *
 * ```ts
 * import { fromEvent, mapTo } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const greetings = clicks.pipe(mapTo('Hi'));
 *
 * greetings.subscribe(x => console.log(x));
 * ```
 * @see {@link map}
 * @param value The value to map each source value to.
 *
 * 要将每个源值映射到的值。
 *
 * @return A function that returns an Observable that emits the given `value`
 * every time the source Observable emits.
 *
 * 一个函数，它返回一个 Observable，每当源 Observable 发来值的时候就发送给定的 `value`。
 *
 */
export function mapTo<R>(value: R): OperatorFunction<unknown, R> {
  return map(() => value);
}
