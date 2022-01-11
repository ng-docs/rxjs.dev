/** prettier */
import { Observable } from '../Observable';
import { isFunction } from './isFunction';

/**
 * Tests to see if the object is an RxJS {@link Observable}
 *
 * 测试对象是否为 RxJS {@link Observable}
 *
 * @param obj the object to test
 *
 * 测试的对象
 *
 */
export function isObservable(obj: any): obj is Observable<unknown> {
  // The !! is to ensure that this publicly exposed function returns
  // `false` if something like `null` or `0` is passed.
  return !!obj && (obj instanceof Observable || (isFunction(obj.lift) && isFunction(obj.subscribe)));
}
