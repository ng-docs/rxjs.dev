import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { OperatorFunction, TruthyTypesOf } from '../types';
import { operate } from '../util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

export function find<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
/**
 * @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.
 *
 * 改用闭包而不是 `thisArg`。接受 `thisArg` 的签名将在 v8 中被删除。
 *
 */
export function find<T, S extends T, A>(
  predicate: (this: A, value: T, index: number, source: Observable<T>) => value is S,
  thisArg: A
): OperatorFunction<T, S | undefined>;
export function find<T, S extends T>(
  predicate: (value: T, index: number, source: Observable<T>) => value is S
): OperatorFunction<T, S | undefined>;
/**
 * @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.
 *
 * 改用闭包而不是 `thisArg`。接受 `thisArg` 的签名将在 v8 中被删除。
 *
 */
export function find<T, A>(
  predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean,
  thisArg: A
): OperatorFunction<T, T | undefined>;
export function find<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, T | undefined>;
/**
 * Emits only the first value emitted by the source Observable that meets some
 * condition.
 *
 * 仅发送源 Observable 发来的第一个满足某些条件的值。
 *
 * <span class="informal">Finds the first value that passes some test and emits
 * that.</span>
 *
 * <span class="informal">找到能通过某些测试的第一个值并发出它。</span>
 *
 * ![](find.png)
 *
 * `find` searches for the first item in the source Observable that matches the
 * specified condition embodied by the `predicate`, and returns the first
 * occurrence in the source. Unlike {@link first}, the `predicate` is required
 * in `find`, and does not emit an error if a valid value is not found
 * (emits `undefined` instead).
 *
 * `find` 会搜索源 Observable 中能满足指定条件 `predicate` 的第一个条目，并返回它。与 {@link first} 不同，`predicate` 在 `find` 中是必需的，如果未找到有效值，则不会发送错误（而是改为发 `undefined`）。
 *
 * ## Example
 *
 * ## 例子
 *
 * Find and emit the first click that happens on a DIV element
 *
 * 查找并发送发生在 DIV 元素上的第一次点击
 *
 * ```ts
 * import { fromEvent, find } from 'rxjs';
 *
 * const div = document.createElement('div');
 * div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
 * document.body.appendChild(div);
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(find(ev => (<HTMLElement>ev.target).tagName === 'DIV'));
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link filter}
 * @see {@link first}
 * @see {@link findIndex}
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
 * @return A function that returns an Observable that emits the first item that
 * matches the condition.
 *
 * 一个返回 Observable 的函数，该 Observable 会发出满足此条件的第一个条目。
 *
 */
export function find<T>(
  predicate: (value: T, index: number, source: Observable<T>) => boolean,
  thisArg?: any
): OperatorFunction<T, T | undefined> {
  return operate(createFind(predicate, thisArg, 'value'));
}

export function createFind<T>(
  predicate: (value: T, index: number, source: Observable<T>) => boolean,
  thisArg: any,
  emit: 'value' | 'index'
) {
  const findIndex = emit === 'index';
  return (source: Observable<T>, subscriber: Subscriber<any>) => {
    let index = 0;
    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        (value) => {
          const i = index++;
          if (predicate.call(thisArg, value, i, source)) {
            subscriber.next(findIndex ? i : value);
            subscriber.complete();
          }
        },
        () => {
          subscriber.next(findIndex ? -1 : undefined);
          subscriber.complete();
        }
      )
    );
  };
}
