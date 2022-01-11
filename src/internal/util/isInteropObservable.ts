import { InteropObservable } from '../types';
import { observable as Symbol_observable } from '../symbol/observable';
import { isFunction } from './isFunction';

/**
 * Identifies an input as being Observable (but not necessary an Rx Observable)
 *
 * 识别某个输入标识是否为 Observable（但不一定是 Rx  Observable）
 *
 */
export function isInteropObservable(input: any): input is InteropObservable<any> {
  return isFunction(input[Symbol_observable]);
}
