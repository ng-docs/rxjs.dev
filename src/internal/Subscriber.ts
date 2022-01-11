import { isFunction } from './util/isFunction';
import { Observer, ObservableNotification } from './types';
import { isSubscription, Subscription } from './Subscription';
import { config } from './config';
import { reportUnhandledError } from './util/reportUnhandledError';
import { noop } from './util/noop';
import { nextNotification, errorNotification, COMPLETE_NOTIFICATION } from './NotificationFactories';
import { timeoutProvider } from './scheduler/timeoutProvider';
import { captureError } from './util/errorContext';

/**
 * Implements the {@link Observer} interface and extends the
 * {@link Subscription} class. While the {@link Observer} is the public API for
 * consuming the values of an {@link Observable}, all Observers get converted to
 * a Subscriber, in order to provide Subscription-like capabilities such as
 * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for
 * implementing operators, but it is rarely used as a public API.
 *
 * 实现 {@link Observer} 接口并扩展 {@link Subscription} 类。虽然 {@link Observer} 是用于使用 {@link Observable} 值的公共 API，但所有 Observers 都被转换为订阅者，以提供类似订阅的功能，例如 `unsubscribe`。订阅者是 RxJS 中的一种常见类型，对于实现操作符至关重要，但它很少用作公共 API。
 *
 * @class Subscriber<T>
 */
export class Subscriber<T> extends Subscription implements Observer<T> {
  /**
   * A static factory for a Subscriber, given a (potentially partial) definition
   * of an Observer.
   *
   * 订阅者的静态工厂，给定观察者的（可能部分）定义。
   *
   * @param next The `next` callback of an Observer.
   *
   * 观察者的 `next` 回调。
   *
   * @param error The `error` callback of an
   * Observer.
   *
   * 观察者的 `error` 回调。
   *
   * @param complete The `complete` callback of an
   * Observer.
   *
   * 观察者的 `complete` 回调。
   *
   * @return A Subscriber wrapping the (partially defined)
   * Observer represented by the given arguments.
   *
   * 包装由给定参数表示的（部分定义的）观察者的订阅者。
   *
   * @nocollapse
   * @deprecated Do not use. Will be removed in v8. There is no replacement for this
   * method, and there is no reason to be creating instances of `Subscriber` directly.
   * If you have a specific use case, please file an issue.
   *
   * 不使用。将在 v8 中删除。这种方法没有替代品，也没有理由直接创建 `Subscriber` 的实例。如果你有特定的用例，请提出问题。
   *
   */
  static create<T>(next?: (x?: T) => void, error?: (e?: any) => void, complete?: () => void): Subscriber<T> {
    return new SafeSubscriber(next, error, complete);
  }

  /**
   * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
   *
   * 内部实现细节，请勿直接使用。将在 v8 中内部化。
   *
   */
  protected isStopped: boolean = false;
  /**
   * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
   *
   * 内部实现细节，请勿直接使用。将在 v8 中内部化。
   *
   */
  protected destination: Subscriber<any> | Observer<any>; // this `any` is the escape hatch to erase extra type param (e.g. R)

  /**
   * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
   * There is no reason to directly create an instance of Subscriber. This type is exported for typings reasons.
   *
   * 内部实现细节，请勿直接使用。将在 v8 中内部化。没有理由直接创建订阅者的实例。出于打字原因导出此类型。
   *
   */
  constructor(destination?: Subscriber<any> | Observer<any>) {
    super();
    if (destination) {
      this.destination = destination;
      // Automatically chain subscriptions together here.
      // if destination is a Subscription, then it is a Subscriber.
      if (isSubscription(destination)) {
        destination.add(this);
      }
    } else {
      this.destination = EMPTY_OBSERVER;
    }
  }

  /**
   * The {@link Observer} callback to receive notifications of type `next` from
   * the Observable, with a value. The Observable may call this method 0 or more
   * times.
   *
   * {@link Observer} 回调，用于接收来自 Observable 的 `next` 类型的通知，带有一个值。Observable 可能会调用此方法 0 次或更多次。
   *
   * @param {T} [value] The `next` value.
   * @return {void}
   */
  next(value?: T): void {
    if (this.isStopped) {
      handleStoppedNotification(nextNotification(value), this);
    } else {
      this._next(value!);
    }
  }

  /**
   * The {@link Observer} callback to receive notifications of type `error` from
   * the Observable, with an attached `Error`. Notifies the Observer that
   * the Observable has experienced an error condition.
   *
   * {@link Observer} 回调从 Observable 接收类型 `error` 的通知，并附加 `Error`。通知 Observer Observable 遇到了错误情况。
   *
   * @param {any} [err] The `error` exception.
   * @return {void}
   */
  error(err?: any): void {
    if (this.isStopped) {
      handleStoppedNotification(errorNotification(err), this);
    } else {
      this.isStopped = true;
      this._error(err);
    }
  }

  /**
   * The {@link Observer} callback to receive a valueless notification of type
   * `complete` from the Observable. Notifies the Observer that the Observable
   * has finished sending push-based notifications.
   *
   * {@link Observer} 回调从 Observable 接收类型为 `complete` 的无值通知。通知 Observer Observable 已发送完基于推送的通知。
   *
   * @return {void}
   */
  complete(): void {
    if (this.isStopped) {
      handleStoppedNotification(COMPLETE_NOTIFICATION, this);
    } else {
      this.isStopped = true;
      this._complete();
    }
  }

  unsubscribe(): void {
    if (!this.closed) {
      this.isStopped = true;
      super.unsubscribe();
      this.destination = null!;
    }
  }

  protected _next(value: T): void {
    this.destination.next(value);
  }

  protected _error(err: any): void {
    try {
      this.destination.error(err);
    } finally {
      this.unsubscribe();
    }
  }

  protected _complete(): void {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  }
}

export class SafeSubscriber<T> extends Subscriber<T> {
  constructor(
    observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
    error?: ((e?: any) => void) | null,
    complete?: (() => void) | null
  ) {
    super();

    let next: ((value: T) => void) | undefined;
    if (isFunction(observerOrNext)) {
      // The first argument is a function, not an observer. The next
      // two arguments *could* be observers, or they could be empty.
      next = observerOrNext;
    } else if (observerOrNext) {
      // The first argument is an observer object, we have to pull the handlers
      // off and capture the owner object as the context. That is because we're
      // going to put them all in a new destination with ensured methods
      // for `next`, `error`, and `complete`. That's part of what makes this
      // the "Safe" Subscriber.
      ({ next, error, complete } = observerOrNext);
      let context: any;
      if (this && config.useDeprecatedNextContext) {
        // This is a deprecated path that made `this.unsubscribe()` available in
        // next handler functions passed to subscribe. This only exists behind a flag
        // now, as it is *very* slow.
        context = Object.create(observerOrNext);
        context.unsubscribe = () => this.unsubscribe();
      } else {
        context = observerOrNext;
      }
      next = next?.bind(context);
      error = error?.bind(context);
      complete = complete?.bind(context);
    }

    // Once we set the destination, the superclass `Subscriber` will
    // do it's magic in the `_next`, `_error`, and `_complete` methods.
    this.destination = {
      next: next ? wrapForErrorHandling(next, this) : noop,
      error: wrapForErrorHandling(error ?? defaultErrorHandler, this),
      complete: complete ? wrapForErrorHandling(complete, this) : noop,
    };
  }
}

/**
 * Wraps a user-provided handler (or our {@link defaultErrorHandler} in one case) to
 * ensure that any thrown errors are caught and handled appropriately.
 *
 * 包装用户提供的处理程序（或我们的 {@link defaultErrorHandler} 在一种情况下）以确保捕获并正确处理任何抛出的错误。
 *
 * @param handler The handler to wrap
 *
 * 要包装的处理程序
 *
 * @param instance The SafeSubscriber instance we're going to mark if there's an error.
 *
 * 如果出现错误，我们将标记的 SafeSubscriber 实例。
 *
 */
function wrapForErrorHandling(handler: (arg?: any) => void, instance: SafeSubscriber<any>) {
  return (...args: any[]) => {
    try {
      handler(...args);
    } catch (err) {
      if (config.useDeprecatedSynchronousErrorHandling) {
        captureError(err);
      } else {
        // Ideal path, we report this as an unhandled error,
        // which is thrown on a new call stack.
        reportUnhandledError(err);
      }
    }
  };
}
/**
 * An error handler used when no error handler was supplied
 * to the SafeSubscriber -- meaning no error handler was supplied
 * do the `subscribe` call on our observable.
 *
 * 当没有向 SafeSubscriber 提供错误处理程序时使用的错误处理程序——这意味着在我们的 observable 上进行 `subscribe` 调用时没有提供错误处理程序。
 *
 * @param err The error to handle
 *
 * 要处理的错误
 *
 */
function defaultErrorHandler(err: any) {
  throw err;
}

/**
 * A handler for notifications that cannot be sent to a stopped subscriber.
 *
 * 无法发送给已停止订阅者的通知的处理程序。
 *
 * @param notification The notification being sent
 *
 * 正在发送的通知
 *
 * @param subscriber The stopped subscriber
 *
 * 停止的订阅者
 *
 */
function handleStoppedNotification(notification: ObservableNotification<any>, subscriber: Subscriber<any>) {
  const { onStoppedNotification } = config;
  onStoppedNotification && timeoutProvider.setTimeout(() => onStoppedNotification(notification, subscriber));
}

/**
 * The observer used as a stub for subscriptions where the user did not
 * pass any arguments to `subscribe`. Comes with the default error handling
 * behavior.
 *
 * 观察者用作订阅的存根，其中用户没有将任何参数传递给 `subscribe`。带有默认的错误处理行为。
 *
 */
export const EMPTY_OBSERVER: Readonly<Observer<any>> & { closed: true } = {
  closed: true,
  next: noop,
  error: defaultErrorHandler,
  complete: noop,
};
