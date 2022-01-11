import { EmptyError } from '../util/EmptyError';
import { MonoTypeOperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * If the source observable completes without emitting a value, it will emit
 * an error. The error will be created at that time by the optional
 * `errorFactory` argument, otherwise, the error will be {@link EmptyError}.
 *
 * 如果源 observable 完成但没有发出值，它将发出错误。错误将由可选的 `errorFactory` 参数在那时创建，否则，错误将是 {@link EmptyError}。
 *
 * ![](throwIfEmpty.png)
 *
 * ## Example
 *
 * ## 例子
 *
 * Throw an error if the document wasn't clicked within 1 second
 *
 * 如果文档在 1 秒内没有被点击，则抛出错误
 *
 * ```ts
 * import { fromEvent, takeUntil, timer, throwIfEmpty } from 'rxjs';
 *
 * const click$ = fromEvent(document, 'click');
 *
 * click$.pipe(
 *   takeUntil(timer(1000)),
 *   throwIfEmpty(() => new Error('The document was not clicked within 1 second'))
 * )
 * .subscribe({
 *   next() {
 *    console.log('The document was clicked');
 *   },
 *   error(err) {
 *     console.error(err.message);
 *   }
 * });
 * ```
 * @param errorFactory A factory function called to produce the
 * error to be thrown when the source observable completes without emitting a
 * value.
 *
 * 当源 observable 完成但未发出值时，调用工厂函数以产生要抛出的错误。
 *
 * @return A function that returns an Observable that throws an error if the
 * source Observable completed without emitting.
 *
 * 一个返回 Observable 的函数，如果源 Observable 完成但未发射，则会引发错误。
 *
 */
export function throwIfEmpty<T>(errorFactory: () => any = defaultErrorFactory): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let hasValue = false;
    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value) => {
          hasValue = true;
          subscriber.next(value);
        },
        () => (hasValue ? subscriber.complete() : subscriber.error(errorFactory()))
      )
    );
  });
}

function defaultErrorFactory() {
  return new EmptyError();
}
