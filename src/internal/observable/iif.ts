import { Observable } from '../Observable';
import { defer } from './defer';
import { ObservableInput } from '../types';

/**
 * Checks a boolean at subscription time, and chooses between one of two observable sources
 *
 * 在订阅时检查布尔值，并在两个可观察源之一之间进行选择
 *
 * `iif` excepts a function that returns a boolean (the `condition` function), and two sources,
 * the `trueResult` and the `falseResult`, and returns an Observable.
 *
 * `iif` 排除了一个返回布尔值（ `condition` 函数）和两个源（ `trueResult` 和 `falseResult` ）的函数，并返回一个 Observable。
 *
 * At the moment of subscription, the `condition` function is called. If the result is `true`, the
 * subscription will be to the source passed as the `trueResult`, otherwise, the subscription will be
 * to the source passed as the `falseResult`.
 *
 * 在订阅的那一刻， `condition` 函数被调用。如果结果为 `true` ，订阅将针对作为 `trueResult` 传递的源，否则，订阅将针对作为 `falseResult` 传递的源。
 *
 * If you need to check more than two options to choose between more than one observable, have a look at the {@link defer} creation method.
 *
 * 如果你需要检查两个以上的选项以在多个 observable 之间进行选择，请查看 {@link defer} 创建方法。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Change at runtime which Observable will be subscribed
 *
 * 在运行时更改将订阅哪个 Observable
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
 * 应选择 Observable 的条件。
 *
 * @param trueResult An Observable that will be subscribed if condition is true.
 *
 * 如果条件为真，将订阅的 Observable。
 *
 * @param falseResult An Observable that will be subscribed if condition is false.
 *
 * 如果条件为假，将订阅的 Observable。
 *
 * @return An observable that proxies to `trueResult` or `falseResult`, depending on the result of the `condition` function.
 *
 * 代理 `trueResult` 或 `falseResult` 的可观察对象，具体取决于 `condition` 函数的结果。
 *
 */
export function iif<T, F>(condition: () => boolean, trueResult: ObservableInput<T>, falseResult: ObservableInput<F>): Observable<T | F> {
  return defer(() => (condition() ? trueResult : falseResult));
}
