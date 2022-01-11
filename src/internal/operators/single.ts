import { Observable } from '../Observable';
import { EmptyError } from '../util/EmptyError';

import { MonoTypeOperatorFunction, OperatorFunction, TruthyTypesOf } from '../types';
import { SequenceError } from '../util/SequenceError';
import { NotFoundError } from '../util/NotFoundError';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

export function single<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export function single<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean): MonoTypeOperatorFunction<T>;

/**
 * Returns an observable that asserts that only one value is
 * emitted from the observable that matches the predicate. If no
 * predicate is provided, then it will assert that the observable
 * only emits one value.
 *
 * 返回一个 observable，它断言只有一个与谓词匹配的 observable 发出一个值。如果没有提供谓词，那么它将断言 observable 只发出一个值。
 *
 * In the event that the observable is empty, it will throw an
 * {@link EmptyError}.
 *
 * 如果 observable 为空，它将抛出 {@link EmptyError}。
 *
 * In the event that two values are found that match the predicate,
 * or when there are two values emitted and no predicate, it will
 * throw a {@link SequenceError}
 *
 * 如果找到与谓词匹配的两个值，或者当发出两个值但没有谓词时，它将抛出 {@link SequenceError}
 *
 * In the event that no values match the predicate, if one is provided,
 * it will throw a {@link NotFoundError}
 *
 * 如果没有值与谓词匹配，如果提供了一个，它将抛出一个 {@link NotFoundError}
 *
 * ## Example
 *
 * ## 例子
 *
 * Expect only `name` beginning with `'B'`
 *
 * 仅期望以 `'B'` 开头的 `name`
 *
 * ```ts
 * import { of, single } from 'rxjs';
 *
 * const source1 = of(
 *  { name: 'Ben' },
 *  { name: 'Tracy' },
 *  { name: 'Laney' },
 *  { name: 'Lily' }
 * );
 *
 * source1
 *   .pipe(single(x => x.name.startsWith('B')))
 *   .subscribe(x => console.log(x));
 * // Emits 'Ben'
 *
 * const source2 = of(
 *  { name: 'Ben' },
 *  { name: 'Tracy' },
 *  { name: 'Bradley' },
 *  { name: 'Lincoln' }
 * );
 *
 * source2
 *   .pipe(single(x => x.name.startsWith('B')))
 *   .subscribe({ error: err => console.error(err) });
 * // Error emitted: SequenceError('Too many values match')
 *
 * const source3 = of(
 *  { name: 'Laney' },
 *  { name: 'Tracy' },
 *  { name: 'Lily' },
 *  { name: 'Lincoln' }
 * );
 *
 * source3
 *   .pipe(single(x => x.name.startsWith('B')))
 *   .subscribe({ error: err => console.error(err) });
 * // Error emitted: NotFoundError('No values match')
 * ```
 * @see {@link first}
 * @see {@link find}
 * @see {@link findIndex}
 * @see {@link elementAt}
 * @throws {NotFoundError} Delivers an NotFoundError to the Observer's `error`
 * callback if the Observable completes before any `next` notification was sent.
 *
 * 如果 Observable 在发送任何 `next` 通知之前完成，则将 NotFoundError 传递给 Observer 的 `error` 回调。
 *
 * @throws {SequenceError} Delivers a SequenceError if more than one value is emitted that matches the
 * provided predicate. If no predicate is provided, will deliver a SequenceError if more
 * than one value comes from the source
 *
 * 如果发出多个与提供的谓词匹配的值，则提供 SequenceError。如果没有提供谓词，如果多个值来自源，将传递一个 SequenceError
 *
 * @param {Function} predicate - A predicate function to evaluate items emitted by the source Observable.
 *
 *   一个谓词函数，用于评估源 Observable 发出的项目。
 *
 * @return A function that returns an Observable that emits the single item
 * emitted by the source Observable that matches the predicate.
 *
 * 一个返回 Observable 的函数，该 Observable 发出与谓词匹配的源 Observable 发出的单个项目。
 *
 */
export function single<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let hasValue = false;
    let singleValue: T;
    let seenValue = false;
    let index = 0;
    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value) => {
          seenValue = true;
          if (!predicate || predicate(value, index++, source)) {
            hasValue && subscriber.error(new SequenceError('Too many matching values'));
            hasValue = true;
            singleValue = value;
          }
        },
        () => {
          if (hasValue) {
            subscriber.next(singleValue);
            subscriber.complete();
          } else {
            subscriber.error(seenValue ? new NotFoundError('No matching values') : new EmptyError());
          }
        }
      )
    );
  });
}
