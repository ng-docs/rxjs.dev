let nextHandle = 1;
// The promise needs to be created lazily otherwise it won't be patched by Zones
let resolved: Promise<any>;
const activeHandles: { [key: number]: any } = {};

/**
 * Finds the handle in the list of active handles, and removes it.
 * Returns `true` if found, `false` otherwise. Used both to clear
 * Immediate scheduled tasks, and to identify if a task should be scheduled.
 *
 * 在活动处理器列表中查找某个处理器，并将其删除。如果找到则返回 `true`，否则返回 `false`。既用于清除立即安排的任务，也用于确定是否应该安排某个任务。
 *
 */
function findAndClearHandle(handle: number): boolean {
  if (handle in activeHandles) {
    delete activeHandles[handle];
    return true;
  }
  return false;
}

/**
 * Helper functions to schedule and unschedule microtasks.
 *
 * 来调度和取消调度微任务的辅助函数。
 *
 */
export const Immediate = {
  setImmediate(cb: () => void): number {
    const handle = nextHandle++;
    activeHandles[handle] = true;
    if (!resolved) {
      resolved = Promise.resolve();
    }
    resolved.then(() => findAndClearHandle(handle) && cb());
    return handle;
  },

  clearImmediate(handle: number): void {
    findAndClearHandle(handle);
  },
};

/**
 * Used for internal testing purposes only. Do not export from library.
 *
 * 仅用于内部测试目的。不要从库中导出。
 *
 */
export const TestTools = {
  pending() {
    return Object.keys(activeHandles).length;
  },
};
