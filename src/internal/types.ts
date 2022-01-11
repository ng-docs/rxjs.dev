// https://github.com/microsoft/TypeScript/issues/40462#issuecomment-689879308
/// <reference lib="esnext.asynciterable" />

import { Observable } from './Observable';
import { Subscription } from './Subscription';

/**
 * Note: This will add Symbol.observable globally for all TypeScript users,
 * however, we are no longer polyfilling Symbol.observable
 *
 * 注意：这将为所有 TypeScript 用户全局添加 Symbol.observable，但是，我们不再填充 Symbol.observable
 *
 */
declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}

/**
 * OPERATOR INTERFACES
 *
 * 操作员界面
 *
 */

export interface UnaryFunction<T, R> {
  (source: T): R;
}

export interface OperatorFunction<T, R> extends UnaryFunction<Observable<T>, Observable<R>> {}

export type FactoryOrValue<T> = T | (() => T);

export interface MonoTypeOperatorFunction<T> extends OperatorFunction<T, T> {}

/**
 * A value and the time at which it was emitted.
 *
 * 一个值和发出它的时间。
 *
 * Emitted by the `timestamp` operator
 *
 * 由 `timestamp` 运算符发出
 *
 * @see {@link timestamp}
 */
export interface Timestamp<T> {
  value: T;
  /**
   * The timestamp. By default, this is in epoch milliseconds.
   * Could vary based on the timestamp provider passed to the operator.
   *
   * 时间戳。默认情况下，这是以纪元毫秒为单位。可能会因传递给操作员的时间戳提供程序而异。
   *
   */
  timestamp: number;
}

/**
 * A value emitted and the amount of time since the last value was emitted.
 *
 * 发出的值和自发出最后一个值以来的时间量。
 *
 * Emitted by the `timeInterval` operator.
 *
 * 由 `timeInterval` 运算符发出。
 *
 * @see {@link timeInterval}
 */
export interface TimeInterval<T> {
  value: T;

  /**
   * The amount of time between this value's emission and the previous value's emission.
   * If this is the first emitted value, then it will be the amount of time since subscription
   * started.
   *
   * 此值的发射与前一个值的发射之间的时间量。如果这是第一个发出的值，那么它将是自订阅开始以来的时间量。
   *
   */
  interval: number;
}

/**
 * SUBSCRIPTION INTERFACES
 *
 * 订阅接口
 *
 */

export interface Unsubscribable {
  unsubscribe(): void;
}

export type TeardownLogic = Subscription | Unsubscribable | (() => void) | void;

export interface SubscriptionLike extends Unsubscribable {
  unsubscribe(): void;
  readonly closed: boolean;
}

/**
 * @deprecated Do not use. Most likely you want to use `ObservableInput`. Will be removed in v8.
 *
 * 不使用。你很可能想使用 `ObservableInput` 。将在 v8 中删除。
 *
 */
export type SubscribableOrPromise<T> = Subscribable<T> | Subscribable<never> | PromiseLike<T> | InteropObservable<T>;

/**
 * OBSERVABLE INTERFACES
 *
 * 可观察的界面
 *
 */

export interface Subscribable<T> {
  subscribe(observer: Partial<Observer<T>>): Unsubscribable;
}

/**
 * Valid types that can be converted to observables.
 *
 * 可以转换为可观察对象的有效类型。
 *
 */
export type ObservableInput<T> =
  | Observable<T>
  | InteropObservable<T>
  | AsyncIterable<T>
  | PromiseLike<T>
  | ArrayLike<T>
  | Iterable<T>
  | ReadableStreamLike<T>;

/**
 * @deprecated Renamed to {@link InteropObservable }. Will be removed in v8.
 *
 * 重命名为 {@link InteropObservable }。将在 v8 中删除。
 *
 */
export type ObservableLike<T> = InteropObservable<T>;

/**
 * An object that implements the `Symbol.observable` interface.
 *
 * 实现 `Symbol.observable` 接口的对象。
 *
 */
export interface InteropObservable<T> {
  [Symbol.observable]: () => Subscribable<T>;
}

/**
 * NOTIFICATIONS
 *
 * 通知
 *
 */

/**
 * A notification representing a "next" from an observable.
 * Can be used with {@link dematerialize}.
 *
 * 表示来自可观察对象的“下一个”的通知。可以与 {@link dematerialize} 一起使用。
 *
 */
export interface NextNotification<T> {
  /**
   * The kind of notification. Always "N"
   *
   * 通知的种类。总是“N”
   *
   */
  kind: 'N';
  /**
   * The value of the notification.
   *
   * 通知的值。
   *
   */
  value: T;
}

/**
 * A notification representing an "error" from an observable.
 * Can be used with {@link dematerialize}.
 *
 * 表示来自可观察对象的“错误”的通知。可以与 {@link dematerialize} 一起使用。
 *
 */
export interface ErrorNotification {
  /**
   * The kind of notification. Always "E"
   *
   * 通知的种类。总是“E”
   *
   */
  kind: 'E';
  error: any;
}

/**
 * A notification representing a "completion" from an observable.
 * Can be used with {@link dematerialize}.
 *
 * 表示来自可观察对象的“完成”的通知。可以与 {@link dematerialize} 一起使用。
 *
 */
export interface CompleteNotification {
  kind: 'C';
}

/**
 * Valid observable notification types.
 *
 * 有效的可观察通知类型。
 *
 */
export type ObservableNotification<T> = NextNotification<T> | ErrorNotification | CompleteNotification;

/**
 * OBSERVER INTERFACES
 *
 * 观察者接口
 *
 */

export interface NextObserver<T> {
  closed?: boolean;
  next: (value: T) => void;
  error?: (err: any) => void;
  complete?: () => void;
}

export interface ErrorObserver<T> {
  closed?: boolean;
  next?: (value: T) => void;
  error: (err: any) => void;
  complete?: () => void;
}

export interface CompletionObserver<T> {
  closed?: boolean;
  next?: (value: T) => void;
  error?: (err: any) => void;
  complete: () => void;
}

export type PartialObserver<T> = NextObserver<T> | ErrorObserver<T> | CompletionObserver<T>;

export interface Observer<T> {
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}

export interface SubjectLike<T> extends Observer<T>, Subscribable<T> {}

/**
 * SCHEDULER INTERFACES
 *
 * 调度程序接口
 *
 */

export interface SchedulerLike extends TimestampProvider {
  schedule<T>(work: (this: SchedulerAction<T>, state: T) => void, delay: number, state: T): Subscription;
  schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay: number, state?: T): Subscription;
  schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay?: number, state?: T): Subscription;
}

export interface SchedulerAction<T> extends Subscription {
  schedule(state?: T, delay?: number): Subscription;
}

/**
 * This is a type that provides a method to allow RxJS to create a numeric timestamp
 *
 * 这是一种类型，它提供了一种允许 RxJS 创建数字时间戳的方法
 *
 */
export interface TimestampProvider {
  /**
   * Returns a timestamp as a number.
   *
   * 以数字形式返回时间戳。
   *
   * This is used by types like `ReplaySubject` or operators like `timestamp` to calculate
   * the amount of time passed between events.
   *
   * `ReplaySubject` 类的类型或 `timestamp` 之类的运算符使用它来计算事件之间传递的时间量。
   *
   */
  now(): number;
}

/**
 * Extracts the type from an `ObservableInput<any>`. If you have
 * `O extends ObservableInput<any>` and you pass in `Observable<number>`, or
 * `Promise<number>`, etc, it will type as `number`.
 *
 * 从 `ObservableInput<any>` 中提取类型。如果你有 `O extends ObservableInput<any>` 并且你传入 `Observable<number>` 或 `Promise<number>` 等，它将键入为 `number` 。
 *
 */
export type ObservedValueOf<O> = O extends ObservableInput<infer T> ? T : never;

/**
 * Extracts a union of element types from an `ObservableInput<any>[]`.
 * If you have `O extends ObservableInput<any>[]` and you pass in
 * `Observable<string>[]` or `Promise<string>[]` you would get
 * back a type of `string`.
 * If you pass in `[Observable<string>, Observable<number>]` you would
 * get back a type of `string | number`.
 *
 * 从 `ObservableInput<any>[]` 中提取元素类型的联合。如果你有 `O extends ObservableInput<any>[]` 并且你传入 `Observable<string>[]` 或 `Promise<string>[]` 你会得到一个 `string` 类型。如果你传入 `[Observable<string>, Observable<number>]` 你会得到一种 `string | number` 。
 *
 */
export type ObservedValueUnionFromArray<X> = X extends Array<ObservableInput<infer T>> ? T : never;

/**
 * @deprecated Renamed to {@link ObservedValueUnionFromArray}. Will be removed in v8.
 *
 * 重命名为 {@link ObservedValueUnionFromArray}。将在 v8 中删除。
 *
 */
export type ObservedValuesFromArray<X> = ObservedValueUnionFromArray<X>;

/**
 * Extracts a tuple of element types from an `ObservableInput<any>[]`.
 * If you have `O extends ObservableInput<any>[]` and you pass in
 * `[Observable<string>, Observable<number>]` you would get back a type
 * of `[string, number]`.
 *
 * 从 `ObservableInput<any>[]` 中提取元素类型的元组。如果你有 `O extends ObservableInput<any>[]` 并且你传入 `[Observable<string>, Observable<number>]` 你会得到一个类型 `[string, number]` 。
 *
 */
export type ObservedValueTupleFromArray<X> = { [K in keyof X]: ObservedValueOf<X[K]> };

/**
 * Used to infer types from arguments to functions like {@link forkJoin}.
 * So that you can have `forkJoin([Observable<A>, PromiseLike<B>]): Observable<[A, B]>`
 * et al.
 *
 * 用于从参数推断类型到 {@link forkJoin} 等函数。这样你就可以拥有 `forkJoin([Observable<A>, PromiseLike<B>]): Observable<[A, B]>` 等。
 *
 */
export type ObservableInputTuple<T> = {
  [K in keyof T]: ObservableInput<T[K]>;
};

/**
 * Constructs a new tuple with the specified type at the head.
 * If you declare `Cons<A, [B, C]>` you will get back `[A, B, C]`.
 *
 * 在头部构造一个具有指定类型的新元组。如果你声明 `Cons<A, [B, C]>` 你将返回 `[A, B, C]` 。
 *
 */
export type Cons<X, Y extends readonly any[]> = ((arg: X, ...rest: Y) => any) extends (...args: infer U) => any ? U : never;

/**
 * Extracts the head of a tuple.
 * If you declare `Head<[A, B, C]>` you will get back `A`.
 *
 * 提取元组的头部。如果你声明 `Head<[A, B, C]>` 你将返回 `A` 。
 *
 */
export type Head<X extends readonly any[]> = ((...args: X) => any) extends (arg: infer U, ...rest: any[]) => any ? U : never;

/**
 * Extracts the tail of a tuple.
 * If you declare `Tail<[A, B, C]>` you will get back `[B, C]`.
 *
 * 提取元组的尾部。如果你声明 `Tail<[A, B, C]>` 你将返回 `[B, C]` 。
 *
 */
export type Tail<X extends readonly any[]> = ((...args: X) => any) extends (arg: any, ...rest: infer U) => any ? U : never;

/**
 * Extracts the generic value from an Array type.
 * If you have `T extends Array<any>`, and pass a `string[]` to it,
 * `ValueFromArray<T>` will return the actual type of `string`.
 *
 * 从 Array 类型中提取泛型值。如果你有 `T extends Array<any>` 并将 `string[]` 传递给它， `ValueFromArray<T>` 将返回 `string` 的实际类型。
 *
 */
export type ValueFromArray<A extends readonly unknown[]> = A extends Array<infer T> ? T : never;

/**
 * Gets the value type from an {@link ObservableNotification}, if possible.
 *
 * 如果可能，从 {@link ObservableNotification} 获取值类型。
 *
 */
export type ValueFromNotification<T> = T extends { kind: 'N' | 'E' | 'C' }
  ? T extends NextNotification<any>
    ? T extends { value: infer V }
      ? V
      : undefined
    : never
  : never;

/**
 * A simple type to represent a gamut of "falsy" values... with a notable exception:
 * `NaN` is "falsy" however, it is not and cannot be typed via TypeScript. See
 * comments here: <https://github.com/microsoft/TypeScript/issues/28682#issuecomment-707142417>
 *
 * 一种表示“虚假”值域的简单类型......有一个明显的例外： `NaN` 是“虚假”但是，它不是也不能通过 TypeScript 输入。在此处查看评论： [https](https://github.com/microsoft/TypeScript/issues/28682#issuecomment-707142417) ://github.com/microsoft/TypeScript/issues/28682#issuecomment-707142417
 *
 */
export type Falsy = null | undefined | false | 0 | -0 | 0n | '';

export type TruthyTypesOf<T> = T extends Falsy ? never : T;

// We shouldn't rely on this type definition being available globally yet since it's
// not necessarily available in every TS environment.
interface ReadableStreamDefaultReaderLike<T> {
  // HACK: As of TS 4.2.2, The provided types for the iterator results of a `ReadableStreamDefaultReader`
  // are significantly different enough from `IteratorResult` as to cause compilation errors.
  // The type at the time is `ReadableStreamDefaultReadResult`.
  read(): PromiseLike<
    | {
        done: false;
        value: T;
      }
    | { done: true; value?: undefined }
  >;
  releaseLock(): void;
}

/**
 * The base signature RxJS will look for to identify and use
 * a [ReadableStream](https://streams.spec.whatwg.org/#rs-class)
 * as an {@link ObservableInput} source.
 *
 * 基本签名 RxJS 将寻找识别和使用[ReadableStream](https://streams.spec.whatwg.org/#rs-class)作为 {@link ObservableInput} 源。
 *
 */
export interface ReadableStreamLike<T> {
  getReader(): ReadableStreamDefaultReaderLike<T>;
}

/**
 * An observable with a `connect` method that is used to create a subscription
 * to an underlying source, connecting it with all consumers via a multicast.
 *
 * 一个带有 `connect` 方法的可观察对象，用于创建对底层源的订阅，通过多播将其与所有消费者连接。
 *
 */
export interface Connectable<T> extends Observable<T> {
  /**
   * (Idempotent) Calling this method will connect the underlying source observable to all subscribed consumers
   * through an underlying {@link Subject}.
   *
   * （幂等）调用此方法将通过底层 {@link Subject} 将底层可观察源连接到所有订阅的消费者。
   *
   * @returns A subscription, that when unsubscribed, will "disconnect" the source from the connector subject,
   * severing notifications to all consumers.
   *
   * 取消订阅时，订阅将“断开”源与连接器主题的连接，将通知切断给所有消费者。
   *
   */
  connect(): Subscription;
}
