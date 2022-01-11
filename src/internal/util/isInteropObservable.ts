import { InteropObservable } from '../types';
import { observable as Symbol_observable } from '../symbol/observable';
import { isFunction } from './isFunction';

/**
 * Identifies an input as being Observable (but not necessary an Rx Observable)
 *
 * 将输入标识为可观察者（但不一定是 Rx 可观察者）
 *
 */
export function isInteropObservable(input: any): input is InteropObservable<any> {
  return isFunction(input[Symbol_observable]);
}
