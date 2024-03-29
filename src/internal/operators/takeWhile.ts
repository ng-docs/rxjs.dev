import { OperatorFunction, MonoTypeOperatorFunction, TruthyTypesOf } from '../types';
import { operate } from '../util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

export function takeWhile<T>(predicate: BooleanConstructor, inclusive: true): MonoTypeOperatorFunction<T>;
export function takeWhile<T>(predicate: BooleanConstructor, inclusive: false): OperatorFunction<T, TruthyTypesOf<T>>;
export function takeWhile<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export function takeWhile<T, S extends T>(predicate: (value: T, index: number) => value is S): OperatorFunction<T, S>;
export function takeWhile<T, S extends T>(predicate: (value: T, index: number) => value is S, inclusive: false): OperatorFunction<T, S>;
export function takeWhile<T>(predicate: (value: T, index: number) => boolean, inclusive?: boolean): MonoTypeOperatorFunction<T>;

/**
 * Emits values emitted by the source Observable so long as each value satisfies
 * the given `predicate`, and then completes as soon as this `predicate` is not
 * satisfied.
 *
 * 只要每个值都满足给定的 `predicate`，就发送源 Observable 发出的值，当不再满足该 `predicate` 时就会立即完成。
 *
 * <span class="informal">Takes values from the source only while they pass the
 * condition given. When the first value does not satisfy, it completes.</span>
 *
 * <span class="informal">仅当它们满足给定条件时才从源中获取值。遇到第一个不满足的值时，就会完成。</span>
 *
 * ![](takeWhile.png)
 *
 * `takeWhile` subscribes and begins mirroring the source Observable. Each value
 * emitted on the source is given to the `predicate` function which returns a
 * boolean, representing a condition to be satisfied by the source values. The
 * output Observable emits the source values until such time as the `predicate`
 * returns false, at which point `takeWhile` stops mirroring the source
 * Observable and completes the output Observable.
 *
 * `takeWhile` 会订阅并开始镜像源 Observable。针对源上发送的每个值调用一个返回布尔值的 `predicate` 函数，该函数表示源值要满足的条件。输出 Observable 会不断发送源值，直到 `predicate` 返回 false，此时 `takeWhile` 会停止镜像源 Observable 并将输出 Observable 结束。
 *
 * ## Example
 *
 * ## 例子
 *
 * Emit click events only while the clientX property is greater than 200
 *
 * 仅当 clientX 属性大于 200 时才发送点击事件
 *
 * ```ts
 * import { fromEvent, takeWhile } from 'rxjs';
 *
 * const clicks = fromEvent<PointerEvent>(document, 'click');
 * const result = clicks.pipe(takeWhile(ev => ev.clientX > 200));
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link take}
 * @see {@link takeLast}
 * @see {@link takeUntil}
 * @see {@link skip}
 * @param {function(value: T, index: number): boolean} predicate A function that
 * evaluates a value emitted by the source Observable and returns a boolean.
 * Also takes the (zero-based) index as the second argument.
 *
 * 一个计算源 Observable 已发送的值并返回布尔值的函数。还将一个（从零开始的）序号作为第二个参数。
 *
 * @param {boolean} inclusive When set to `true` the value that caused
 * `predicate` to return `false` will also be emitted.
 *
 * 当它为 `true` 时，也会同时发出那个令 `predicate` 返回 `false` 的值。
 *
 * @return A function that returns an Observable that emits values from the
 * source Observable so long as each value satisfies the condition defined by
 * the `predicate`, then completes.
 *
 * 一个返回 Observable 的函数，只要每个值都满足 `predicate` 定义的条件，它就会从源 Observable 发出值，然后完成。
 *
 */
export function takeWhile<T>(predicate: (value: T, index: number) => boolean, inclusive = false): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let index = 0;
    source.subscribe(
      createOperatorSubscriber(subscriber, (value) => {
        const result = predicate(value, index++);
        (result || inclusive) && subscriber.next(value);
        !result && subscriber.complete();
      })
    );
  });
}
