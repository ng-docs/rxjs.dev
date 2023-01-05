import { PartialObserver, ObservableNotification } from './types';

/**
 * Executes the appropriate handler on a passed `observer` given the `kind` of notification.
 * If the handler is missing it will do nothing. Even if the notification is an error, if
 * there is no error handler on the observer, an error will not be thrown, it will noop.
 *
 * 在给定 `kind` 的通知上执行 `observer` 中传入的适当处理器。如果缺少处理器，它将什么也不做。即使此通知是错误，如果此 Observer 上没有错误处理器，也不会抛出错误，相当于 noop。
 *
 * @param notification The notification object to observe.
 *
 * 要观察的通知对象。
 *
 * @param observer The observer to notify.
 *
 * 要通知的 Observer。
 *
 */
export function observeNotification<T>(notification: ObservableNotification<T>, observer: PartialObserver<T>) {
  const { kind, value, error } = notification as any;
  if (typeof kind !== 'string') {
    throw new TypeError('Invalid notification, missing "kind"');
  }
  kind === 'N' ? observer.next?.(value!) : kind === 'E' ? observer.error?.(error) : observer.complete?.();
}
