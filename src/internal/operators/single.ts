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
 * 返回一个 observable，它断言 observable 中只发送过一个满足此谓词的值。如果没有提供谓词，那么它将断言 observable 只发送过一个值。
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
 * 如果找到了两个满足此谓词的值，或者当发送了两个值而且没有谓词时，它将抛出 {@link SequenceError}
 *
 * In the event that no values match the predicate, if one is provided,
 * it will throw a {@link NotFoundError}
 *
 * 如果有谓词而且没有任何值满足此谓词，它将抛出一个 {@link NotFoundError}
 *
 * ## Example
 *
 * ## 例子
 *
 * Expect only `name` beginning with `'B'`
 *
 * 期望只有一个以 `'B'` 开头的 `name`
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
 * 如果 Observable 在发送任何 `next` 通知之前已完成，则会将 `NotFoundError` 传给 Observer 的 `error` 回调。
 *
 * @throws {SequenceError} Delivers a SequenceError if more than one value is emitted that matches the
 * provided predicate. If no predicate is provided, will deliver a SequenceError if more
 * than one value comes from the source
 *
 * 如果发送了多个满足所提供的谓词的值，则引发 SequenceError。如果没有提供谓词而且源发来了多个值，则将引发一个 SequenceError
 *
 * @param {Function} predicate - A predicate function to evaluate items emitted by the source Observable.
 *
 *   一个谓词函数，用来评估源 Observable 发来的条目。
 *
 * @return A function that returns an Observable that emits the single item
 * emitted by the source Observable that matches the predicate.
 *
 * 一个返回 Observable 的函数，该 Observable 会发送源 Observable 中满足此谓词的单个条目。
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
