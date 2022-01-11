import { ConnectableObservable } from '../observable/ConnectableObservable';
import { Subscription } from '../Subscription';
import { MonoTypeOperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Make a {@link ConnectableObservable} behave like a ordinary observable and automates the way
 * you can connect to it.
 *
 * 使 {@link ConnectableObservable} 表现得像一个普通的 observable 并自动化你可以连接到它的方式。
 *
 * Internally it counts the subscriptions to the observable and subscribes (only once) to the source if
 * the number of subscriptions is larger than 0. If the number of subscriptions is smaller than 1, it
 * unsubscribes from the source. This way you can make sure that everything before the *published*
 * refCount has only a single subscription independently of the number of subscribers to the target
 * observable.
 *
 * 在内部，它计算对 observable 的订阅，如果订阅数大于 0，则订阅（仅一次）源。如果订阅数小于 1，则从源取消订阅。这样，你可以确保*发布*的 refCount 之前的所有内容都只有一个订阅，而与目标 observable 的订阅者数量无关。
 *
 * Note that using the {@link share} operator is exactly the same as using the `multicast(() => new Subject())` operator
 * (making the observable hot) and the *refCount* operator in a sequence.
 *
 * 请注意，使用 {@link share} 操作符与使用 `multicast(() => new Subject())` 操作符（使 observable 变热）和*refCount*操作符的顺序完全相同。
 *
 * ![](refCount.png)
 *
 * ## Example
 *
 * ## 例子
 *
 * In the following example there are two intervals turned into connectable observables
 * by using the *publish* operator. The first one uses the *refCount* operator, the
 * second one does not use it. You will notice that a connectable observable does nothing
 * until you call its connect function.
 *
 * 在下面的示例中，使用*发布*操作符将两个区间转换为可连接的 observable。第一个使用*refCount*操作符，第二个不使用它。你会注意到一个可连接的 observable 在你调用它的 connect 函数之前什么都不做。
 *
 * ```ts
 * import { interval, tap, publish, refCount } from 'rxjs';
 *
 * // Turn the interval observable into a ConnectableObservable (hot)
 * const refCountInterval = interval(400).pipe(
 *   tap(num => console.log(`refCount ${ num }`)),
 *   publish(),
 *   refCount()
 * );
 *
 * const publishedInterval = interval(400).pipe(
 *   tap(num => console.log(`publish ${ num }`)),
 *   publish()
 * );
 *
 * refCountInterval.subscribe();
 * refCountInterval.subscribe();
 * // 'refCount 0' -----> 'refCount 1' -----> etc
 * // All subscriptions will receive the same value and the tap (and
 * // every other operator) before the `publish` operator will be executed
 * // only once per event independently of the number of subscriptions.
 *
 * publishedInterval.subscribe();
 * // Nothing happens until you call .connect() on the observable.
 * ```
 * @return A function that returns an Observable that automates the connection
 * to ConnectableObservable.
 *
 * 返回可自动连接到 ConnectableObservable 的 Observable 的函数。
 *
 * @see {@link ConnectableObservable}
 * @see {@link share}
 * @see {@link publish}
 * @deprecated Replaced with the {@link share} operator. How `share` is used
 * will depend on the connectable observable you created just prior to the
 * `refCount` operator.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 替换为 {@link share} 操作符。如何使用 `share` 取决于你在 `refCount` 操作符之前创建的可连接 observable。详细信息： <https://rxjs.dev/deprecations/multicasting>
 *
 */
export function refCount<T>(): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let connection: Subscription | null = null;

    (source as any)._refCount++;

    const refCounter = new OperatorSubscriber(subscriber, undefined, undefined, undefined, () => {
      if (!source || (source as any)._refCount <= 0 || 0 < --(source as any)._refCount) {
        connection = null;
        return;
      }

      ///
      // Compare the local RefCountSubscriber's connection Subscription to the
      // connection Subscription on the shared ConnectableObservable. In cases
      // where the ConnectableObservable source synchronously emits values, and
      // the RefCountSubscriber's downstream Observers synchronously unsubscribe,
      // execution continues to here before the RefCountOperator has a chance to
      // supply the RefCountSubscriber with the shared connection Subscription.
      // For example:
      // ```
      // range(0, 10).pipe(
      //   publish(),
      //   refCount(),
      //   take(5),
      // )
      // .subscribe();
      // ```
      // In order to account for this case, RefCountSubscriber should only dispose
      // the ConnectableObservable's shared connection Subscription if the
      // connection Subscription exists, *and* either:
      //   a. RefCountSubscriber doesn't have a reference to the shared connection
      //      Subscription yet, or,
      //   b. RefCountSubscriber's connection Subscription reference is identical
      //      to the shared connection Subscription
      ///

      const sharedConnection = (source as any)._connection;
      const conn = connection;
      connection = null;

      if (sharedConnection && (!conn || sharedConnection === conn)) {
        sharedConnection.unsubscribe();
      }

      subscriber.unsubscribe();
    });

    source.subscribe(refCounter);

    if (!refCounter.closed) {
      connection = (source as ConnectableObservable<T>).connect();
    }
  });
}
