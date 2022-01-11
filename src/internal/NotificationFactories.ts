import { CompleteNotification, NextNotification, ErrorNotification } from './types';

/**
 * A completion object optimized for memory use and created to be the
 * same "shape" as other notifications in v8.
 *
 * 为内存使用优化的完成对象，并创建为与 v8 中的其他通知相同的“形状”。
 *
 * @internal
 */
export const COMPLETE_NOTIFICATION = (() => createNotification('C', undefined, undefined) as CompleteNotification)();

/**
 * Internal use only. Creates an optimized error notification that is the same "shape"
 * as other notifications.
 *
 * 限内部使用。创建与其他通知“形状”相同的优化错误通知。
 *
 * @internal
 */
export function errorNotification(error: any): ErrorNotification {
  return createNotification('E', undefined, error) as any;
}

/**
 * Internal use only. Creates an optimized next notification that is the same "shape"
 * as other notifications.
 *
 * 限内部使用。创建与其他通知“形状”相同的优化下一个通知。
 *
 * @internal
 */
export function nextNotification<T>(value: T) {
  return createNotification('N', value, undefined) as NextNotification<T>;
}

/**
 * Ensures that all notifications created internally have the same "shape" in v8.
 *
 * 确保内部创建的所有通知在 v8 中具有相同的“形状”。
 *
 * TODO: This is only exported to support a crazy legacy test in `groupBy`.
 *
 * TODO：这仅被导出以支持 `groupBy` 中的疯狂遗留测试。
 *
 * @internal
 */
export function createNotification(kind: 'N' | 'E' | 'C', value: any, error: any) {
  return {
    kind,
    value,
    error,
  };
}
