import { Observable } from '../Observable';
import { Falsy, OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

export function every<T>(predicate: BooleanConstructor): OperatorFunction<T, Exclude<T, Falsy> extends never ? false : boolean>;
/**
 * @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.
 *
 * 使用闭包而不是 `thisArg` 。接受 `thisArg` 的签名将在 v8 中被删除。
 *
 */
export function every<T>(
  predicate: BooleanConstructor,
  thisArg: any
): OperatorFunction<T, Exclude<T, Falsy> extends never ? false : boolean>;
/**
 * @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.
 *
 * 使用闭包而不是 `thisArg` 。接受 `thisArg` 的签名将在 v8 中被删除。
 *
 */
export function every<T, A>(
  predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean,
  thisArg: A
): OperatorFunction<T, boolean>;
export function every<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, boolean>;

/**
 * Returns an Observable that emits whether or not every item of the source satisfies the condition specified.
 *
 * 返回一个 Observable，它发出源中的每个项目是否满足指定的条件。
 *
 * <span class="informal">If all values pass predicate before the source completes, emits true before completion,
 * otherwise emit false, then complete.</span>
 *
 * <span class="informal">如果所有值在源完成之前通过谓词，则在完成之前发出 true，否则发出 false，然后完成。</span>
 *
 * ![](every.png)
 *
 * ## Example
 *
 * ## 例子
 *
 * A simple example emitting true if all elements are less than 5, false otherwise
 *
 * 一个简单的例子，如果所有元素都小于 5，则返回 true，否则返回 false
 *
 * ```ts
 * import { of, every } from 'rxjs';
 *
 * of(1, 2, 3, 4, 5, 6)
 *   .pipe(every(x => x < 5))
 *   .subscribe(x => console.log(x)); // -> false
 * ```
 * @param {function} predicate A function for determining if an item meets a specified condition.
 *
 * 用于确定项目是否满足指定条件的函数。
 *
 * @param {any} [thisArg] Optional object to use for `this` in the callback.
 * @return A function that returns an Observable of booleans that determines if
 * all items of the source Observable meet the condition specified.
 *
 * 一个返回布尔值的 Observable 的函数，用于确定源 Observable 的所有项目是否满足指定的条件。
 *
 */
export function every<T>(
  predicate: (value: T, index: number, source: Observable<T>) => boolean,
  thisArg?: any
): OperatorFunction<T, boolean> {
  return operate((source, subscriber) => {
    let index = 0;
    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value) => {
          if (!predicate.call(thisArg, value, index++, source)) {
            subscriber.next(false);
            subscriber.complete();
          }
        },
        () => {
          subscriber.next(true);
          subscriber.complete();
        }
      )
    );
  });
}
