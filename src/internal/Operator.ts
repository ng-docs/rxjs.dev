import { Subscriber } from './Subscriber';
import { TeardownLogic } from './types';

/**
 * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
 *
 * 内部实现细节，请勿直接使用。将在 v8 中内部化。
 *
 */
export interface Operator<T, R> {
  call(subscriber: Subscriber<R>, source: any): TeardownLogic;
}
