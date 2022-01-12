import { MonoTypeOperatorFunction, Observer } from '../types';
import { isFunction } from '../util/isFunction';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { identity } from '../util/identity';

export interface TapObserver<T> extends Observer<T> {
  subscribe: () => void;
  unsubscribe: () => void;
  finalize: () => void;
}

export function tap<T>(observer?: Partial<TapObserver<T>>): MonoTypeOperatorFunction<T>;
export function tap<T>(next: (value: T) => void): MonoTypeOperatorFunction<T>;
/**
 * @deprecated Instead of passing separate callback arguments, use an observer argument. Signatures taking separate callback arguments will be removed in v8. Details: <https://rxjs.dev/deprecations/subscribe-arguments>
 *
 * 不要传递单独的回调参数，而是使用观察者参数。带有单独回调参数的签名将在 v8 中被删除。详细信息： <https://rxjs.dev/deprecations/subscribe-arguments>
 *
 */
export function tap<T>(
  next?: ((value: T) => void) | null,
  error?: ((error: any) => void) | null,
  complete?: (() => void) | null
): MonoTypeOperatorFunction<T>;

/**
 * Used to perform side-effects for notifications from the source observable
 *
 * 用于对来自源 observable 的通知执行副作用
 *
 * <span class="informal">Used when you want to affect outside state with a notification without altering the notification</span>
*
 * <span class="informal">当你想通过通知影响外部状态而不更改通知时使用</span>
 *
 * ![](tap.png)
 *
 * Tap is designed to allow the developer a designated place to perform side effects. While you _could_ perform side-effects
 * inside of a `map` or a `mergeMap`, that would make their mapping functions impure, which isn't always a big deal, but will
 * make it so you can't do things like memoize those functions. The `tap` operator is designed solely for such side-effects to
 * help you remove side-effects from other operations.
 *
 * Tap 旨在让开发者在指定的地方执行副作用。虽然你 _ 可以 _ 在 `map` 或 `mergeMap` 内部执行副作用，但这会使它们的映射函数不纯，这并不总是什么大不了的，但会使你无法执行诸如 memoize 这些函数之类的事情。 `tap` 运算符专为此类副作用而设计，以帮助你消除其他操作的副作用。
 *
 * For any notification, next, error, or complete, `tap` will call the appropriate callback you have provided to it, via a function
 * reference, or a partial observer, then pass that notification down the stream.
 *
 * 对于任何通知、下一个、错误或完成， `tap` 将通过函数引用或部分观察者调用你提供给它的适当回调，然后将该通知传递到流中。
 *
 * The observable returned by `tap` is an exact mirror of the source, with one exception: Any error that occurs -- synchronously -- in a handler
 * provided to `tap` will be emitted as an error from the returned observable.
 *
 * `tap` 返回的 observable 是源的精确镜像，但有一个例外：在提供给 `tap` 的处理程序中同步发生的任何错误都将作为返回的 observable 的错误发出。
 *
 * > Be careful! You can mutate objects as they pass through the `tap` operator's handlers.
 * >
 * > 当心！你可以在对象通过 `tap` 运算符的处理程序时对其进行变异。
 * >
 *
 * The most common use of `tap` is actually for debugging. You can place a `tap(console.log)` anywhere
 * in your observable `pipe`, log out the notifications as they are emitted by the source returned by the previous
 * operation.
 *
 * `tap` 最常见的用途实际上是用于调试。你可以在可观察 `pipe` 中的任何位置放置一个 `tap(console.log)` ，注销通知，因为它们是由先前操作返回的源发出的。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Check a random number before it is handled. Below is an observable that will use a random number between 0 and 1,
 * and emit `'big'` or `'small'` depending on the size of that number. But we wanted to log what the original number
 * was, so we have added a `tap(console.log)`.
 *
 * 在处理之前检查一个随机数。下面是一个 observable，它将使用 0 到 1 之间的随机数，并根据该数字的大小发出 `'big'` 或 `'small'` 。但是我们想记录原始数字是多少，所以我们添加了一个 `tap(console.log)` 。
 *
 * ```ts
 * import { of, tap, map } from 'rxjs';
 *
 * of(Math.random()).pipe(
 *   tap(console.log),
 *   map(n => n > 0.5 ? 'big' : 'small')
 * ).subscribe(console.log);
 * ```
 *
 * Using `tap` to analyze a value and force an error. Below is an observable where in our system we only
 * want to emit numbers 3 or less we get from another source. We can force our observable to error
 * using `tap`.
 *
 * 使用 `tap` 分析值并强制出错。下面是一个 observable，在我们的系统中，我们只想发出从另一个来源获得的 3 或更少的数字。我们可以使用 `tap` 强制我们的 observable 出错。
 *
 * ```ts
 * import { of, tap } from 'rxjs';
 *
 * const source = of(1, 2, 3, 4, 5);
 *
 * source.pipe(
 *   tap(n => {
 *     if (n > 3) {
 *       throw new TypeError(`Value ${ n } is greater than 3`);
 *     }
 *   })
 * )
 * .subscribe({ next: console.log, error: err => console.log(err.message) });
 * ```
 *
 * We want to know when an observable completes before moving on to the next observable. The system
 * below will emit a random series of `'X'` characters from 3 different observables in sequence. The
 * only way we know when one observable completes and moves to the next one, in this case, is because
 * we have added a `tap` with the side effect of logging to console.
 *
 * 我们想知道一个 observable 何时完成，然后再继续下一个 observable。下面的系统将从 3 个不同的 observables 中依次发出一系列随机的 `'X'` 字符。在这种情况下，我们知道一个 observable 何时完成并移动到下一个的唯一方法是因为我们添加了一个带有日志记录到控制台的副作用的 `tap` 。
 *
 * ```ts
 * import { of, concatMap, interval, take, map, tap } from 'rxjs';
 *
 * of(1, 2, 3).pipe(
 *   concatMap(n => interval(1000).pipe(
 *     take(Math.round(Math.random() * 10)),
 *     map(() => 'X'),
 *     tap({ complete: () => console.log(`Done with ${ n }`) })
 *   ))
 * )
 * .subscribe(console.log);
 * ```
 * @see {@link finalize}
 * @see {@link Observable#subscribe}
 * @param observerOrNext A next handler or partial observer
 *
 * 下一个处理程序或部分观察者
 *
 * @param error An error handler
 *
 * 错误处理程序
 *
 * @param complete A completion handler
 *
 * 完成处理程序
 *
 * @return A function that returns an Observable identical to the source, but
 * runs the specified Observer or callback(s) for each item.
 *
 * 返回与源相同的 Observable 的函数，但为每个项目运行指定的 Observer 或回调。
 *
 */
export function tap<T>(
  observerOrNext?: Partial<TapObserver<T>> | ((value: T) => void) | null,
  error?: ((e: any) => void) | null,
  complete?: (() => void) | null
): MonoTypeOperatorFunction<T> {
  // We have to check to see not only if next is a function,
  // but if error or complete were passed. This is because someone
  // could technically call tap like `tap(null, fn)` or `tap(null, null, fn)`.
  const tapObserver =
    isFunction(observerOrNext) || error || complete
      ? // tslint:disable-next-line: no-object-literal-type-assertion
        ({ next: observerOrNext as Exclude<typeof observerOrNext, Partial<TapObserver<T>>>, error, complete } as Partial<TapObserver<T>>)
      : observerOrNext;

  return tapObserver
    ? operate((source, subscriber) => {
        tapObserver.subscribe?.();
        let isUnsub = true;
        source.subscribe(
          new OperatorSubscriber(
            subscriber,
            (value) => {
              tapObserver.next?.(value);
              subscriber.next(value);
            },
            () => {
              isUnsub = false;
              tapObserver.complete?.();
              subscriber.complete();
            },
            (err) => {
              isUnsub = false;
              tapObserver.error?.(err);
              subscriber.error(err);
            },
            () => {
              if (isUnsub) {
                tapObserver.unsubscribe?.();
              }
              tapObserver.finalize?.();
            }
          )
        );
      })
    : // Tap was called with no valid tap observer or handler
      // (e.g. `tap(null, null, null)` or `tap(null)` or `tap()`)
      // so we're going to just mirror the source.
      identity;
}
