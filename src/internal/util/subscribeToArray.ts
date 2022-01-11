import { Subscriber } from '../Subscriber';

/**
 * Subscribes to an ArrayLike with a subscriber
 *
 * 使用订阅者订阅 ArrayLike
 *
 * @param array The array or array-like to subscribe to
 *
 * 要订阅的数组或类似数组
 *
 */
export const subscribeToArray = <T>(array: ArrayLike<T>) => (subscriber: Subscriber<T>) => {
  for (let i = 0, len = array.length; i < len && !subscriber.closed; i++) {
    subscriber.next(array[i]);
  }
  subscriber.complete();
};
