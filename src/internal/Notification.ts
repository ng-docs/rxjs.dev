import { PartialObserver, ObservableNotification, CompleteNotification, NextNotification, ErrorNotification } from './types';
import { Observable } from './Observable';
import { EMPTY } from './observable/empty';
import { of } from './observable/of';
import { throwError } from './observable/throwError';
import { isFunction } from './util/isFunction';

// TODO: When this enum is removed, replace it with a type alias. See #4556.
/**
 * @deprecated Use a string literal instead. `NotificationKind` will be replaced with a type alias in v8.
 * It will not be replaced with a const enum as those are not compatible with isolated modules.
 *
 * 请改用字符串文字。`NotificationKind` 在 v8 中将被替换为类型别名。它不会被 const 枚举替换，因为它们与隔离模块不兼容。
 *
 */
export enum NotificationKind {
  NEXT = 'N',
  ERROR = 'E',
  COMPLETE = 'C',
}

/**
 * Represents a push-based event or value that an {@link Observable} can emit.
 * This class is particularly useful for operators that manage notifications,
 * like {@link materialize}, {@link dematerialize}, {@link observeOn}, and
 * others. Besides wrapping the actual delivered value, it also annotates it
 * with metadata of, for instance, what type of push message it is (`next`,
 * `error`, or `complete`).
 *
 * 表示 {@link Observable} 可以发出的基于推送的事件或值。此类对于管理通知的运算符特别有用，例如 {@link materialize}、{@link dematerialize}、{@link observeOn} 等。除了包装实际交付的值之外，它还使用元数据对其进行注释，例如，它是什么类型的推送消息（`next`、`error` 或 `complete`）。
 *
 * @see {@link materialize}
 * @see {@link dematerialize}
 * @see {@link observeOn}
 * @deprecated It is NOT recommended to create instances of `Notification` directly.
 * Rather, try to create POJOs matching the signature outlined in {@link ObservableNotification}.
 * For example: `{ kind: 'N', value: 1 }`, `{ kind: 'E', error: new Error('bad') }`, or `{ kind: 'C' }`.
 * Will be removed in v8.
 *
 * 不建议直接创建 `Notification` 实例。相反，尝试创建与 {@link ObservableNotification} 中概述的签名匹配的 POJO。例如： `{ kind: 'N', value: 1 }` , `{ kind: 'E', error: new Error('bad') }` 或 `{ kind: 'C' }`。将在 v8 中删除。
 *
 */
export class Notification<T> {
  /**
   * A value signifying that the notification will "next" if observed. In truth,
   * This is really synonymous with just checking `kind === "N"`.
   *
   * 一个值，表示如果观察到通知将“下一个”。事实上，这实际上是检查 `kind === "N"` 的同义词。
   *
   * @deprecated Will be removed in v8. Instead, just check to see if the value of `kind` is `"N"`.
   *
   * 将在 v8 中删除。相反，只需检查 `kind` 的值是否为 `"N"`。
   *
   */
  readonly hasValue: boolean;

  /**
   * Creates a "Next" notification object.
   *
   * 创建一个“下一个”通知对象。
   *
   * @param kind Always `'N'`
   *
   * 总是 `'N'`
   *
   * @param value The value to notify with if observed.
   *
   * 如果观察到，则通知的值。
   *
   * @deprecated Internal implementation detail. Use {@link Notification#createNext createNext} instead.
   *
   * 内部实现细节。请改用 {@link Notification#createNext createNext}。
   *
   */
  constructor(kind: 'N', value?: T);
  /**
   * Creates an "Error" notification object.
   *
   * 创建一个“错误”通知对象。
   *
   * @param kind Always `'E'`
   *
   * 总是 `'E'`
   *
   * @param value Always `undefined`
   *
   * 始终 `undefined`
   *
   * @param error The error to notify with if observed.
   *
   * 如果观察到要通知的错误。
   *
   * @deprecated Internal implementation detail. Use {@link Notification#createError createError} instead.
   *
   * 内部实现细节。请改用 {@link Notification#createError createError}。
   *
   */
  constructor(kind: 'E', value: undefined, error: any);
  /**
   * Creates a "completion" notification object.
   *
   * 创建一个“完成”通知对象。
   *
   * @param kind Always `'C'`
   *
   * 总是 `'C'`
   *
   * @deprecated Internal implementation detail. Use {@link Notification#createComplete createComplete} instead.
   *
   * 内部实现细节。请改用 {@link Notification#createComplete createComplete}。
   *
   */
  constructor(kind: 'C');
  constructor(public readonly kind: 'N' | 'E' | 'C', public readonly value?: T, public readonly error?: any) {
    this.hasValue = kind === 'N';
  }

  /**
   * Executes the appropriate handler on a passed `observer` given the `kind` of notification.
   * If the handler is missing it will do nothing. Even if the notification is an error, if
   * there is no error handler on the observer, an error will not be thrown, it will noop.
   *
   * 在给定通知 `kind` 的传递的 `observer` 上执行适当的处理程序。如果处理程序丢失，它将什么也不做。即使通知是错误的，如果观察者上没有错误处理程序，也不会抛出错误，它会 noop。
   *
   * @param observer The observer to notify.
   *
   * 通知的观察者。
   *
   */
  observe(observer: PartialObserver<T>): void {
    return observeNotification(this as ObservableNotification<T>, observer);
  }

  /**
   * Executes a notification on the appropriate handler from a list provided.
   * If a handler is missing for the kind of notification, nothing is called
   * and no error is thrown, it will be a noop.
   *
   * 从提供的列表中对适当的处理程序执行通知。如果缺少通知类型的处理程序，则不调用任何内容并且不引发错误，这将是一个 noop。
   *
   * @param next A next handler
   *
   * 下一个处理程序
   *
   * @param error An error handler
   *
   * 错误处理程序
   *
   * @param complete A complete handler
   *
   * 一个完整的处理程序
   *
   * @deprecated Replaced with {@link Notification#observe observe}. Will be removed in v8.
   *
   * 替换为 {@link Notification#observe observe}。将在 v8 中删除。
   *
   */
  do(next: (value: T) => void, error: (err: any) => void, complete: () => void): void;
  /**
   * Executes a notification on the appropriate handler from a list provided.
   * If a handler is missing for the kind of notification, nothing is called
   * and no error is thrown, it will be a noop.
   *
   * 从提供的列表中对适当的处理程序执行通知。如果缺少通知类型的处理程序，则不调用任何内容并且不引发错误，这将是一个 noop。
   *
   * @param next A next handler
   *
   * 下一个处理程序
   *
   * @param error An error handler
   *
   * 错误处理程序
   *
   * @deprecated Replaced with {@link Notification#observe observe}. Will be removed in v8.
   *
   * 替换为 {@link Notification#observe observe}。将在 v8 中删除。
   *
   */
  do(next: (value: T) => void, error: (err: any) => void): void;
  /**
   * Executes the next handler if the Notification is of `kind` `"N"`. Otherwise
   * this will not error, and it will be a noop.
   *
   * 如果 Notification `kind` 为 `"N"`，则执行下一个处理程序。否则这不会出错，而且会是一个 noop。
   *
   * @param next The next handler
   *
   * 下一个处理程序
   *
   * @deprecated Replaced with {@link Notification#observe observe}. Will be removed in v8.
   *
   * 替换为 {@link Notification#observe observe}。将在 v8 中删除。
   *
   */
  do(next: (value: T) => void): void;
  do(nextHandler: (value: T) => void, errorHandler?: (err: any) => void, completeHandler?: () => void): void {
    const { kind, value, error } = this;
    return kind === 'N' ? nextHandler?.(value!) : kind === 'E' ? errorHandler?.(error) : completeHandler?.();
  }

  /**
   * Executes a notification on the appropriate handler from a list provided.
   * If a handler is missing for the kind of notification, nothing is called
   * and no error is thrown, it will be a noop.
   *
   * 从提供的列表中对适当的处理程序执行通知。如果缺少通知类型的处理程序，则不调用任何内容并且不引发错误，这将是一个 noop。
   *
   * @param next A next handler
   *
   * 下一个处理程序
   *
   * @param error An error handler
   *
   * 错误处理程序
   *
   * @param complete A complete handler
   *
   * 一个完整的处理程序
   *
   * @deprecated Replaced with {@link Notification#observe observe}. Will be removed in v8.
   *
   * 替换为 {@link Notification#observe observe}。将在 v8 中删除。
   *
   */
  accept(next: (value: T) => void, error: (err: any) => void, complete: () => void): void;
  /**
   * Executes a notification on the appropriate handler from a list provided.
   * If a handler is missing for the kind of notification, nothing is called
   * and no error is thrown, it will be a noop.
   *
   * 从提供的列表中对适当的处理程序执行通知。如果缺少通知类型的处理程序，则不调用任何内容并且不引发错误，这将是一个 noop。
   *
   * @param next A next handler
   *
   * 下一个处理程序
   *
   * @param error An error handler
   *
   * 错误处理程序
   *
   * @deprecated Replaced with {@link Notification#observe observe}. Will be removed in v8.
   *
   * 替换为 {@link Notification#observe observe}。将在 v8 中删除。
   *
   */
  accept(next: (value: T) => void, error: (err: any) => void): void;
  /**
   * Executes the next handler if the Notification is of `kind` `"N"`. Otherwise
   * this will not error, and it will be a noop.
   *
   * 如果 Notification `kind` 为 `"N"`，则执行下一个处理程序。否则这不会出错，而且会是一个 noop。
   *
   * @param next The next handler
   *
   * 下一个处理程序
   *
   * @deprecated Replaced with {@link Notification#observe observe}. Will be removed in v8.
   *
   * 替换为 {@link Notification#observe observe}。将在 v8 中删除。
   *
   */
  accept(next: (value: T) => void): void;

  /**
   * Executes the appropriate handler on a passed `observer` given the `kind` of notification.
   * If the handler is missing it will do nothing. Even if the notification is an error, if
   * there is no error handler on the observer, an error will not be thrown, it will noop.
   *
   * 在给定通知 `kind` 的传递的 `observer` 上执行适当的处理程序。如果处理程序丢失，它将什么也不做。即使通知是错误的，如果观察者上没有错误处理程序，也不会抛出错误，它会 noop。
   *
   * @param observer The observer to notify.
   *
   * 通知的观察者。
   *
   * @deprecated Replaced with {@link Notification#observe observe}. Will be removed in v8.
   *
   * 替换为 {@link Notification#observe observe}。将在 v8 中删除。
   *
   */
  accept(observer: PartialObserver<T>): void;
  accept(nextOrObserver: PartialObserver<T> | ((value: T) => void), error?: (err: any) => void, complete?: () => void) {
    return isFunction((nextOrObserver as any)?.next)
      ? this.observe(nextOrObserver as PartialObserver<T>)
      : this.do(nextOrObserver as (value: T) => void, error as any, complete as any);
  }

  /**
   * Returns a simple Observable that just delivers the notification represented
   * by this Notification instance.
   *
   * 返回一个简单的 Observable，它只传递此 Notification 实例表示的通知。
   *
   * @deprecated Will be removed in v8. To convert a `Notification` to an {@link Observable},
   * use {@link of} and {@link dematerialize}: `of(notification).pipe(dematerialize())`.
   *
   * 将在 v8 中删除。要将 `Notification` 转换为 {@link Observable}，请使用 {@link of} 和 {@link dematerialize}: `of(notification).pipe(dematerialize())`。
   *
   */
  toObservable(): Observable<T> {
    const { kind, value, error } = this;
    // Select the observable to return by `kind`
    const result =
      kind === 'N'
        ? // Next kind. Return an observable of that value.
          of(value!)
        : //
        kind === 'E'
        ? // Error kind. Return an observable that emits the error.
          throwError(() => error)
        : //
        kind === 'C'
        ? // Completion kind. Kind is "C", return an observable that just completes.
          EMPTY
        : // Unknown kind, return falsy, so we error below.
          0;
    if (!result) {
      // TODO: consider removing this check. The only way to cause this would be to
      // use the Notification constructor directly in a way that is not type-safe.
      // and direct use of the Notification constructor is deprecated.
      throw new TypeError(`Unexpected notification kind ${kind}`);
    }
    return result;
  }

  private static completeNotification = new Notification('C') as Notification<never> & CompleteNotification;
  /**
   * A shortcut to create a Notification instance of the type `next` from a
   * given value.
   *
   * 从给定值创建 `next` 类型的 Notification 实例的快捷方式。
   *
   * @param {T} value The `next` value.
   *
   * `next` 值。
   *
   * @return {Notification<T>} The "next" Notification representing the
   * argument.
   *
   * 表示参数的“下一个”通知。
   *
   * @nocollapse
   * @deprecated It is NOT recommended to create instances of `Notification` directly.
   * Rather, try to create POJOs matching the signature outlined in {@link ObservableNotification}.
   * For example: `{ kind: 'N', value: 1 }`, `{ kind: 'E', error: new Error('bad') }`, or `{ kind: 'C' }`.
   * Will be removed in v8.
   *
   * 不建议直接创建 `Notification` 实例。相反，尝试创建与 {@link ObservableNotification} 中概述的签名匹配的 POJO。例如： `{ kind: 'N', value: 1 }` , `{ kind: 'E', error: new Error('bad') }` 或 `{ kind: 'C' }`。将在 v8 中删除。
   *
   */
  static createNext<T>(value: T) {
    return new Notification('N', value) as Notification<T> & NextNotification<T>;
  }

  /**
   * A shortcut to create a Notification instance of the type `error` from a
   * given error.
   *
   * 从给定错误创建类型 `error` 的通知实例的快捷方式。
   *
   * @param {any} [err] The `error` error.
   * @return {Notification<T>} The "error" Notification representing the
   * argument.
   *
   * 表示参数的“错误”通知。
   *
   * @nocollapse
   * @deprecated It is NOT recommended to create instances of `Notification` directly.
   * Rather, try to create POJOs matching the signature outlined in {@link ObservableNotification}.
   * For example: `{ kind: 'N', value: 1 }`, `{ kind: 'E', error: new Error('bad') }`, or `{ kind: 'C' }`.
   * Will be removed in v8.
   *
   * 不建议直接创建 `Notification` 实例。相反，尝试创建与 {@link ObservableNotification} 中概述的签名匹配的 POJO。例如： `{ kind: 'N', value: 1 }` , `{ kind: 'E', error: new Error('bad') }` 或 `{ kind: 'C' }`。将在 v8 中删除。
   *
   */
  static createError(err?: any) {
    return new Notification('E', undefined, err) as Notification<never> & ErrorNotification;
  }

  /**
   * A shortcut to create a Notification instance of the type `complete`.
   *
   * 创建 `complete` 类型的 Notification 实例的快捷方式。
   *
   * @return {Notification<any>} The valueless "complete" Notification.
   *
   * 毫无价值的“完成”通知。
   *
   * @nocollapse
   * @deprecated It is NOT recommended to create instances of `Notification` directly.
   * Rather, try to create POJOs matching the signature outlined in {@link ObservableNotification}.
   * For example: `{ kind: 'N', value: 1 }`, `{ kind: 'E', error: new Error('bad') }`, or `{ kind: 'C' }`.
   * Will be removed in v8.
   *
   * 不建议直接创建 `Notification` 实例。相反，尝试创建与 {@link ObservableNotification} 中概述的签名匹配的 POJO。例如： `{ kind: 'N', value: 1 }` , `{ kind: 'E', error: new Error('bad') }` 或 `{ kind: 'C' }`。将在 v8 中删除。
   *
   */
  static createComplete(): Notification<never> & CompleteNotification {
    return Notification.completeNotification;
  }
}

/**
 * Executes the appropriate handler on a passed `observer` given the `kind` of notification.
 * If the handler is missing it will do nothing. Even if the notification is an error, if
 * there is no error handler on the observer, an error will not be thrown, it will noop.
 *
 * 在给定通知 `kind` 的传递的 `observer` 上执行适当的处理程序。如果处理程序丢失，它将什么也不做。即使通知是错误的，如果观察者上没有错误处理程序，也不会抛出错误，它会 noop。
 *
 * @param notification The notification object to observe.
 *
 * 要观察的通知对象。
 *
 * @param observer The observer to notify.
 *
 * 通知的观察者。
 *
 */
export function observeNotification<T>(notification: ObservableNotification<T>, observer: PartialObserver<T>) {
  const { kind, value, error } = notification as any;
  if (typeof kind !== 'string') {
    throw new TypeError('Invalid notification, missing "kind"');
  }
  kind === 'N' ? observer.next?.(value!) : kind === 'E' ? observer.error?.(error) : observer.complete?.();
}
