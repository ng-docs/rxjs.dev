import { MonoTypeOperatorFunction, Observer } from '../types';
import { isFunction } from '../util/isFunction';
import { operate } from '../util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { identity } from '../util/identity';

export interface TapObserver<T> extends Observer<T> {
  subscribe: () => void;
  unsubscribe: () => void;
  finalize: () => void;
}

/**
 * Used to perform side-effects for notifications from the source observable
 *
 * 用于对来自源 observable 的通知执行副作用
 *
 * <span class="informal">Used when you want to affect outside state with a notification without altering the notification</span>
 *
 * <span class="informal">当你想借助某个通知来影响外部状态而不想更改此通知时使用</span>
 *
 * ![](tap.png)
 *
 * Tap is designed to allow the developer a designated place to perform side effects. While you _could_ perform side-effects
 * inside of a `map` or a `mergeMap`, that would make their mapping functions impure, which isn't always a big deal, but will
 * make it so you can't do things like memoize those functions. The `tap` operator is designed solely for such side-effects to
 * help you remove side-effects from other operations.
 *
 * tap 旨在让开发者在指定的地方执行副作用。虽然你*可以*在 `map` 或 `mergeMap` 内部执行副作用，但这会使它们的映射函数不再纯净，这虽然不是什么大不了的，但会使你无法调用诸如 memoize 之类的函数。`tap` 操作符就是专为此类副作用设计的，以帮助你消除其它操作的副作用。
 *
 * For any notification, next, error, or complete, `tap` will call the appropriate callback you have provided to it, via a function
 * reference, or a partial observer, then pass that notification down the stream.
 *
 * 对于任何通知：下一个、出错或完成，`tap` 都将通过函数引用或部分 Observer 调用你提供给它的适当回调，然后将该通知传递到流中。
 *
 * The observable returned by `tap` is an exact mirror of the source, with one exception: Any error that occurs -- synchronously -- in a handler
 * provided to `tap` will be emitted as an error from the returned observable.
 *
 * `tap` 返回的 observable 是源的精准镜像，但有一个例外：在提供给 `tap` 的处理器中同步发生的任何错误都将作为结果 observable 中的错误进行发送。
 *
 * > Be careful! You can mutate objects as they pass through the `tap` operator's handlers.
 * >
 * > 小心！你可以在某些对象通过 `tap` 操作符的处理器时对其进行修改。
 * >
 *
 * The most common use of `tap` is actually for debugging. You can place a `tap(console.log)` anywhere
 * in your observable `pipe`, log out the notifications as they are emitted by the source returned by the previous
 * operation.
 *
 * `tap` 最常见的用途实际上是用于调试。你可以在 Observable `pipe` 中的任何位置放置一个 `tap(console.log)`，以记录这些通知，因为它们是由以前的操作返回的源发出来的。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Check a random number before it is handled. Below is an observable that will use a random number between 0 and 1,
 * and emit `'big'` or `'small'` depending on the size of that number. But we wanted to log what the original number
 * was, so we have added a `tap(console.log)`.
 *
 * 在处理之前检查一个随机数。下面是一个 observable，它将使用 0 到 1 之间的随机数，并根据该数字的大小发送 `'big'` 或 `'small'`。但是我们还想记录其原始数字是多少，所以我们添加了一个 `tap(console.log)`。
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
 * 使用 `tap` 分析某个值并强制出错。下面是一个 observable，在我们的系统中，只想发送从另一个来源获得的 3 或更小的数字。我们可以使用 `tap` 来强制我们的 observable 出错。
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
 * 我们想知道一个 observable 何时完成，然后再继续处理下一个 observable。下面的系统将从 3 个不同的 observables 中依次发送一系列随机的 `'X'` 字符。在这种情况下，我们知道一个 observable 何时完成并移动到下一个的唯一方法是因为我们添加了一个带有把日志记录到控制台这个副作用的 `tap`。
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
 * 下一个值的处理器或部分 Observer
 *
 * @param error An error handler
 *
 * 错误处理器
 *
 * @param complete A completion handler
 *
 * 完成处理器
 *
 * @return A function that returns an Observable identical to the source, but
 * runs the specified Observer or callback(s) for each item.
 *
 * 返回与源相同的 Observable 的函数，但会为每个条目运行指定的 Observer 或回调。
 *
 */
export function tap<T>(observerOrNext?: Partial<TapObserver<T>> | ((value: T) => void) | null): MonoTypeOperatorFunction<T> {
  // We have to check to see not only if next is a function,
  // but if error or complete were passed. This is because someone
  // could technically call tap like `tap(null, fn)` or `tap(null, null, fn)`.
  const tapObserver = isFunction(observerOrNext) ? { next: observerOrNext } : observerOrNext;

  return tapObserver
    ? operate((source, subscriber) => {
        tapObserver.subscribe?.();
        let isUnsub = true;
        source.subscribe(
          createOperatorSubscriber(
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
