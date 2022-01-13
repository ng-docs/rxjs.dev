import { Observable } from '../Observable';
import { EmptyError } from '../util/EmptyError';
import { OperatorFunction, TruthyTypesOf } from '../types';
import { filter } from './filter';
import { takeLast } from './takeLast';
import { throwIfEmpty } from './throwIfEmpty';
import { defaultIfEmpty } from './defaultIfEmpty';
import { identity } from '../util/identity';

export function last<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export function last<T, D>(predicate: BooleanConstructor, defaultValue: D): OperatorFunction<T, TruthyTypesOf<T> | D>;
export function last<T, D = T>(predicate?: null, defaultValue?: D): OperatorFunction<T, T | D>;
export function last<T, S extends T>(
  predicate: (value: T, index: number, source: Observable<T>) => value is S,
  defaultValue?: S
): OperatorFunction<T, S>;
export function last<T, D = T>(
  predicate: (value: T, index: number, source: Observable<T>) => boolean,
  defaultValue?: D
): OperatorFunction<T, T | D>;

/**
 * Returns an Observable that emits only the last item emitted by the source Observable.
 * It optionally takes a predicate function as a parameter, in which case, rather than emitting
 * the last item from the source Observable, the resulting Observable will emit the last item
 * from the source Observable that satisfies the predicate.
 *
 * 返回一个 Observable，它只发送源 Observable 发送的最后一项。它可以接受一个谓词函数作为可选参数，在这种情况下，不是从源 Observable 发送最后一项，而发送源 Observable 发来的满足此谓词的最后一项。
 *
 * ![](last.png)
 *
 * It will throw an error if the source completes without notification or one that matches the predicate. It
 * returns the last value or if a predicate is provided last value that matches the predicate. It returns the
 * given default value if no notification is emitted or matches the predicate.
 *
 * 如果源在没有发出值或没有任何谓词匹配的情况下就完成了，它将引发错误。它会返回最后一个值，或者如果提供了一个谓词，则返回与此谓词匹配的最后一个值。如果没有发出值或没有与谓词匹配，它将返回给定的默认值。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Last alphabet from the sequence
 *
 * 序列中的最后一个字母
 *
 * ```ts
 * import { from, last } from 'rxjs';
 *
 * const source = from(['x', 'y', 'z']);
 * const result = source.pipe(last());
 *
 * result.subscribe(value => console.log(`Last alphabet: ${ value }`));
 *
 * // Outputs
 * // Last alphabet: z
 * ```
 *
 * Default value when the value in the predicate is not matched
 *
 * 谓词中的值不匹配时的默认值
 *
 * ```ts
 * import { from, last } from 'rxjs';
 *
 * const source = from(['x', 'y', 'z']);
 * const result = source.pipe(last(char => char === 'a', 'not found'));
 *
 * result.subscribe(value => console.log(`'a' is ${ value }.`));
 *
 * // Outputs
 * // 'a' is not found.
 * ```
 * @see {@link skip}
 * @see {@link skipUntil}
 * @see {@link skipLast}
 * @see {@link skipWhile}
 * @throws {EmptyError} Delivers an EmptyError to the Observer's `error`
 * callback if the Observable completes before any `next` notification was sent.
 *
 * 如果此 Observable 在发送任何 `next` 通知之前就已完成，则会将 EmptyError 传递给 Observer 的 `error` 回调。
 *
 * @param {function} [predicate] - The condition any source emitted item has to satisfy.
 * @param {any} [defaultValue] - An optional default value to provide if last
 * predicate isn't met or no values were emitted.
 * @return A function that returns an Observable that emits only the last item
 * satisfying the given condition from the source, or a NoSuchElementException
 * if no such items are emitted.
 *
 * 一个返回 Observable 的函数，该 Observable 只会从源发送满足给定条件的最后一项，如果没有发送此类项，则返回 NoSuchElementException。
 *
 * @throws - Throws if no items that match the predicate are emitted by the source Observable.
 *
 *   如果源 Observable 没有发送过与此谓词匹配的条目，则会抛出错误。
 *
 */
export function last<T, D>(
  predicate?: ((value: T, index: number, source: Observable<T>) => boolean) | null,
  defaultValue?: D
): OperatorFunction<T, T | D> {
  const hasDefaultValue = arguments.length >= 2;
  return (source: Observable<T>) =>
    source.pipe(
      predicate ? filter((v, i) => predicate(v, i, source)) : identity,
      takeLast(1),
      hasDefaultValue ? defaultIfEmpty(defaultValue!) : throwIfEmpty(() => new EmptyError())
    );
}
