import { asyncScheduler } from '../scheduler/async';
import { MonoTypeOperatorFunction, SchedulerLike, OperatorFunction, ObservableInput, ObservedValueOf } from '../types';
import { isValidDate } from '../util/isDate';
import { Subscription } from '../Subscription';
import { operate } from '../util/lift';
import { Observable } from '../Observable';
import { innerFrom } from '../observable/innerFrom';
import { createErrorClass } from '../util/createErrorClass';
import { OperatorSubscriber } from './OperatorSubscriber';
import { executeSchedule } from '../util/executeSchedule';

export interface TimeoutConfig<T, O extends ObservableInput<unknown> = ObservableInput<T>, M = unknown> {
  /**
   * The time allowed between values from the source before timeout is triggered.
   *
   * 触发超时之前源值之间允许的时间。
   *
   */
  each?: number;

  /**
   * The relative time as a `number` in milliseconds, or a specific time as a `Date` object,
   * by which the first value must arrive from the source before timeout is triggered.
   *
   * 以毫秒为单位的 `number` 的相对时间，或作为 `Date` 对象的特定时间，在触发超时之前，第一个值必须从源到达。
   *
   */
  first?: number | Date;

  /**
   * The scheduler to use with time-related operations within this operator. Defaults to {@link asyncScheduler}
   *
   * 在此运算符中与时间相关的操作一起使用的调度程序。默认为 {@link asyncScheduler}
   *
   */
  scheduler?: SchedulerLike;

  /**
   * A factory used to create observable to switch to when timeout occurs. Provides
   * a {@link TimeoutInfo} about the source observable's emissions and what delay or
   * exact time triggered the timeout.
   *
   * 用于创建可观察到的工厂，以在发生超时时切换到。提供关于源 observable 的排放以及触发超时的延迟或确切时间的 {@link TimeoutInfo}。
   *
   */
  with?: (info: TimeoutInfo<T, M>) => O;

  /**
   * Optional additional metadata you can provide to code that handles
   * the timeout, will be provided through the {@link TimeoutError}.
   * This can be used to help identify the source of a timeout or pass along
   * other information related to the timeout.
   *
   * 你可以提供给处理超时的代码的可选附加元数据将通过 {@link TimeoutError} 提供。这可用于帮助识别超时的来源或传递与超时相关的其他信息。
   *
   */
  meta?: M;
}

export interface TimeoutInfo<T, M = unknown> {
  /**
   * Optional metadata that was provided to the timeout configuration.
   *
   * 提供给超时配置的可选元数据。
   *
   */
  readonly meta: M;
  /**
   * The number of messages seen before the timeout
   *
   * 超时前看到的消息数
   *
   */
  readonly seen: number;
  /**
   * The last message seen
   *
   * 看到的最后一条消息
   *
   */
  readonly lastValue: T | null;
}

/**
 * An error emitted when a timeout occurs.
 *
 * 发生超时时发出的错误。
 *
 */
export interface TimeoutError<T = unknown, M = unknown> extends Error {
  /**
   * The information provided to the error by the timeout
   * operation that created the error. Will be `null` if
   * used directly in non-RxJS code with an empty constructor.
   * (Note that using this constructor directly is not recommended,
   * you should create your own errors)
   *
   * 由创建错误的超时操作提供给错误的信息。如果直接在具有空构造函数的非 RxJS 代码中使用，将为 `null`。（注意不建议直接使用这个构造函数，你应该自己创建错误）
   *
   */
  info: TimeoutInfo<T, M> | null;
}

export interface TimeoutErrorCtor {
  /**
   * @deprecated Internal implementation detail. Do not construct error instances.
   * Cannot be tagged as internal: <https://github.com/ReactiveX/rxjs/issues/6269>
   *
   * 内部实现细节。不要构造错误实例。不能标记为内部： <https://github.com/ReactiveX/rxjs/issues/6269>
   *
   */
  new <T = unknown, M = unknown>(info?: TimeoutInfo<T, M>): TimeoutError<T, M>;
}

/**
 * An error thrown by the {@link timeout} operator.
 *
 * {@link timeout} 运算符引发的错误。
 *
 * Provided so users can use as a type and do quality comparisons.
 * We recommend you do not subclass this or create instances of this class directly.
 * If you have need of a error representing a timeout, you should
 * create your own error class and use that.
 *
 * 提供以便用户可以将其用作类型并进行质量比较。我们建议你不要将其子类化或直接创建此类的实例。如果你需要一个表示超时的错误，你应该创建自己的错误类并使用它。
 *
 * @see {@link timeout}
 * @class TimeoutError
 */
export const TimeoutError: TimeoutErrorCtor = createErrorClass(
  (_super) =>
    function TimeoutErrorImpl(this: any, info: TimeoutInfo<any> | null = null) {
      _super(this);
      this.message = 'Timeout has occurred';
      this.name = 'TimeoutError';
      this.info = info;
    }
);

/**
 * If `with` is provided, this will return an observable that will switch to a different observable if the source
 * does not push values within the specified time parameters.
 *
 * 如果提供 `with`，这将返回一个 observable，如果源没有在指定的时间参数内推送值，它将切换到不同的 observable。
 *
 * <span class="informal">The most flexible option for creating a timeout behavior.</span>
*
 * <span class="informal">创建超时行为的最灵活选项。</span>
 *
 * The first thing to know about the configuration is if you do not provide a `with` property to the configuration,
 * when timeout conditions are met, this operator will emit a {@link TimeoutError}. Otherwise, it will use the factory
 * function provided by `with`, and switch your subscription to the result of that. Timeout conditions are provided by
 * the settings in `first` and `each`.
 *
 * 关于配置首先要知道的是，如果你没有为配置提供 `with` 属性，当满足超时条件时，这个操作符会发出一个 {@link TimeoutError}。否则，它将使用 `with` 提供的工厂函数，并将你的订阅切换到该结果。超时条件由 `first` 和 `each` 中的设置提供。
 *
 * The `first` property can be either a `Date` for a specific time, a `number` for a time period relative to the
 * point of subscription, or it can be skipped. This property is to check timeout conditions for the arrival of
 * the first value from the source _only_. The timings of all subsequent values  from the source will be checked
 * against the time period provided by `each`, if it was provided.
 *
 * 第 `first` 属性可以是特定时间的 `Date`、相对于订阅点的时间段的 `number`，也可以被跳过。此属性*仅*用于检查来自源的第一个值到达的超时条件。来自源的所有后续值的时间将根据 `each` 提供的时间段进行检查（如果提供的话）。
 *
 * The `each` property can be either a `number` or skipped. If a value for `each` is provided, it represents the amount of
 * time the resulting observable will wait between the arrival of values from the source before timing out. Note that if
 * `first` is _not_ provided, the value from `each` will be used to check timeout conditions for the arrival of the first
 * value and all subsequent values. If `first` _is_ provided, `each` will only be use to check all values after the first.
 *
 * `each` 属性可以是 `number` 或跳过。如果为 `each` 提供了一个值，则它表示生成的 observable 在超时之前在源值到达之间等待的时间量。请注意，如果*未*提供 `first`，则 `each` 中的值将用于检查第一个值和所有后续值到达的超时条件。如果提供了 `first`，_ 则 _`each` 将仅用于检查第一个之后的所有值。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Emit a custom error if there is too much time between values
 *
 * 如果值之间的时间过长，则发出自定义错误
 *
 * ```ts
 * import { interval, timeout, throwError } from 'rxjs';
 *
 * class CustomTimeoutError extends Error {
 *   constructor() {
 *     super('It was too slow');
 *     this.name = 'CustomTimeoutError';
 *   }
 * }
 *
 * const slow$ = interval(900);
 *
 * slow$.pipe(
 *   timeout({
 *     each: 1000,
 *     with: () => throwError(() => new CustomTimeoutError())
 *   })
 * )
 * .subscribe({
 *   error: console.error
 * });
 * ```
 *
 * Switch to a faster observable if your source is slow.
 *
 * 如果你的来源很慢，请切换到更快的 observable。
 *
 * ```ts
 * import { interval, timeout } from 'rxjs';
 *
 * const slow$ = interval(900);
 * const fast$ = interval(500);
 *
 * slow$.pipe(
 *   timeout({
 *     each: 1000,
 *     with: () => fast$,
 *   })
 * )
 * .subscribe(console.log);
 * ```
 * @param config The configuration for the timeout.
 *
 * 超时配置。
 *
 */
export function timeout<T, O extends ObservableInput<unknown>, M = unknown>(
  config: TimeoutConfig<T, O, M> & { with: (info: TimeoutInfo<T, M>) => O }
): OperatorFunction<T, T | ObservedValueOf<O>>;

/**
 * Returns an observable that will error or switch to a different observable if the source does not push values
 * within the specified time parameters.
 *
 * 如果源没有在指定的时间参数内推送值，则返回一个将出错或切换到不同的 observable 的 observable。
 *
 * <span class="informal">The most flexible option for creating a timeout behavior.</span>
*
 * <span class="informal">创建超时行为的最灵活选项。</span>
 *
 * The first thing to know about the configuration is if you do not provide a `with` property to the configuration,
 * when timeout conditions are met, this operator will emit a {@link TimeoutError}. Otherwise, it will use the factory
 * function provided by `with`, and switch your subscription to the result of that. Timeout conditions are provided by
 * the settings in `first` and `each`.
 *
 * 关于配置首先要知道的是，如果你没有为配置提供 `with` 属性，当满足超时条件时，这个操作符会发出一个 {@link TimeoutError}。否则，它将使用 `with` 提供的工厂函数，并将你的订阅切换到该结果。超时条件由 `first` 和 `each` 中的设置提供。
 *
 * The `first` property can be either a `Date` for a specific time, a `number` for a time period relative to the
 * point of subscription, or it can be skipped. This property is to check timeout conditions for the arrival of
 * the first value from the source _only_. The timings of all subsequent values  from the source will be checked
 * against the time period provided by `each`, if it was provided.
 *
 * 第 `first` 属性可以是特定时间的 `Date`、相对于订阅点的时间段的 `number`，也可以被跳过。此属性*仅*用于检查来自源的第一个值到达的超时条件。来自源的所有后续值的时间将根据 `each` 提供的时间段进行检查（如果提供的话）。
 *
 * The `each` property can be either a `number` or skipped. If a value for `each` is provided, it represents the amount of
 * time the resulting observable will wait between the arrival of values from the source before timing out. Note that if
 * `first` is _not_ provided, the value from `each` will be used to check timeout conditions for the arrival of the first
 * value and all subsequent values. If `first` _is_ provided, `each` will only be use to check all values after the first.
 *
 * `each` 属性可以是 `number` 或跳过。如果为 `each` 提供了一个值，则它表示生成的 observable 在超时之前在源值到达之间等待的时间量。请注意，如果*未*提供 `first`，则 `each` 中的值将用于检查第一个值和所有后续值到达的超时条件。如果提供了 `first`，_ 则 _`each` 将仅用于检查第一个之后的所有值。
 *
 * ### Handling TimeoutErrors
 *
 * ### 处理超时错误
 *
 * If no `with` property was provided, subscriptions to the resulting observable may emit an error of {@link TimeoutError}.
 * The timeout error provides useful information you can examine when you're handling the error. The most common way to handle
 * the error would be with {@link catchError}, although you could use {@link tap} or just the error handler in your `subscribe` call
 * directly, if your error handling is only a side effect (such as notifying the user, or logging).
 *
 * 如果没有 `with` 属性，订阅结果 observable 可能会发出 {@link TimeoutError} 错误。超时错误提供了你在处理错误时可以检查的有用信息。处理错误的最常见方法是使用 {@link catchError}，尽管你可以使用 {@link tap} 或直接在 `subscribe` 调用中使用错误处理程序，如果你的错误处理只是一个副作用（例如通知用户或日志记录）。
 *
 * In this case, you would check the error for `instanceof TimeoutError` to validate that the error was indeed from `timeout`, and
 * not from some other source. If it's not from `timeout`, you should probably rethrow it if you're in a `catchError`.
 *
 * 在这种情况下，你将检查 `instanceof TimeoutError` 的错误，以验证该错误确实来自 `timeout`，而不是来自其他来源。如果它不是来自 `timeout`，那么如果你处于 `catchError` 中，你可能应该重新抛出它。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Emit a {@link TimeoutError} if the first value, and _only_ the first value, does not arrive within 5 seconds
 *
 * 如果第一个值（并且*只有*第一个值）在 5 秒内未到达，则发出 {@link TimeoutError}
 *
 * ```ts
 * import { interval, timeout } from 'rxjs';
 *
 * // A random interval that lasts between 0 and 10 seconds per tick
 * const source$ = interval(Math.round(Math.random() * 10_000));
 *
 * source$.pipe(
 *   timeout({ first: 5_000 })
 * )
 * .subscribe({
 *   next: console.log,
 *   error: console.error
 * });
 * ```
 *
 * Emit a {@link TimeoutError} if the source waits longer than 5 seconds between any two values or the first value
 * and subscription.
 *
 * 如果源在任意两个值或第一个值和订阅之间等待超过 5 秒，则发出 {@link TimeoutError}。
 *
 * ```ts
 * import { timer, timeout, expand } from 'rxjs';
 *
 * const getRandomTime = () => Math.round(Math.random() * 10_000);
 *
 * // An observable that waits a random amount of time between each delivered value
 * const source$ = timer(getRandomTime())
 *   .pipe(expand(() => timer(getRandomTime())));
 *
 * source$
 *   .pipe(timeout({ each: 5_000 }))
 *   .subscribe({
 *     next: console.log,
 *     error: console.error
 *   });
 * ```
 *
 * Emit a {@link TimeoutError} if the source does not emit before 7 seconds, _or_ if the source waits longer than
 * 5 seconds between any two values after the first.
 *
 * 如果源在 7 秒之前没有发出，_ 或者 _ 源在第一个值之后的任意两个值之间等待超过 5 秒，则发出 {@link TimeoutError}。
 *
 * ```ts
 * import { timer, timeout, expand } from 'rxjs';
 *
 * const getRandomTime = () => Math.round(Math.random() * 10_000);
 *
 * // An observable that waits a random amount of time between each delivered value
 * const source$ = timer(getRandomTime())
 *   .pipe(expand(() => timer(getRandomTime())));
 *
 * source$
 *   .pipe(timeout({ first: 7_000, each: 5_000 }))
 *   .subscribe({
 *     next: console.log,
 *     error: console.error
 *   });
 * ```
 */
export function timeout<T, M = unknown>(config: Omit<TimeoutConfig<T, any, M>, 'with'>): OperatorFunction<T, T>;

/**
 * Returns an observable that will error if the source does not push its first value before the specified time passed as a `Date`.
 * This is functionally the same as `timeout({ first: someDate })`.
 *
 * 如果源在作为 `Date` 传递的指定时间之前未推送其第一个值，则返回一个 observable 将出错。这在功能上与 `timeout({ first: someDate })` 相同。
 *
 * <span class="informal">Errors if the first value doesn't show up before the given date and time</span>
*
 * <span class="informal">如果第一个值在给定的日期和时间之前没有出现，则会出错</span>
 *
 * ![](timeout.png)
 * @param first The date to at which the resulting observable will timeout if the source observable
 * does not emit at least one value.
 *
 * 如果源 observable 没有发出至少一个值，则结果 observable 将超时的日期。
 *
 * @param scheduler The scheduler to use. Defaults to {@link asyncScheduler}.
 *
 * 要使用的调度程序。默认为 {@link asyncScheduler}。
 *
 */
export function timeout<T>(first: Date, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

/**
 * Returns an observable that will error if the source does not push a value within the specified time in milliseconds.
 * This is functionally the same as `timeout({ each: milliseconds })`.
 *
 * 如果源没有在指定时间内以毫秒为单位推送值，则返回一个将出错的 observable。这在功能上与 `timeout({ each: milliseconds })` 相同。
 *
 * <span class="informal">Errors if it waits too long between any value</span>
*
 * <span class="informal">如果在任何值之间等待太久，则会出错</span>
 *
 * ![](timeout.png)
 * @param each The time allowed between each pushed value from the source before the resulting observable
 * will timeout.
 *
 * 在结果 observable 超时之前从源推送的每个值之间允许的时间。
 *
 * @param scheduler The scheduler to use. Defaults to {@link asyncScheduler}.
 *
 * 要使用的调度程序。默认为 {@link asyncScheduler}。
 *
 */
export function timeout<T>(each: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

/**
 * Errors if Observable does not emit a value in given time span.
 *
 * 如果 Observable 在给定的时间范围内没有发出值，则会出错。
 *
 * <span class="informal">Timeouts on Observable that doesn't emit values fast enough.</span>
*
 * <span class="informal">Observable 上的超时不会足够快地发出值。</span>
 *
 * ![](timeout.png)
 * @see {@link timeoutWith}
 * @return A function that returns an Observable that mirrors behaviour of the
 * source Observable, unless timeout happens when it throws an error.
 *
 * 返回一个反映源 Observable 行为的 Observable 的函数，除非在抛出错误时发生超时。
 *
 */
export function timeout<T, O extends ObservableInput<any>, M>(
  config: number | Date | TimeoutConfig<T, O, M>,
  schedulerArg?: SchedulerLike
): OperatorFunction<T, T | ObservedValueOf<O>> {
  // Intentionally terse code.
  // If the first argument is a valid `Date`, then we use it as the `first` config.
  // Otherwise, if the first argument is a `number`, then we use it as the `each` config.
  // Otherwise, it can be assumed the first argument is the configuration object itself, and
  // we destructure that into what we're going to use, setting important defaults as we do.
  // NOTE: The default for `scheduler` will be the `scheduler` argument if it exists, or
  // it will default to the `asyncScheduler`.
  const { first, each, with: _with = timeoutErrorFactory, scheduler = schedulerArg ?? asyncScheduler, meta = null! } = (isValidDate(config)
    ? { first: config }
    : typeof config === 'number'
    ? { each: config }
    : config) as TimeoutConfig<T, O, M>;

  if (first == null && each == null) {
    // Ensure timeout was provided at runtime.
    throw new TypeError('No timeout provided.');
  }

  return operate((source, subscriber) => {
    // This subscription encapsulates our subscription to the
    // source for this operator. We're capturing it separately,
    // because if there is a `with` observable to fail over to,
    // we want to unsubscribe from our original subscription, and
    // hand of the subscription to that one.
    let originalSourceSubscription: Subscription;
    // The subscription for our timeout timer. This changes
    // every time get get a new value.
    let timerSubscription: Subscription;
    // A bit of state we pass to our with and error factories to
    // tell what the last value we saw was.
    let lastValue: T | null = null;
    // A bit of state we pass to the with and error factories to
    // tell how many values we have seen so far.
    let seen = 0;
    const startTimer = (delay: number) => {
      timerSubscription = executeSchedule(
        subscriber,
        scheduler,
        () => {
          try {
            originalSourceSubscription.unsubscribe();
            innerFrom(
              _with!({
                meta,
                lastValue,
                seen,
              })
            ).subscribe(subscriber);
          } catch (err) {
            subscriber.error(err);
          }
        },
        delay
      );
    };

    originalSourceSubscription = source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value: T) => {
          // clear the timer so we can emit and start another one.
          timerSubscription?.unsubscribe();
          seen++;
          // Emit
          subscriber.next((lastValue = value));
          // null | undefined are both < 0. Thanks, JavaScript.
          each! > 0 && startTimer(each!);
        },
        undefined,
        undefined,
        () => {
          if (!timerSubscription?.closed) {
            timerSubscription?.unsubscribe();
          }
          // Be sure not to hold the last value in memory after unsubscription
          // it could be quite large.
          lastValue = null;
        }
      )
    );

    // Intentionally terse code.
    // If `first` was provided, and it's a number, then use it.
    // If `first` was provided and it's not a number, it's a Date, and we get the difference between it and "now".
    // If `first` was not provided at all, then our first timer will be the value from `each`.
    startTimer(first != null ? (typeof first === 'number' ? first : +first - scheduler!.now()) : each!);
  });
}

/**
 * The default function to use to emit an error when timeout occurs and a `with` function
 * is not specified.
 *
 * 发生超时且未指定 `with` 函数时用于发出错误的默认函数。
 *
 * @param info The information about the timeout to pass along to the error
 *
 * 传递给错误的超时信息
 *
 */
function timeoutErrorFactory(info: TimeoutInfo<any>): Observable<never> {
  throw new TimeoutError(info);
}
