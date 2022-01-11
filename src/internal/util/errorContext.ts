import { config } from '../config';

let context: { errorThrown: boolean; error: any } | null = null;

/**
 * Handles dealing with errors for super-gross mode. Creates a context, in which
 * any synchronously thrown errors will be passed to {@link captureError}. Which
 * will record the error such that it will be rethrown after the call back is complete.
 * TODO: Remove in v8
 *
 * 处理超粗模式的错误。创建一个上下文，其中任何同步抛出的错误都将传递给 {@link captureError}。它将记录错误，以便在回调完成后重新抛出。 TODO：在 v8 中删除
 *
 * @param cb An immediately executed function.
 *
 * 立即执行的函数。
 *
 */
export function errorContext(cb: () => void) {
  if (config.useDeprecatedSynchronousErrorHandling) {
    const isRoot = !context;
    if (isRoot) {
      context = { errorThrown: false, error: null };
    }
    cb();
    if (isRoot) {
      const { errorThrown, error } = context!;
      context = null;
      if (errorThrown) {
        throw error;
      }
    }
  } else {
    // This is the general non-deprecated path for everyone that
    // isn't crazy enough to use super-gross mode (useDeprecatedSynchronousErrorHandling)
    cb();
  }
}

/**
 * Captures errors only in super-gross mode.
 *
 * 仅在超级粗略模式下捕获错误。
 *
 * @param err the error to capture
 *
 * 要捕获的错误
 *
 */
export function captureError(err: any) {
  if (config.useDeprecatedSynchronousErrorHandling && context) {
    context.errorThrown = true;
    context.error = err;
  }
}
