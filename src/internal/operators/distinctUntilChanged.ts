import { MonoTypeOperatorFunction } from '../types';
import { identity } from '../util/identity';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Returns a result {@link Observable} that emits all values pushed by the source observable if they
 * are distinct in comparison to the last value the result observable emitted.
 *
 * 返回一个结果 {@link Observable}，如果它们与结果 observable 发出的最后一个值相比不同，则发出源 observable 推送的所有值。
 *
 * 1. It will always emit the first value from the source.
 *
 *    它将始终从源发出第一个值。
 *
 * 2. For all subsequent values pushed by the source, they will be compared to the previously emitted values
 *    using the provided `comparator` or an `===` equality check.
 *
 *    对于源推送的所有后续值，将使用提供的 `comparator` 或 `===` 相等检查将它们与先前发出的值进行比较。
 *
 * 3. If the value pushed by the source is determined to be unequal by this check, that value is emitted and
 *    becomes the new "previously emitted value" internally.
 *
 *    如果此检查确定源推送的值不相等，则发出该值并在内部成为新的“先前发出的值”。
 *
 * ## Examples
 *
 * ## 例子
 *
 * A very basic example with no `comparator`. Note that `1` is emitted more than once,
 * because it's distinct in comparison to the _previously emitted_ value,
 * not in comparison to _all other emitted values_.
 *
 * 一个没有 `comparator` 的非常基本的示例。请注意，`1` 被多次发出，因为它与 _ 先前发出 _ 的值相比是不同的，而不是与 _ 所有其他发出的值 _ 相比。
 *
 * ```ts
 * import { of, distinctUntilChanged } from 'rxjs';
 *
 * of(1, 1, 1, 2, 2, 2, 1, 1, 3, 3)
 *   .pipe(distinctUntilChanged())
 *   .subscribe(console.log);
 * // Logs: 1, 2, 1, 3
 * ```
 *
 * With a `comparator`, you can do custom comparisons. Let's say
 * you only want to emit a value when all of its components have
 * changed:
 *
 * 使用 `comparator`，你可以进行自定义比较。假设你只想在其所有组件都更改时发出一个值：
 *
 * ```ts
 * import { of, distinctUntilChanged } from 'rxjs';
 *
 * const totallyDifferentBuilds$ = of(
 *   { engineVersion: '1.1.0', transmissionVersion: '1.2.0' },
 *   { engineVersion: '1.1.0', transmissionVersion: '1.4.0' },
 *   { engineVersion: '1.3.0', transmissionVersion: '1.4.0' },
 *   { engineVersion: '1.3.0', transmissionVersion: '1.5.0' },
 *   { engineVersion: '2.0.0', transmissionVersion: '1.5.0' }
 * ).pipe(
 *   distinctUntilChanged((prev, curr) => {
 *     return (
 *       prev.engineVersion === curr.engineVersion ||
 *       prev.transmissionVersion === curr.transmissionVersion
 *     );
 *   })
 * );
 *
 * totallyDifferentBuilds$.subscribe(console.log);
 *
 * // Logs:
 * // { engineVersion: '1.1.0', transmissionVersion: '1.2.0' }
 * // { engineVersion: '1.3.0', transmissionVersion: '1.4.0' }
 * // { engineVersion: '2.0.0', transmissionVersion: '1.5.0' }
 * ```
 *
 * You can also provide a custom `comparator` to check that emitted
 * changes are only in one direction. Let's say you only want to get
 * the next record temperature:
 *
 * 你还可以提供自定义 `comparator` 来检查发出的更改是否仅在一个方向上。假设你只想获得下一个记录温度：
 *
 * ```ts
 * import { of, distinctUntilChanged } from 'rxjs';
 *
 * const temps$ = of(30, 31, 20, 34, 33, 29, 35, 20);
 *
 * const recordHighs$ = temps$.pipe(
 *   distinctUntilChanged((prevHigh, temp) => {
 *     // If the current temp is less than
 *     // or the same as the previous record,
 *     // the record hasn't changed.
 *     return temp <= prevHigh;
 *   })
 * );
 *
 * recordHighs$.subscribe(console.log);
 * // Logs: 30, 31, 34, 35
 * ```
 * @param comparator A function used to compare the previous and current values for
 * equality. Defaults to a `===` check.
 *
 * 用于比较先前值和当前值是否相等的函数。默认为 `===` 检查。
 *
 * @return A function that returns an Observable that emits items from the
 * source Observable with distinct values.
 *
 * 一个返回 Observable 的函数，该 Observable 从源 Observable 发出具有不同值的项目。
 *
 */
export function distinctUntilChanged<T>(comparator?: (previous: T, current: T) => boolean): MonoTypeOperatorFunction<T>;

/**
 * Returns a result {@link Observable} that emits all values pushed by the source observable if they
 * are distinct in comparison to the last value the result observable emitted.
 *
 * 返回一个结果 {@link Observable}，如果它们与结果 observable 发出的最后一个值相比不同，则发出源 observable 推送的所有值。
 *
 * 1. It will always emit the first value from the source.
 *
 *    它将始终从源发出第一个值。
 *
 * 2. The `keySelector` will be run against all values, including the first value.
 *
 *    `keySelector` 将针对所有值运行，包括第一个值。
 *
 * 3. For all values after the first, the selected key will be compared against the key selected from
 *    the previously emitted value using the `comparator`.
 *
 *    对于第一个之后的所有值，将使用比较器将所选键与从先前发出的值中选择的键进行 `comparator`。
 *
 * 4. If the keys are determined to be unequal by this check, the value (not the key), is emitted
 *    and the selected key from that value is saved for future comparisons against other keys.
 *
 *    如果通过此检查确定键不相等，则发出值（不是键），并保存从该值中选择的键，以供将来与其他键进行比较。
 *
 * ## Example
 *
 * ## 例子
 *
 * Selecting update events only when the `updatedBy` field shows
 * the account changed hands...
 *
 * 仅当 `updatedBy` 字段显示帐户易手时才选择更新事件...
 *
 * ```ts
 * import { of, distinctUntilChanged } from 'rxjs';
 *
 * // A stream of updates to a given account
 * const accountUpdates$ = of(
 *   { updatedBy: 'blesh', data: [] },
 *   { updatedBy: 'blesh', data: [] },
 *   { updatedBy: 'ncjamieson', data: [] },
 *   { updatedBy: 'ncjamieson', data: [] },
 *   { updatedBy: 'blesh', data: [] }
 * );
 *
 * // We only want the events where it changed hands
 * const changedHands$ = accountUpdates$.pipe(
 *   distinctUntilChanged(undefined, update => update.updatedBy)
 * );
 *
 * changedHands$.subscribe(console.log);
 * // Logs:
 * // { updatedBy: 'blesh', data: Array[0] }
 * // { updatedBy: 'ncjamieson', data: Array[0] }
 * // { updatedBy: 'blesh', data: Array[0] }
 * ```
 * @param comparator A function used to compare the previous and current keys for
 * equality. Defaults to a `===` check.
 *
 * 用于比较前一个键和当前键是否相等的函数。默认为 `===` 检查。
 *
 * @param keySelector Used to select a key value to be passed to the `comparator`.
 *
 * 用于选择要传递给 `comparator` 的键值。
 *
 * @return A function that returns an Observable that emits items from the
 * source Observable with distinct values.
 *
 * 一个返回 Observable 的函数，该 Observable 从源 Observable 发出具有不同值的项目。
 *
 */
export function distinctUntilChanged<T, K>(
  comparator: (previous: K, current: K) => boolean,
  keySelector: (value: T) => K
): MonoTypeOperatorFunction<T>;

export function distinctUntilChanged<T, K>(
  comparator?: (previous: K, current: K) => boolean,
  keySelector: (value: T) => K = identity as (value: T) => K
): MonoTypeOperatorFunction<T> {
  // We've been allowing `null` do be passed as the `compare`, so we can't do
  // a default value for the parameter, because that will only work
  // for `undefined`.
  comparator = comparator ?? defaultCompare;

  return operate((source, subscriber) => {
    // The previous key, used to compare against keys selected
    // from new arrivals to determine "distinctiveness".
    let previousKey: K;
    // Whether or not this is the first value we've gotten.
    let first = true;

    source.subscribe(
      new OperatorSubscriber(subscriber, (value) => {
        // We always call the key selector.
        const currentKey = keySelector(value);

        // If it's the first value, we always emit it.
        // Otherwise, we compare this key to the previous key, and
        // if the comparer returns false, we emit.
        if (first || !comparator!(previousKey, currentKey)) {
          // Update our state *before* we emit the value
          // as emission can be the source of re-entrant code
          // in functional libraries like this. We only really
          // need to do this if it's the first value, or if the
          // key we're tracking in previous needs to change.
          first = false;
          previousKey = currentKey;

          // Emit the value!
          subscriber.next(value);
        }
      })
    );
  });
}

function defaultCompare(a: any, b: any) {
  return a === b;
}
