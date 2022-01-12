import { Subscriber } from './Subscriber';
import { ObservableNotification } from './types';

/**
 * The {@link GlobalConfig} object for RxJS. It is used to configure things
 * like how to react on unhandled errors.
 *
 * RxJS 的 {@link GlobalConfig} 对象。它用于配置诸如如何对未处理的错误做出反应之类的事情。
 *
 */
export const config: GlobalConfig = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: undefined,
  useDeprecatedSynchronousErrorHandling: false,
  useDeprecatedNextContext: false,
};

/**
 * The global configuration object for RxJS, used to configure things
 * like how to react on unhandled errors. Accessible via {@link config}
 * object.
 *
 * RxJS 的全局配置对象，用于配置诸如如何对未处理的错误做出反应。可通过 {@link config} 对象访问。
 *
 */
export interface GlobalConfig {
  /**
   * A registration point for unhandled errors from RxJS. These are errors that
   * cannot were not handled by consuming code in the usual subscription path. For
   * example, if you have this configured, and you subscribe to an observable without
   * providing an error handler, errors from that subscription will end up here. This
   * will _always_ be called asynchronously on another job in the runtime. This is because
   * we do not want errors thrown in this user-configured handler to interfere with the
   * behavior of the library.
   *
   * 来自 RxJS 的未处理错误的注册点。这些错误不能通过在通常的订阅路径中使用代码来处理。例如，如果你配置了这个，并且你订阅了一个 observable 而没有提供错误处理程序，那么来自该订阅的错误将在这里结束。这将*始终*在运行时的另一个作业上异步调用。这是因为我们不希望在这个用户配置的处理程序中抛出的错误干扰库的行为。
   *
   */
  onUnhandledError: ((err: any) => void) | null;

  /**
   * A registration point for notifications that cannot be sent to subscribers because they
   * have completed, errored or have been explicitly unsubscribed. By default, next, complete
   * and error notifications sent to stopped subscribers are noops. However, sometimes callers
   * might want a different behavior. For example, with sources that attempt to report errors
   * to stopped subscribers, a caller can configure RxJS to throw an unhandled error instead.
   * This will _always_ be called asynchronously on another job in the runtime. This is because
   * we do not want errors thrown in this user-configured handler to interfere with the
   * behavior of the library.
   *
   * 由于已完成、出错或已明确取消订阅而无法发送给订阅者的通知的注册点。默认情况下，发送给停止订阅者的下一个、完成和错误通知是 noops。但是，有时调用者可能想要不同的行为。例如，对于尝试向停止的订阅者报告错误的源，调用者可以将 RxJS 配置为抛出未处理的错误。这将*始终*在运行时的另一个作业上异步调用。这是因为我们不希望在这个用户配置的处理程序中抛出的错误干扰库的行为。
   *
   */
  onStoppedNotification: ((notification: ObservableNotification<any>, subscriber: Subscriber<any>) => void) | null;

  /**
   * The promise constructor used by default for {@link Observable#toPromise toPromise} and {@link Observable#forEach forEach}
   * methods.
   *
   * 默认情况下用于 {@link Observable#toPromise toPromise} 和 {@link Observable#forEach forEach} 方法的 promise 构造函数。
   *
   * @deprecated As of version 8, RxJS will no longer support this sort of injection of a
   * Promise constructor. If you need a Promise implementation other than native promises,
   * please polyfill/patch Promise as you see appropriate. Will be removed in v8.
   *
   * 从版本 8 开始，RxJS 将不再支持这种 Promise 构造函数的注入。如果你需要原生 Promise 以外的 Promise 实现，请在你认为合适的时候填充/修补 Promise。将在 v8 中删除。
   *
   */
  Promise?: PromiseConstructorLike;

  /**
   * If true, turns on synchronous error rethrowing, which is a deprecated behavior
   * in v6 and higher. This behavior enables bad patterns like wrapping a subscribe
   * call in a try/catch block. It also enables producer interference, a nasty bug
   * where a multicast can be broken for all observers by a downstream consumer with
   * an unhandled error. DO NOT USE THIS FLAG UNLESS IT'S NEEDED TO BUY TIME
   * FOR MIGRATION REASONS.
   *
   * 如果为 true，则打开同步错误重新抛出，这是 v6 及更高版本中已弃用的行为。这种行为会导致不良模式，例如将订阅调用包装在 try/catch 块中。它还启用了生产者干扰，这是一个令人讨厌的错误，其中下游消费者可能会因未处理的错误而破坏所有观察者的多播。除非需要为迁移原因争取时间，否则请勿使用此标志。
   *
   * @deprecated As of version 8, RxJS will no longer support synchronous throwing
   * of unhandled errors. All errors will be thrown on a separate call stack to prevent bad
   * behaviors described above. Will be removed in v8.
   *
   * 从版本 8 开始，RxJS 将不再支持同步抛出未处理的错误。所有错误都将被抛出一个单独的调用堆栈，以防止上述不良行为。将在 v8 中删除。
   *
   */
  useDeprecatedSynchronousErrorHandling: boolean;

  /**
   * If true, enables an as-of-yet undocumented feature from v5: The ability to access
   * `unsubscribe()` via `this` context in `next` functions created in observers passed
   * to `subscribe`.
   *
   * 如果为 true，则启用 v5 中尚未记录的功能：在传递给 `subscribe` 的观察者中创建的 `next` 函数中通过 `this` 上下文访问 `unsubscribe()` 的能力。
   *
   * This is being removed because the performance was severely problematic, and it could also cause
   * issues when types other than POJOs are passed to subscribe as subscribers, as they will likely have
   * their `this` context overwritten.
   *
   * 之所以将其删除，是因为性能存在严重问题，并且当 POJO 以外的类型作为订阅者传递给订阅时，它也可能导致问题，因为它们 `this` 上下文可能会被覆盖。
   *
   * @deprecated As of version 8, RxJS will no longer support altering the
   * context of next functions provided as part of an observer to Subscribe. Instead,
   * you will have access to a subscription or a signal or token that will allow you to do things like
   * unsubscribe and test closed status. Will be removed in v8.
   *
   * 从版本 8 开始，RxJS 将不再支持更改作为订阅观察者的一部分提供的下一个函数的上下文。相反，你将有权访问订阅或信号或令牌，从而允许你执行取消订阅和测试关闭状态等操作。将在 v8 中删除。
   *
   */
  useDeprecatedNextContext: boolean;
}
