import { Observable } from '../Observable';
import { BehaviorSubject } from '../BehaviorSubject';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { UnaryFunction } from '../types';

/**
 * Creates a {@link ConnectableObservable} that utilizes a {@link BehaviorSubject}.
 *
 * 创建一个利用 {@link BehaviorSubject} 的 {@link ConnectableObservable}。
 *
 * @param initialValue The initial value passed to the {@link BehaviorSubject}.
 *
 * 传递给 {@link BehaviorSubject} 的初始值。
 *
 * @return A function that returns a {@link ConnectableObservable}
 *
 * 返回 {@link ConnectableObservable} 的函数
 *
 * @deprecated Will be removed in v8. To create a connectable observable that uses a
 * {@link BehaviorSubject} under the hood, use {@link connectable}.
 * `source.pipe(publishBehavior(initValue))` is equivalent to
 * `connectable(source, { connector: () => new BehaviorSubject(initValue), resetOnDisconnect: false })`.
 * If you're using {@link refCount} after `publishBehavior`, use the {@link share} operator instead.
 * `source.pipe(publishBehavior(initValue), refCount())` is equivalent to
 * `source.pipe(share({ connector: () => new BehaviorSubject(initValue), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false  }))`.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 将在 v8 中删除。要创建一个在底层使用 {@link BehaviorSubject} 的可连接 observable，请使用 {@link connectable}。`source.pipe(publishBehavior(initValue))` 等价于 connectable `connectable(source, { connector: () => new BehaviorSubject(initValue), resetOnDisconnect: false })`。如果你在 `publishBehavior` 之后使用 {@link refCount}，请改用 {@link share} 运算符。`source.pipe(publishBehavior(initValue), refCount())` 等价于 `source.pipe(share({ connector: () => new BehaviorSubject(initValue), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }))`。详细信息： <https://rxjs.dev/deprecations/multicasting>
 *
 */
export function publishBehavior<T>(initialValue: T): UnaryFunction<Observable<T>, ConnectableObservable<T>> {
  // Note that this has *never* supported the selector function.
  return (source) => {
    const subject = new BehaviorSubject<T>(initialValue);
    return new ConnectableObservable(source, () => subject);
  };
}
