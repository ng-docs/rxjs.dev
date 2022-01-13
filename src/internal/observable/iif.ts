import { Observable } from '../Observable';
import { defer } from './defer';
import { ObservableInput } from '../types';

/**
 * Checks a boolean at subscription time, and chooses between one of two observable sources
 *
 * 在订阅时检查布尔值，并从两个可观察源之中选一个
 *
 * `iif` excepts a function that returns a boolean (the `condition` function), and two sources,
 * the `trueResult` and the `falseResult`, and returns an Observable.
 *
 * `iif` 接受一个返回布尔值的 `condition` 函数和两个返回来源（`trueResult` 和 `falseResult`）的函数，并返回一个 Observable。
 *
 * At the moment of subscription, the `condition` function is called. If the result is `true`, the
 * subscription will be to the source passed as the `trueResult`, otherwise, the subscription will be
 * to the source passed as the `falseResult`.
 *
 * 在订阅的那一刻，`condition` 函数被调用。如果结果为 `true`，将订阅作为 `trueResult` 传入的源，否则，将订阅作为 `falseResult` 传入的源。
 *
 * If you need to check more than two options to choose between more than one observable, have a look at the {@link defer} creation method.
 *
 * 如果你需要检查两个以上的选项，以在多个 observable 之间进行选择，请查看创建方法 {@link defer}。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Change at runtime which Observable will be subscribed
 *
 * 在运行时更改要订阅哪个 Observable
 *
 * ```ts
 * import { iif, of } from 'rxjs';
 *
 * let subscribeToFirst;
 * const firstOrSecond = iif(
 *   () => subscribeToFirst,
 *   of('first'),
 *   of('second')
 * );
 *
 * subscribeToFirst = true;
 * firstOrSecond.subscribe(value => console.log(value));
 *
 * // Logs:
 * // 'first'
 *
 * subscribeToFirst = false;
 * firstOrSecond.subscribe(value => console.log(value));
 *
 * // Logs:
 * // 'second'
 * ```
 *
 * Control access to an Observable
 *
 * 控制对 Observable 的访问
 *
 * ```ts
 * import { iif, of, EMPTY } from 'rxjs';
 *
 * let accessGranted;
 * const observableIfYouHaveAccess = iif(
 *   () => accessGranted,
 *   of('It seems you have an access...'),
 *   EMPTY
 * );
 *
 * accessGranted = true;
 * observableIfYouHaveAccess.subscribe({
 *   next: value => console.log(value),
 *   complete: () => console.log('The end')
 * });
 *
 * // Logs:
 * // 'It seems you have an access...'
 * // 'The end'
 *
 * accessGranted = false;
 * observableIfYouHaveAccess.subscribe({
 *   next: value => console.log(value),
 *   complete: () => console.log('The end')
 * });
 *
 * // Logs:
 * // 'The end'
 * ```
 * @see {@link defer}
 * @param condition Condition which Observable should be chosen.
 *
 * 决定要选择哪个 Observable 的条件。
 *
 * @param trueResult An Observable that will be subscribed if condition is true.
 *
 * 当条件为真时，将订阅的 Observable。
 *
 * @param falseResult An Observable that will be subscribed if condition is false.
 *
 * 当条件为假时，将订阅的 Observable。
 *
 * @return An observable that proxies to `trueResult` or `falseResult`, depending on the result of the `condition` function.
 *
 * 一个代理 `trueResult` 或 `falseResult` 的可观察者，具体取决于 `condition` 函数的结果。
 *
 */
export function iif<T, F>(condition: () => boolean, trueResult: ObservableInput<T>, falseResult: ObservableInput<F>): Observable<T | F> {
  return defer(() => (condition() ? trueResult : falseResult));
}
