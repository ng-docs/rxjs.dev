import { Observable } from '../Observable';
import { ObservableInputTuple, OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { innerFrom } from '../observable/innerFrom';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { OperatorSubscriber } from './OperatorSubscriber';
import { noop } from '../util/noop';

export function onErrorResumeNext<T, A extends readonly unknown[]>(
  sources: [...ObservableInputTuple<A>]
): OperatorFunction<T, T | A[number]>;
export function onErrorResumeNext<T, A extends readonly unknown[]>(
  ...sources: [...ObservableInputTuple<A>]
): OperatorFunction<T, T | A[number]>;

/**
 * When any of the provided Observable emits an complete or error notification, it immediately subscribes to the next one
 * that was passed.
 *
 * 当所提供的任何 Observable 发出了完成或错误通知时，它会立即订阅下一个传入的通知。
 *
 * <span class="informal">Execute series of Observables, subscribes to next one on error or complete.</span>
 *
 * <span class="informal">执行一系列 Observable，当出错或完成时订阅下一个。</span>
 *
 * ![](onErrorResumeNext.png)
 *
 * `onErrorResumeNext` is an operator that accepts a series of Observables, provided either directly as
 * arguments or as an array. If no single Observable is provided, returned Observable will simply behave the same
 * as the source.
 *
 * `onErrorResumeNext` 是一个接受一系列 Observable 的操作符，这些 Observable 可以直接作为参数提供，也可以作为数组提供。如果只提供了一个 Observable，则返回的 Observable 将与源的行为完全相同。
 *
 * `onErrorResumeNext` returns an Observable that starts by subscribing and re-emitting values from the source Observable.
 * When its stream of values ends - no matter if Observable completed or emitted an error - `onErrorResumeNext`
 * will subscribe to the first Observable that was passed as an argument to the method. It will start re-emitting
 * its values as well and - again - when that stream ends, `onErrorResumeNext` will proceed to subscribing yet another
 * Observable in provided series, no matter if previous Observable completed or ended with an error. This will
 * be happening until there is no more Observables left in the series, at which point returned Observable will
 * complete - even if the last subscribed stream ended with an error.
 *
 * `onErrorResumeNext` 会返回一个 Observable，它从订阅源 Observable 并再次发送其值开始。当它的值流结束时（无论 Observable 是否完成或出错）`onErrorResumeNext` 都将订阅作为参数传给该方法的第一个 Observable。它也将开始重新发送其值，并且当该流结束时，`onErrorResumeNext` 同样会继续订阅提供的系列 Observable 中的下一个，而不管之前的 Observable 是否完成或出错。以此类推，直到系列中没有更多的 Observable 了，结果 Observable 才会完成 —— 即使最后订阅的流是因为出错而结束的。
 *
 * `onErrorResumeNext` can be therefore thought of as version of {@link concat} operator, which is more permissive
 * when it comes to the errors emitted by its input Observables. While `concat` subscribes to the next Observable
 * in series only if previous one successfully completed, `onErrorResumeNext` subscribes even if it ended with
 * an error.
 *
 * 因此 `onErrorResumeNext` 可以被认为是 {@link concat} 操作符的兄弟版本，不过当其输入 Observables 发送了错误时，它会更加宽容。`concat` 仅在前一个 Observable 成功完成时才会订阅系列中的下一个 Observable，而 `onErrorResumeNext` 即使它因为出错而结束也会继续订阅。
 *
 * Note that you do not get any access to errors emitted by the Observables. In particular do not
 * expect these errors to appear in error callback passed to {@link Observable#subscribe}. If you want to take
 * specific actions based on what error was emitted by an Observable, you should try out {@link catchError} instead.
 *
 * 请注意，你无法访问这些 Observables 发送的错误。特别是不要期望这些错误出现在传给 {@link Observable#subscribe} 的错误回调中。如果你想根据 Observable 发送的错误采取特定的行动，你应该尝试用 {@link catchError} 来代替。
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
 * import { of, onErrorResumeNext, map } from 'rxjs';
 *
 * of(1, 2, 3, 0)
 *   .pipe(
 *     map(x => {
 *       if (x === 0) {
 *         throw Error();
 *       }
 *
 *       return 10 / x;
 *     }),
 *     onErrorResumeNext(of(1, 2, 3))
 *   )
 *   .subscribe({
 *     next: val => console.log(val),
 *     error: err => console.log(err),          // Will never be called.
 *     complete: () => console.log('that\'s it!')
 *   });
 *
 * // Logs:
 * // 10
 * // 5
 * // 3.3333333333333335
 * // 1
 * // 2
 * // 3
 * // 'that's it!'
 * ```
 * @see {@link concat}
 * @see {@link catchError}
 * @param {...ObservableInput} sources Observables passed either directly or as an array.
 *
 * 直接传入或作为数组传入的一些 Observables 。
 *
 * @return A function that returns an Observable that emits values from source
 * Observable, but - if it errors - subscribes to the next passed Observable
 * and so on, until it completes or runs out of Observables.
 *
 * 一个返回 Observable 的函数，该 Observable 会从源 Observable 中发送值，但即使源出错了，它也会订阅传入的下一个 Observable，以此类推，直到它完成或用完这些 Observables。
 *
 */
export function onErrorResumeNext<T, A extends readonly unknown[]>(
  ...sources: [[...ObservableInputTuple<A>]] | [...ObservableInputTuple<A>]
): OperatorFunction<T, T | A[number]> {
  // For some reason, TS 4.1 RC gets the inference wrong here and infers the
  // result to be `A[number][]` - completely dropping the ObservableInput part
  // of the type. This makes no sense whatsoever. As a workaround, the type is
  // asserted explicitly.
  const nextSources = argsOrArgArray(sources) as unknown as ObservableInputTuple<A>;

  return operate((source, subscriber) => {
    const remaining = [source, ...nextSources];
    const subscribeNext = () => {
      if (!subscriber.closed) {
        if (remaining.length > 0) {
          let nextSource: Observable<A[number]>;
          try {
            nextSource = innerFrom<T | A[number]>(remaining.shift()!);
          } catch (err) {
            subscribeNext();
            return;
          }

          // Here we have to use one of our Subscribers, or it does not wire up
          // The `closed` property of upstream Subscribers synchronously, that
          // would result in situation were we could not stop a synchronous firehose
          // with something like `take(3)`.
          const innerSub = new OperatorSubscriber(subscriber, undefined, noop, noop);
          subscriber.add(nextSource.subscribe(innerSub));
          innerSub.add(subscribeNext);
        } else {
          subscriber.complete();
        }
      }
    };

    subscribeNext();
  });
}
