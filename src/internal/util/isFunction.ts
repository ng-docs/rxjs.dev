/**
 * Returns true if the object is a function.
 *
 * 如果对象是函数，则返回 true。
 *
 * @param value The value to check
 *
 * 要检查的值
 *
 */
export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function';
}
