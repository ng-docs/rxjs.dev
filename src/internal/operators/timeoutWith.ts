import { async } from '../scheduler/async';
import { isValidDate } from '../util/isDate';
import { ObservableInput, OperatorFunction, SchedulerLike } from '../types';
import { timeout } from './timeout';

/**
 * If the time of the Date object passed arrives before the first value arrives from the source, it will unsubscribe
 * from the source and switch the subscription to another observable.
 *
 * 如果传入的 Date 对象的时间在第一个值从源抵达之前抵达，它将退订源并转而订阅另一个 observable。
 *
 * <span class="informal">Use to switch to a different observable if the first value doesn't arrive by a specific time</span>
 *
 * <span class="informal">如果第一个值没能在指定时间内抵达，则将切换到另一个 observable</span>
 *
 * Can be used to set a timeout only for the first value, however it's recommended to use the {@link timeout} operator with
 * the `first` configuration to get that effect.
 *
 * 仅可用于为第一个值设置超时，不过更建议使用带有 `first` 的配置参数的 {@link timeout} 操作符以获得此效果。
 *
 * @param dueBy The exact time, as a `Date`, at which the timeout will be triggered if the first value does not arrive.
 *
 * 如果第一个值未抵达，将触发超时的确切时间，如 `Date`。
 *
 * @param switchTo The observable to switch to when timeout occurs.
 *
 * 当发生超时时要切换到的可观察者。
 *
 * @param scheduler The scheduler to use with time-related operations within this operator. Defaults to {@link asyncScheduler}
 *
 * 一个调度器，用于执行此操作符中与时间相关的操作。默认为 {@link asyncScheduler}
 *
 * @deprecated Replaced with {@link timeout}. Instead of `timeoutWith(someDate, a$, scheduler)`, use the configuration object `timeout({ first: someDate, with: () => a$, scheduler })`. Will be removed in v8.
 *
 * 已替换为 {@link timeout}。把 `timeoutWith(someDate, a$, scheduler)` 替换为使用配置对象的 `timeout({ first: someDate, with: () => a$, scheduler })`。将在 v8 中删除。
 *
 */
export function timeoutWith<T, R>(dueBy: Date, switchTo: ObservableInput<R>, scheduler?: SchedulerLike): OperatorFunction<T, T | R>;

/**
 * When the passed timespan elapses before the source emits any given value, it will unsubscribe from the source,
 * and switch the subscription to another observable.
 *
 * 当在源发送任何给定值之前应该已经过去的时间跨度，它将从源退订，并将此订阅切换到另一个可观察者。
 *
 * <span class="informal">Used to switch to a different observable if your source is being slow</span>
 *
 * <span class="informal">如果你的源很慢，可以用它切换到不同的 observable</span>
 *
 * Useful in cases where:
 *
 * 在以下情况下很有用：
 *
 * - You want to switch to a different source that may be faster
 *
 *   你想切换到另一个可能更快的源
 *
 * - You want to notify a user that the data stream is slow
 *
 *   你想通知用户此数据流很慢
 *
 * - You want to emit a custom error rather than the {@link TimeoutError} emitted
 *   by the default usage of {@link timeout}.
 *
 *   你希望发送自定义错误，而不是默认使用 {@link timeout} 发送的 {@link TimeoutError}。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Fallback to a faster observable
 *
 * 回退到更快的 observable
 *
 * ```ts
 * import { interval, timeoutWith } from 'rxjs';
 *
 * const slow$ = interval(1000);
 * const faster$ = interval(500);
 *
 * slow$
 *   .pipe(timeoutWith(900, faster$))
 *   .subscribe(console.log);
 * ```
 *
 * Emit your own custom timeout error
 *
 * 发送你自己的自定义超时错误
 *
 * ```ts
 * import { interval, timeoutWith, throwError } from 'rxjs';
 *
 * class CustomTimeoutError extends Error {
 *   constructor() {
 *     super('It was too slow');
 *     this.name = 'CustomTimeoutError';
 *   }
 * }
 *
 * const slow$ = interval(1000);
 *
 * slow$
 *   .pipe(timeoutWith(900, throwError(() => new CustomTimeoutError())))
 *   .subscribe({
 *     error: err => console.error(err.message)
 *   });
 * ```
 * @see {@link timeout}
 * @param waitFor The time allowed between values from the source before timeout is triggered.
 *
 * 在触发超时之前，源值之间允许的最大时间间隔。
 *
 * @param switchTo The observable to switch to when timeout occurs.
 *
 * 当发生超时时要切换到的可观察者。
 *
 * @param scheduler The scheduler to use with time-related operations within this operator. Defaults to {@link asyncScheduler}
 *
 * 一个调度器，用于执行此操作符中与时间相关的操作。默认为 {@link asyncScheduler}
 *
 * @return A function that returns an Observable that mirrors behaviour of the
 * source Observable, unless timeout happens when it starts emitting values
 * from the Observable passed as a second parameter.
 *
 * 一个函数，会返回源 Observable 的镜像 Observable，但如果发生了超时，就会发出作为第二参数传入的 Observable 的各个值。
 *
 * @deprecated Replaced with {@link timeout}. Instead of `timeoutWith(100, a$, scheduler)`, use the configuration object `timeout({ each: 100, with: () => a$, scheduler })`. Will be removed in v8.
 *
 * 已替换为 {@link timeout}。请把 `timeoutWith(100, a$, scheduler)` 替换为使用配置对象的 `timeout({ each: 100, with: () => a$, scheduler })`。将在 v8 中删除。
 *
 */
export function timeoutWith<T, R>(waitFor: number, switchTo: ObservableInput<R>, scheduler?: SchedulerLike): OperatorFunction<T, T | R>;

export function timeoutWith<T, R>(
  due: number | Date,
  withObservable: ObservableInput<R>,
  scheduler?: SchedulerLike
): OperatorFunction<T, T | R> {
  let first: number | Date | undefined;
  let each: number | undefined;
  let _with: () => ObservableInput<R>;
  scheduler = scheduler ?? async;

  if (isValidDate(due)) {
    first = due;
  } else if (typeof due === 'number') {
    each = due;
  }

  if (withObservable) {
    _with = () => withObservable;
  } else {
    throw new TypeError('No observable provided to switch to');
  }

  if (first == null && each == null) {
    // Ensure timeout was provided at runtime.
    throw new TypeError('No timeout provided.');
  }

  return timeout<T, ObservableInput<R>>({
    first,
    each,
    scheduler,
    with: _with,
  });
}
