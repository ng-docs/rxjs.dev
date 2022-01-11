import { Observable } from '../Observable';
import { Unsubscribable, ObservableInput, ObservedValueOf } from '../types';
import { innerFrom } from './innerFrom';
import { EMPTY } from './empty';

/**
 * Creates an Observable that uses a resource which will be disposed at the same time as the Observable.
 *
 * 创建一个使用资源的 Observable，该资源将与 Observable 同时释放。
 *
 * <span class="informal">Use it when you catch yourself cleaning up after an Observable.</span>
 *
 * 当你发现自己在 Observable 之后清理时使用它。
 *
 * `using` is a factory operator, which accepts two functions. First function returns a disposable resource.
 * It can be an arbitrary object that implements `unsubscribe` method. Second function will be injected with
 * that object and should return an Observable. That Observable can use resource object during its execution.
 * Both functions passed to `using` will be called every time someone subscribes - neither an Observable nor
 * resource object will be shared in any way between subscriptions.
 *
 * `using` 是一个工厂操作符，它接受两个函数。第一个函数返回一次性资源。它可以是实现 `unsubscribe` 方法的任意对象。第二个函数将被注入该对象并且应该返回一个 Observable。该 Observable 可以在执行期间使用资源对象。每次有人订阅时，都将调用传递给 `using` 的两个函数 - Observable 和资源对象都不会在订阅之间以任何方式共享。
 *
 * When Observable returned by `using` is subscribed, Observable returned from the second function will be subscribed
 * as well. All its notifications (nexted values, completion and error events) will be emitted unchanged by the output
 * Observable. If however someone unsubscribes from the Observable or source Observable completes or errors by itself,
 * the `unsubscribe` method on resource object will be called. This can be used to do any necessary clean up, which
 * otherwise would have to be handled by hand. Note that complete or error notifications are not emitted when someone
 * cancels subscription to an Observable via `unsubscribe`, so `using` can be used as a hook, allowing you to make
 * sure that all resources which need to exist during an Observable execution will be disposed at appropriate time.
 *
 * 当 `using` 返回的 Observable 被订阅时，第二个函数返回的 Observable 也会被订阅。它的所有通知（下一个值、完成和错误事件）都将由输出 Observable 发出而不会发生变化。但是，如果有人取消订阅 Observable 或源 Observable 本身完成或出错，则将调用资源对象上的 `unsubscribe` 方法。这可用于进行任何必要的清理，否则必须手动处理。请注意，当有人通过 `unsubscribe` 取消订阅 Observable 时，不会发出完整或错误通知，因此 `using` 可以用作挂钩，允许你确保在 Observable 执行期间需要存在的所有资源都将在适当的时间释放.
 *
 * @see {@link defer}
 * @param {function(): ISubscription} resourceFactory A function which creates any resource object
 * that implements `unsubscribe` method.
 *
 * 创建任何实现 `unsubscribe` 方法的资源对象的函数。
 *
 * @param {function(resource: ISubscription): Observable<T>} observableFactory A function which
 * creates an Observable, that can use injected resource object.
 *
 * 一个创建 Observable 的函数，它可以使用注入的资源对象。
 *
 * @return {Observable<T>} An Observable that behaves the same as Observable returned by `observableFactory`, but
 * which - when completed, errored or unsubscribed - will also call `unsubscribe` on created resource object.
 *
 * 一个行为与 `observableFactory` 返回的 Observable 相同的 Observable，但是当它完成、出错或取消订阅时，也会在创建的资源对象上调用 `unsubscribe` 。
 *
 */
export function using<T extends ObservableInput<any>>(
  resourceFactory: () => Unsubscribable | void,
  observableFactory: (resource: Unsubscribable | void) => T | void
): Observable<ObservedValueOf<T>> {
  return new Observable<ObservedValueOf<T>>((subscriber) => {
    const resource = resourceFactory();
    const result = observableFactory(resource);
    const source = result ? innerFrom(result) : EMPTY;
    source.subscribe(subscriber);
    return () => {
      // NOTE: Optional chaining did not work here.
      // Related TS Issue: https://github.com/microsoft/TypeScript/issues/40818
      if (resource) {
        resource.unsubscribe();
      }
    };
  });
}
