import { Observable } from '../Observable';
import { AsyncSubject } from '../AsyncSubject';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { UnaryFunction } from '../types';

/**
 * Returns a connectable observable sequence that shares a single subscription to the
 * underlying sequence containing only the last notification.
 *
 * 返回一个可连接的可观察序列，该序列共享对仅包含最后一个通知的基础序列的单个订阅。
 *
 * ![](publishLast.png)
 *
 * Similar to {@link publish}, but it waits until the source observable completes and stores
 * the last emitted value.
 * Similarly to {@link publishReplay} and {@link publishBehavior}, this keeps storing the last
 * value even if it has no more subscribers. If subsequent subscriptions happen, they will
 * immediately get that last stored value and complete.
 *
 * 类似于 {@link publish}，但它会等到源 observable 完成并存储最后一个发出的值。与 {@link publishReplay} 和 {@link publishBehavior} 类似，即使没有更多订阅者，它也会继续存储最后一个值。如果发生后续订阅，他们将立即获得最后存储的值并完成。
 *
 * ## Example
 *
 * ## 例子
 *
 * ```ts
 * import { ConnectableObservable, interval, publishLast, tap, take } from 'rxjs';
 *
 * const connectable = <ConnectableObservable<number>>interval(1000)
 *   .pipe(
 *     tap(x => console.log('side effect', x)),
 *     take(3),
 *     publishLast()
 *   );
 *
 * connectable.subscribe({
 *   next: x => console.log('Sub. A', x),
 *   error: err => console.log('Sub. A Error', err),
 *   complete: () => console.log('Sub. A Complete')
 * });
 *
 * connectable.subscribe({
 *   next: x => console.log('Sub. B', x),
 *   error: err => console.log('Sub. B Error', err),
 *   complete: () => console.log('Sub. B Complete')
 * });
 *
 * connectable.connect();
 *
 * // Results:
 * // 'side effect 0'   - after one second
 * // 'side effect 1'   - after two seconds
 * // 'side effect 2'   - after three seconds
 * // 'Sub. A 2'        - immediately after 'side effect 2'
 * // 'Sub. B 2'
 * // 'Sub. A Complete'
 * // 'Sub. B Complete'
 * ```
 * @see {@link ConnectableObservable}
 * @see {@link publish}
 * @see {@link publishReplay}
 * @see {@link publishBehavior}
 * @return A function that returns an Observable that emits elements of a
 * sequence produced by multicasting the source sequence.
 *
 * 一个返回 Observable 的函数，该 Observable 发出由多播源序列产生的序列元素。
 *
 * @deprecated Will be removed in v8. To create a connectable observable with an
 * {@link AsyncSubject} under the hood, use {@link connectable}.
 * `source.pipe(publishLast())` is equivalent to
 * `connectable(source, { connector: () => new AsyncSubject(), resetOnDisconnect: false })`.
 * If you're using {@link refCount} after `publishLast`, use the {@link share} operator instead.
 * `source.pipe(publishLast(), refCount())` is equivalent to
 * `source.pipe(share({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }))`.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 将在 v8 中删除。要在底层使用 {@link AsyncSubject} 创建可连接的 observable，请使用 {@link connectable}。`source.pipe(publishLast())` 等价于 connectable `connectable(source, { connector: () => new AsyncSubject(), resetOnDisconnect: false })`。如果你在 `publishLast` 之后使用 {@link refCount}，请改用 {@link share} 运算符。`source.pipe(publishLast(), refCount())` 等价于 `source.pipe(share({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }))`。详细信息： <https://rxjs.dev/deprecations/multicasting>
 *
 */
export function publishLast<T>(): UnaryFunction<Observable<T>, ConnectableObservable<T>> {
  // Note that this has *never* supported a selector function like `publish` and `publishReplay`.
  return (source) => {
    const subject = new AsyncSubject<T>();
    return new ConnectableObservable(source, () => subject);
  };
}
