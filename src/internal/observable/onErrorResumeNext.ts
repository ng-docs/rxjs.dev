import { Observable } from '../Observable';
import { ObservableInputTuple } from '../types';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { OperatorSubscriber } from '../operators/OperatorSubscriber';
import { noop } from '../util/noop';
import { innerFrom } from './innerFrom';

/* tslint:disable:max-line-length */
export function onErrorResumeNext<A extends readonly unknown[]>(sources: [...ObservableInputTuple<A>]): Observable<A[number]>;
export function onErrorResumeNext<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A[number]>;

/* tslint:enable:max-line-length */

/**
 * When any of the provided Observable emits a complete or an error notification, it immediately subscribes to the next one
 * that was passed.
 *
 * 当任何提供的 Observable 发送完成或错误通知时，它会立即订阅下一个传入的 Observable。
 *
 * <span class="informal">Execute series of Observables no matter what, even if it means swallowing errors.</span>
 *
 * <span class="informal">无论如何都要执行这一系列 Observables，即使这意味着掩盖错误。</span>
 *
 * ![](onErrorResumeNext.png)
 *
 * `onErrorResumeNext` will subscribe to each observable source it is provided, in order.
 * If the source it's subscribed to emits an error or completes, it will move to the next source
 * without error.
 *
 * `onErrorResumeNext` 将按顺序订阅它提供的每个可观察源。如果它订阅的源出错或完成，它将移动到下一个源而不会发出错误。
 *
 * If `onErrorResumeNext` is provided no arguments, or a single, empty array, it will return {@link EMPTY}.
 *
 * 如果 `onErrorResumeNext` 没有提供任何参数，或者提供了一个空数组，它将返回 {@link EMPTY}。
 *
 * `onErrorResumeNext` is basically {@link concat}, only it will continue, even if one of its
 * sources emits an error.
 *
 * `onErrorResumeNext` 基本相当于 {@link concat}，但即使它的一个源发生了错误，它也会继续。
 *
 * Note that there is no way to handle any errors thrown by sources via the result of
 * `onErrorResumeNext`. If you want to handle errors thrown in any given source, you can
 * always use the {@link catchError} operator on them before passing them into `onErrorResumeNext`.
 *
 * 请注意，无法通过 `onErrorResumeNext` 的结果处理来源中抛出的任何错误。如果你想处理任何给定来源中抛出的错误，你可以在将它们传给 `onErrorResumeNext` 之前总是对其先使用 {@link catchError} 操作符。
 *
 * ## Example
 *
 * ## 例子
 *
 * Subscribe to the next Observable after map fails
 *
 * map 失败后订阅下一个 Observable
 *
 * ```ts
 * import { onErrorResumeNext, of, map } from 'rxjs';
 *
 * onErrorResumeNext(
 *   of(1, 2, 3, 0).pipe(
 *     map(x => {
 *       if (x === 0) {
 *         throw Error();
 *       }
 *       return 10 / x;
 *     })
 *   ),
 *   of(1, 2, 3)
 * )
 * .subscribe({
 *   next: value => console.log(value),
 *   error: err => console.log(err),     // Will never be called.
 *   complete: () => console.log('done')
 * });
 *
 * // Logs:
 * // 10
 * // 5
 * // 3.3333333333333335
 * // 1
 * // 2
 * // 3
 * // 'done'
 * ```
 * @see {@link concat}
 * @see {@link catchError}
 * @param {...ObservableInput} sources Observables (or anything that *is* observable) passed either directly or as an array.
 *
 * 直接或作为数组传入的 Observables（或任何* Observable*类似物）。
 *
 * @return {Observable} An Observable that concatenates all sources, one after the other,
 * ignoring all errors, such that any error causes it to move on to the next source.
 *
 * 一个 Observable。它会一个接一个地连接所有来源，忽略所有错误，任何错误都会导致它移动到下一个来源。
 *
 */
export function onErrorResumeNext<A extends readonly unknown[]>(
  ...sources: [[...ObservableInputTuple<A>]] | [...ObservableInputTuple<A>]
): Observable<A[number]> {
  const nextSources: ObservableInputTuple<A> = argsOrArgArray(sources) as any;

  return new Observable((subscriber) => {
    let sourceIndex = 0;
    const subscribeNext = () => {
      if (sourceIndex < nextSources.length) {
        let nextSource: Observable<A[number]>;
        try {
          nextSource = innerFrom(nextSources[sourceIndex++]);
        } catch (err) {
          subscribeNext();
          return;
        }
        const innerSubscriber = new OperatorSubscriber(subscriber, undefined, noop, noop);
        nextSource.subscribe(innerSubscriber);
        innerSubscriber.add(subscribeNext);
      } else {
        subscriber.complete();
      }
    };
    subscribeNext();
  });
}
