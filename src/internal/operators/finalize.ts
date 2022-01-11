import { MonoTypeOperatorFunction } from '../types';
import { operate } from '../util/lift';

/**
 * Returns an Observable that mirrors the source Observable, but will call a specified function when
 * the source terminates on complete or error.
 * The specified function will also be called when the subscriber explicitly unsubscribes.
 *
 * 返回一个源 Observable 的镜像 Observable，但它会在源因为完成或错误而终止的时候调用指定的函数。当订阅者显式退订时，也会调用指定的函数。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Execute callback function when the observable completes
 *
 * 当 observable 完成时执行回调函数
 *
 * ```ts
 * import { interval, take, finalize } from 'rxjs';
 *
 * // emit value in sequence every 1 second
 * const source = interval(1000);
 * const example = source.pipe(
 *   take(5), //take only the first 5 values
 *   finalize(() => console.log('Sequence complete')) // Execute when the observable completes
 * );
 * const subscribe = example.subscribe(val => console.log(val));
 *
 * // results:
 * // 0
 * // 1
 * // 2
 * // 3
 * // 4
 * // 'Sequence complete'
 * ```
 *
 * Execute callback function when the subscriber explicitly unsubscribes
 *
 * 当订阅者显式退订时会执行回调函数
 *
 * ```ts
 * import { interval, finalize, tap, noop, timer } from 'rxjs';
 *
 * const source = interval(100).pipe(
 *   finalize(() => console.log('[finalize] Called')),
 *   tap({
 *     next: () => console.log('[next] Called'),
 *     error: () => console.log('[error] Not called'),
 *     complete: () => console.log('[tap complete] Not called')
 *   })
 * );
 *
 * const sub = source.subscribe({
 *   next: x => console.log(x),
 *   error: noop,
 *   complete: () => console.log('[complete] Not called')
 * });
 *
 * timer(150).subscribe(() => sub.unsubscribe());
 *
 * // results:
 * // '[next] Called'
 * // 0
 * // '[finalize] Called'
 * ```
 * @param {function} callback Function to be called when source terminates.
 *
 * 源终止时要调用的函数。
 *
 * @return A function that returns an Observable that mirrors the source, but
 * will call the specified function on termination.
 *
 * 返回一个源 Observable 的镜像 Observable 的函数，但镜像 Observable 会在终止时调用指定的函数。
 *
 */
export function finalize<T>(callback: () => void): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    // TODO: This try/finally was only added for `useDeprecatedSynchronousErrorHandling`.
    // REMOVE THIS WHEN THAT HOT GARBAGE IS REMOVED IN V8.
    try {
      source.subscribe(subscriber);
    } finally {
      subscriber.add(callback);
    }
  });
}
