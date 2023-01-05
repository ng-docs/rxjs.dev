import { Subscriber } from './Subscriber';
import { ObservableNotification } from './types';

/**
 * The {@link GlobalConfig} object for RxJS. It is used to configure things
 * like how to react on unhandled errors.
 *
 * RxJS 的 {@link GlobalConfig} 对象。用于配置如何对未处理的错误做出响应之类等事项。
 *
 */
export const config: GlobalConfig = {
  onUnhandledError: null,
  onStoppedNotification: null,
};

/**
 * The global configuration object for RxJS, used to configure things
 * like how to react on unhandled errors. Accessible via {@link config}
 * object.
 *
 * RxJS 的全局配置对象，用于配置如何对未处理的错误做出响应。可通过 {@link config} 对象访问。
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
   * 来自 RxJS 的未处理错误的注册点。这些错误不能像寻常那样通过在订阅路径中使用代码等形式进行处理。例如，如果你配置了这个，并且你订阅了一个 observable 而没有提供错误处理器，那么来自该订阅的错误将在这里结束。这将*始终*在运行时的另一个作业上异步调用，因为我们不希望在这个用户配置的处理器中抛出的错误干扰本库的行为。
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
   * 由于已完成、出错或已明确退订而无法发送给订阅者的通知的注册点。默认情况下，发送给已停止订阅者的 next、complete 和 error 通知是 noops。但是，有时调用者可能想要不同的行为。例如，对于试图向已停止的订阅者报告错误的源，调用者可以将 RxJS 配置为抛出未处理的错误。这将*始终*在运行时的另一个作业上异步调用，因为我们不希望在这个用户配置的处理器中抛出的错误干扰本库的行为。
   *
   */
  onStoppedNotification: ((notification: ObservableNotification<any>, subscriber: Subscriber<any>) => void) | null;
}
