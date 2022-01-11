import { iterator as Symbol_iterator } from '../symbol/iterator';
import { isFunction } from './isFunction';

/**
 * Identifies an input as being an Iterable
 *
 * 识别某个输入是否为 Iterable
 *
 */
export function isIterable(input: any): input is Iterable<any> {
  return isFunction(input?.[Symbol_iterator]);
}
