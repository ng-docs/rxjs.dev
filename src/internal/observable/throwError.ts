import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { SchedulerLike } from '../types';
import { isFunction } from '../util/isFunction';

/**
 * Creates an observable that will create an error instance and push it to the consumer as an error
 * immediately upon subscription.
 *
 * 创建一个 observable，它将创建一个错误实例，并在订阅后立即将其作为错误推送给消费者。
 *
 * <span class="informal">Just errors and does nothing else</span>
 *
 * <span class="informal">只是报错，什么都不做</span>
 *
 * ![](throw.png)
 *
 * This creation function is useful for creating an observable that will create an error and error every
 * time it is subscribed to. Generally, inside of most operators when you might want to return an errored
 * observable, this is unnecessary. In most cases, such as in the inner return of {@link concatMap},
 * {@link mergeMap}, {@link defer}, and many others, you can simply throw the error, and RxJS will pick
 * that up and notify the consumer of the error.
 *
 * 这个创建函数对于创建一个 observable 很有用，它会在每次订阅时创建一个错误并报错。通常，在大多数操作符中，当你可能要返回错误的可观察者时，这是没必要的。在大多数情况下，例如在 {@link concatMap}、{@link mergeMap}、{@link defer} 和许多其他的内部返回中，你可以简单地抛出错误，RxJS 会捕获它并把这个错误通知消费者。
 *
 * ## Example
 *
 * ## 例子
 *
 * Create a simple observable that will create a new error with a timestamp and log it
 * and the message every time you subscribe to it
 *
 * 创建一个简单的可观察者，它将创建一个带有时间戳的新错误，并在你每次订阅它时记录它和错误信息
 *
 * ```ts
 * import { throwError } from 'rxjs';
 *
 * let errorCount = 0;
 *
 * const errorWithTimestamp$ = throwError(() => {
 *   const error: any = new Error(`This is error number ${ ++errorCount }`);
 *   error.timestamp = Date.now();
 *   return error;
 * });
 *
 * errorWithTimestamp$.subscribe({
 *   error: err => console.log(err.timestamp, err.message)
 * });
 *
 * errorWithTimestamp$.subscribe({
 *   error: err => console.log(err.timestamp, err.message)
 * });
 *
 * // Logs the timestamp and a new error message for each subscription
 * ```
 *
 * ### Unnecessary usage
 *
 * ### 非必要的使用
 *
 * Using `throwError` inside of an operator or creation function
 * with a callback, is usually not necessary
 *
 * 在操作符或带有回调的创建函数中使用 `throwError` 通常不是必需的
 *
 * ```ts
 * import { of, concatMap, timer, throwError } from 'rxjs';
 *
 * const delays$ = of(1000, 2000, Infinity, 3000);
 *
 * delays$.pipe(
 *   concatMap(ms => {
 *     if (ms < 10000) {
 *       return timer(ms);
 *     } else {
 *       // This is probably overkill.
 *       return throwError(() => new Error(`Invalid time ${ ms }`));
 *     }
 *   })
 * )
 * .subscribe({
 *   next: console.log,
 *   error: console.error
 * });
 * ```
 *
 * You can just throw the error instead
 *
 * 你可以改为抛出错误
 *
 * ```ts
 * import { of, concatMap, timer } from 'rxjs';
 *
 * const delays$ = of(1000, 2000, Infinity, 3000);
 *
 * delays$.pipe(
 *   concatMap(ms => {
 *     if (ms < 10000) {
 *       return timer(ms);
 *     } else {
 *       // Cleaner and easier to read for most folks.
 *       throw new Error(`Invalid time ${ ms }`);
 *     }
 *   })
 * )
 * .subscribe({
 *   next: console.log,
 *   error: console.error
 * });
 * ```
 * @param errorFactory A factory function that will create the error instance that is pushed.
 *
 * 一个工厂函数，它将创建被推送的错误实例。
 *
 */
export function throwError(errorFactory: () => any): Observable<never>;

/**
 * Returns an observable that will error with the specified error immediately upon subscription.
 *
 * 返回一个 observable，它会在订阅后立即发送指定的错误。
 *
 * @param error The error instance to emit
 *
 * 要发送的错误实例
 *
 * @deprecated Support for passing an error value will be removed in v8. Instead, pass a factory function to `throwError(() => new Error('test'))`. This is
 * because it will create the error at the moment it should be created and capture a more appropriate stack trace. If
 * for some reason you need to create the error ahead of time, you can still do that: `const err = new Error('test'); throwError(() => err);`.
 *
 * 在 v8 中将删除对传入错误值的支持。相反，要传入工厂函数 `throwError(() => new Error('test'))`。这是因为它会在要创建它的那一刻创建错误并捕获一个更合适的跟踪堆栈。如果由于某种原因你需要提前创建错误，你仍然可以这样做： `const err = new Error('test'); throwError(() => err);`。
 *
 */
export function throwError(error: any): Observable<never>;

/**
 * Notifies the consumer of an error using a given scheduler by scheduling it at delay `0` upon subscription.
 *
 * 通过订阅时在延迟 `0` 处调度它，可以使用给定的调度器来通知消费者错误。
 *
 * @param errorOrErrorFactory An error instance or error factory
 *
 * 错误实例或错误工厂
 *
 * @param scheduler A scheduler to use to schedule the error notification
 *
 * 用于安排错误通知的调度器
 *
 * @deprecated The `scheduler` parameter will be removed in v8.
 * Use `throwError` in combination with {@link observeOn}: `throwError(() => new Error('test')).pipe(observeOn(scheduler));`.
 * Details: <https://rxjs.dev/deprecations/scheduler-argument>
 *
 * `scheduler` 参数将在 v8 中删除。请将 `throwError` 与 {@link observeOn} 结合使用： `throwError(() => new Error('test')).pipe(observeOn(scheduler));`。详细信息： <https://rxjs.dev/deprecations/scheduler-argument>
 *
 */
export function throwError(errorOrErrorFactory: any, scheduler: SchedulerLike): Observable<never>;

export function throwError(errorOrErrorFactory: any, scheduler?: SchedulerLike): Observable<never> {
  const errorFactory = isFunction(errorOrErrorFactory) ? errorOrErrorFactory : () => errorOrErrorFactory;
  const init = (subscriber: Subscriber<never>) => subscriber.error(errorFactory());
  return new Observable(scheduler ? (subscriber) => scheduler.schedule(init as any, 0, subscriber) : init);
}
