import { Observable } from '../Observable';
import { EmptyError } from '../util/EmptyError';
import { OperatorFunction, TruthyTypesOf } from '../types';
import { filter } from './filter';
import { take } from './take';
import { defaultIfEmpty } from './defaultIfEmpty';
import { throwIfEmpty } from './throwIfEmpty';
import { identity } from '../util/identity';

export function first<T, D = T>(predicate?: null, defaultValue?: D): OperatorFunction<T, T | D>;
export function first<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export function first<T, D>(predicate: BooleanConstructor, defaultValue: D): OperatorFunction<T, TruthyTypesOf<T> | D>;
export function first<T, S extends T>(
  predicate: (value: T, index: number, source: Observable<T>) => value is S,
  defaultValue?: S
): OperatorFunction<T, S>;
export function first<T, S extends T, D>(
  predicate: (value: T, index: number, source: Observable<T>) => value is S,
  defaultValue: D
): OperatorFunction<T, S | D>;
export function first<T, D = T>(
  predicate: (value: T, index: number, source: Observable<T>) => boolean,
  defaultValue?: D
): OperatorFunction<T, T | D>;

/**
 * Emits only the first value (or the first value that meets some condition)
 * emitted by the source Observable.
 *
 * 仅发送源 Observable 发送的第一个值（或满足某些条件的第一个值）。
 *
 * <span class="informal">Emits only the first value. Or emits only the first
 * value that passes some test.</span>
 *
 * <span class="informal">仅发送第一个值或能通过某些测试的第一个值。</span>
 *
 * ![](first.png)
 *
 * If called with no arguments, `first` emits the first value of the source
 * Observable, then completes. If called with a `predicate` function, `first`
 * emits the first value of the source that matches the specified condition. Throws an error if
 * `defaultValue` was not provided and a matching element is not found.
 *
 * 如果不带参数调用，`first` 就会发送源 Observable 的第一个值，然后完成。如果调用时带有 `predicate` 函数，则 `first` 会发送与指定条件匹配的源的第一个值。如果未提供 `defaultValue` 且未找到匹配元素，则会引发错误。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Emit only the first click that happens on the DOM
 *
 * 仅发送在 DOM 上发生的第一次点击
 *
 * ```ts
 * import { fromEvent, first } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(first());
 * result.subscribe(x => console.log(x));
 * ```
 *
 * Emits the first click that happens on a DIV
 *
 * 发送在 DIV 上发生的第一次点击
 *
 * ```ts
 * import { fromEvent, first } from 'rxjs';
 *
 * const div = document.createElement('div');
 * div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
 * document.body.appendChild(div);
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(first(ev => (<HTMLElement>ev.target).tagName === 'DIV'));
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link filter}
 * @see {@link find}
 * @see {@link take}
 * @throws {EmptyError} Delivers an EmptyError to the Observer's `error`
 * callback if the Observable completes before any `next` notification was sent.
 * This is how `first()` is different from {@link take}(1) which completes instead.
 *
 * 如果此 Observable 在发送任何 `next` 通知之前就已完成，则将 EmptyError 传给 Observer 的 `error` 回调。这就是 `first()` 与 {@link take}(1) 的不同之处，后者会直接完成。
 *
 * @param {function(value: T, index: number, source: Observable<T>): boolean} [predicate]
 * An optional function called with each item to test for condition matching.
 *
 * 一个可选函数，用于针对每个条目进行调用，以测试条件是否匹配。
 *
 * @param {D} [defaultValue] The default value emitted in case no valid value
 * was found on the source.
 *
 * 如果在源上找不到有效值，则发出此默认值。
 *
 * @return A function that returns an Observable that emits the first item that
 * matches the condition.
 *
 * 一个返回 Observable 的函数，该 Observable 会发送满足此条件的第一个条目。
 *
 */
export function first<T, D>(
  predicate?: ((value: T, index: number, source: Observable<T>) => boolean) | null,
  defaultValue?: D
): OperatorFunction<T, T | D> {
  const hasDefaultValue = arguments.length >= 2;
  return (source: Observable<T>) =>
    source.pipe(
      predicate ? filter((v, i) => predicate(v, i, source)) : identity,
      take(1),
      hasDefaultValue ? defaultIfEmpty(defaultValue!) : throwIfEmpty(() => new EmptyError())
    );
}
