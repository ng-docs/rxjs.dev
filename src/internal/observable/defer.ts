import { Observable } from '../Observable';
import { ObservedValueOf, ObservableInput } from '../types';
import { innerFrom } from './innerFrom';

/**
 * Creates an Observable that, on subscribe, calls an Observable factory to
 * make an Observable for each new Observer.
 *
 * 创建一个 Observable，在订阅时调用 Observable 工厂为每个新的 Observer 创建一个 Observable。
 *
 * <span class="informal">Creates the Observable lazily, that is, only when it
 * is subscribed.
 * </span>
 *
 * <span class="informal">推迟创建 Observable，即仅在订阅时创建。</span>
 *
 * ![](defer.png)
 *
 * `defer` allows you to create an Observable only when the Observer
 * subscribes. It waits until an Observer subscribes to it, calls the given
 * factory function to get an Observable -- where a factory function typically
 * generates a new Observable -- and subscribes the Observer to this Observable.
 * In case the factory function returns a falsy value, then EMPTY is used as
 * Observable instead. Last but not least, an exception during the factory
 * function call is transferred to the Observer by calling `error`.
 *
 * `defer` 允许你仅在 Observer 订阅时创建 Observable。它等到 Observer 订阅它，调用给定的工厂函数来获取 Observable——工厂函数通常会生成一个新的 Observable——然后将 Observer 订阅到这个 Observable。如果工厂函数返回一个假值，则将 EMPTY 用作 Observable。最后但并非最不重要的一点是，工厂函数调用期间的异常通过调用 `error` 传递给观察者。
 *
 * ## Example
 *
 * ## 例子
 *
 * Subscribe to either an Observable of clicks or an Observable of interval, at random
 *
 * 随机订阅点击的 Observable 或间隔的 Observable
 *
 * ```ts
 * import { defer, fromEvent, interval } from 'rxjs';
 *
 * const clicksOrInterval = defer(() => {
 *   return Math.random() > 0.5
 *     ? fromEvent(document, 'click')
 *     : interval(1000);
 * });
 * clicksOrInterval.subscribe(x => console.log(x));
 *
 * // Results in the following behavior:
 * // If the result of Math.random() is greater than 0.5 it will listen
 * // for clicks anywhere on the "document"; when document is clicked it
 * // will log a MouseEvent object to the console. If the result is less
 * // than 0.5 it will emit ascending numbers, one every second(1000ms).
 * ```
 * @see {@link Observable}
 * @param {function(): ObservableInput} observableFactory The Observable
 * factory function to invoke for each Observer that subscribes to the output
 * Observable. May also return a Promise, which will be converted on the fly
 * to an Observable.
 *
 * 为订阅输出 Observable 的每个 Observer 调用的 Observable 工厂函数。也可以返回一个 Promise，它将在运行中转换为 Observable。
 *
 * @return {Observable} An Observable whose Observers' subscriptions trigger
 * an invocation of the given Observable factory function.
 *
 * 一个 Observable，其观察者的订阅会触发对给定 Observable 工厂函数的调用。
 *
 */
export function defer<R extends ObservableInput<any>>(observableFactory: () => R): Observable<ObservedValueOf<R>> {
  return new Observable<ObservedValueOf<R>>((subscriber) => {
    innerFrom(observableFactory()).subscribe(subscriber);
  });
}
