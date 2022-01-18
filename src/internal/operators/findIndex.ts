import { Observable } from '../Observable';
import { Falsy, OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { createFind } from './find';

export function findIndex<T>(predicate: BooleanConstructor): OperatorFunction<T, T extends Falsy ? -1 : number>;
/**
 * @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.
 *
 * 改用闭包而不是 `thisArg`。接受 `thisArg` 的签名将在 v8 中被删除。
 *
 */
export function findIndex<T>(predicate: BooleanConstructor, thisArg: any): OperatorFunction<T, T extends Falsy ? -1 : number>;
/**
 * @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.
 *
 * 改用闭包而不是 `thisArg`。接受 `thisArg` 的签名将在 v8 中被删除。
 *
 */
export function findIndex<T, A>(
  predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean,
  thisArg: A
): OperatorFunction<T, number>;
export function findIndex<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, number>;

/**
 * Emits only the index of the first value emitted by the source Observable that
 * meets some condition.
 *
 * 仅发送源 Observable 中满足某些条件的第一个值的序号。
 *
 * <span class="informal">It's like {@link find}, but emits the index of the
 * found value, not the value itself.</span>
 *
 * <span class="informal">它类似于 {@link find}，但发送的是找到的值的序号，而不是值本身。</span>
 *
 * ![](findIndex.png)
 *
 * `findIndex` searches for the first item in the source Observable that matches
 * the specified condition embodied by the `predicate`, and returns the
 * (zero-based) index of the first occurrence in the source. Unlike
 * {@link first}, the `predicate` is required in `findIndex`, and does not emit
 * an error if a valid value is not found.
 *
 * `findIndex` 会搜索源 Observable 中能满足指定条件 `predicate` 的第一个条目，并返回它的零基序号。与 {@link first} 不同，`predicate` 在 `findIndex` 中是必需的，如果未找到有效值，则不会发送错误。
 *
 * ## Example
 *
 * ## 例子
 *
 * Emit the index of first click that happens on a DIV element
 *
 * 发送发生在 DIV 元素上的第一次点击的序号
 *
 * ```ts
 * import { fromEvent, findIndex } from 'rxjs';
 *
 * const div = document.createElement('div');
 * div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
 * document.body.appendChild(div);
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(findIndex(ev => (<HTMLElement>ev.target).tagName === 'DIV'));
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link filter}
 * @see {@link find}
 * @see {@link first}
 * @see {@link take}
 * @param {function(value: T, index: number, source: Observable<T>): boolean} predicate
 * A function called with each item to test for condition matching.
 *
 * 一个函数，它会针对每个条目进行调用，以测试条件是否匹配。
 *
 * @param {any} [thisArg] An optional argument to determine the value of `this`
 * in the `predicate` function.
 *
 * 一个可选参数，用于确定 `predicate` 函数中 `this` 的值。
 *
 * @return A function that returns an Observable that emits the index of the
 * first item that matches the condition.
 *
 * 一个返回 Observable 的函数，它会发送满足此条件的第一个条目的序号。
 *
 */
export function findIndex<T>(
  predicate: (value: T, index: number, source: Observable<T>) => boolean,
  thisArg?: any
): OperatorFunction<T, number> {
  return operate(createFind(predicate, thisArg, 'index'));
}
