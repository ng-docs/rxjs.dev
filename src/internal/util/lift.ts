import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { OperatorFunction } from '../types';
import { isFunction } from './isFunction';

/**
 * Used to determine if an object is an Observable with a lift function.
 *
 * 用于确定一个对象是否是具有提升功能的 Observable。
 *
 */
export function hasLift(source: any): source is { lift: InstanceType<typeof Observable>['lift'] } {
  return isFunction(source?.lift);
}

/**
 * Creates an `OperatorFunction`. Used to define operators throughout the library in a concise way.
 *
 * 创建一个 `OperatorFunction`。用于以简洁的方式在整个库中定义操作符。
 *
 * @param init The logic to connect the liftedSource to the subscriber at the moment of subscription.
 *
 * 在订阅时将 liftedSource 连接到订阅者的逻辑。
 *
 */
export function operate<T, R>(
  init: (liftedSource: Observable<T>, subscriber: Subscriber<R>) => (() => void) | void
): OperatorFunction<T, R> {
  return (source: Observable<T>) => {
    if (hasLift(source)) {
      return source.lift(function (this: Subscriber<R>, liftedSource: Observable<T>) {
        try {
          return init(liftedSource, this);
        } catch (err) {
          this.error(err);
        }
      });
    }
    throw new TypeError('Unable to lift unknown Observable type');
  };
}
