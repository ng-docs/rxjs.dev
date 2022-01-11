import { config } from '../config';
import { timeoutProvider } from '../scheduler/timeoutProvider';

/**
 * Handles an error on another job either with the user-configured {@link onUnhandledError},
 * or by throwing it on that new job so it can be picked up by `window.onerror`, `process.on('error')`, etc.
 *
 * 使用用户配置的 {@link onUnhandledError} 处理另一个作业上的错误，或者将其扔到该新作业上，以便它可以被 `window.onerror`，`process.on('error')` 等拾取。
 *
 * This should be called whenever there is an error that is out-of-band with the subscription
 * or when an error hits a terminal boundary of the subscription and no error handler was provided.
 *
 * 每当订阅出现带外错误或错误到达订阅的终端边界且未提供错误处理程序时，都应调用此方法。
 *
 * @param err the error to report
 *
 * 要报告的错误
 *
 */
export function reportUnhandledError(err: any) {
  timeoutProvider.setTimeout(() => {
    const { onUnhandledError } = config;
    if (onUnhandledError) {
      // Execute the user-configured error handler.
      onUnhandledError(err);
    } else {
      // Throw so it is picked up by the runtime's uncaught error mechanism.
      throw err;
    }
  });
}
