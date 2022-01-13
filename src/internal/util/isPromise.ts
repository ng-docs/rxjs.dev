import { isFunction } from './isFunction';

/**
 * Tests to see if the object is "thennable".
 *
 * 测试此对象是否是为 “thennable”。
 *
 * @param value the object to test
 *
 * 要测试的对象
 *
 */
export function isPromise(value: any): value is PromiseLike<any> {
  return isFunction(value?.then);
}
