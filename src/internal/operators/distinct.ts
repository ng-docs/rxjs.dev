import { Observable } from '../Observable';
import { MonoTypeOperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { noop } from '../util/noop';

/**
 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from previous items.
 *
 * 返回一个 Observable，它发出源 Observable 发出的所有项，这些项与以前的项相比是不同的。
 *
 * If a `keySelector` function is provided, then it will project each value from the source observable into a new value that it will
 * check for equality with previously projected values. If the `keySelector` function is not provided, it will use each value from the
 * source observable directly with an equality check against previous values.
 *
 * 如果提供了 `keySelector` 函数，那么它会将源 observable 中的每个值投影到一个新值中，它将检查与先前投影值是否相等。如果没有提供 `keySelector` 函数，它将直接使用源 observable 中的每个值，并与之前的值进行相等性检查。
 *
 * In JavaScript runtimes that support `Set`, this operator will use a `Set` to improve performance of the distinct value checking.
 *
 * 在支持 `Set` 的 JavaScript 运行时中，此操作符将使用 `Set` 来提高不同值检查的性能。
 *
 * In other runtimes, this operator will use a minimal implementation of `Set` that relies on an `Array` and `indexOf` under the
 * hood, so performance will degrade as more values are checked for distinction. Even in newer browsers, a long-running `distinct`
 * use might result in memory leaks. To help alleviate this in some scenarios, an optional `flushes` parameter is also provided so
 * that the internal `Set` can be "flushed", basically clearing it of values.
 *
 * 在其他运行时，此操作符将使用 `Set` 的最小实现，该实现依赖于 `Array` 和 `indexOf` 在引擎盖下，因此性能会随着检查更多值的区别而降低。即使在较新的浏览器中，长时间运行 `distinct` 用途也可能导致内存泄漏。为了在某些情况下帮助缓解这种情况，还提供了一个可选的 `flushes` 参数，以便可以“刷新”内部 `Set`，基本上清除它的值。
 *
 * ## Examples
 *
 * ## 例子
 *
 * A simple example with numbers
 *
 * 一个简单的数字示例
 *
 * ```ts
 * import { of, distinct } from 'rxjs';
 *
 * of(1, 1, 2, 2, 2, 1, 2, 3, 4, 3, 2, 1)
 *   .pipe(distinct())
 *   .subscribe(x => console.log(x));
 *
 * // Outputs
 * // 1
 * // 2
 * // 3
 * // 4
 * ```
 *
 * An example using the `keySelector` function
 *
 * 使用 `keySelector` 函数的示例
 *
 * ```ts
 * import { of, distinct } from 'rxjs';
 *
 * of(
 *   { age: 4, name: 'Foo'},
 *   { age: 7, name: 'Bar'},
 *   { age: 5, name: 'Foo'}
 * )
 * .pipe(distinct(({ name }) => name))
 * .subscribe(x => console.log(x));
 *
 * // Outputs
 * // { age: 4, name: 'Foo' }
 * // { age: 7, name: 'Bar' }
 * ```
 * @see {@link distinctUntilChanged}
 * @see {@link distinctUntilKeyChanged}
 * @param {function} [keySelector] Optional function to select which value you want to check as distinct.
 * @param {Observable} [flushes] Optional Observable for flushing the internal HashSet of the operator.
 * @return A function that returns an Observable that emits items from the
 * source Observable with distinct values.
 *
 * 一个返回 Observable 的函数，该 Observable 从源 Observable 发出具有不同值的项目。
 *
 */
export function distinct<T, K>(keySelector?: (value: T) => K, flushes?: Observable<any>): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    const distinctKeys = new Set();
    source.subscribe(
      new OperatorSubscriber(subscriber, (value) => {
        const key = keySelector ? keySelector(value) : value;
        if (!distinctKeys.has(key)) {
          distinctKeys.add(key);
          subscriber.next(value);
        }
      })
    );

    flushes?.subscribe(new OperatorSubscriber(subscriber, () => distinctKeys.clear(), noop));
  });
}
