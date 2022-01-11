import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { multicast } from './multicast';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { MonoTypeOperatorFunction, OperatorFunction, UnaryFunction, ObservableInput, ObservedValueOf } from '../types';
import { connect } from './connect';

/**
 * Returns a connectable observable that, when connected, will multicast
 * all values through a single underlying {@link Subject} instance.
 *
 * 返回一个可连接的 observable，当它连接时，将通过单个底层 {@link Subject} 实例多播所有值。
 *
 * @deprecated Will be removed in v8. To create a connectable observable, use {@link connectable}.
 * `source.pipe(publish())` is equivalent to
 * `connectable(source, { connector: () => new Subject(), resetOnDisconnect: false })`.
 * If you're using {@link refCount} after `publish`, use {@link share} operator instead.
 * `source.pipe(publish(), refCount())` is equivalent to
 * `source.pipe(share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }))`.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 将在 v8 中删除。要创建可连接的 observable，请使用 {@link connectable}。`source.pipe(publish())` 等价于 connectable `connectable(source, { connector: () => new Subject(), resetOnDisconnect: false })`。如果你在 `publish` 后使用 {@link refCount}，请改用 {@link share} 运算符。`source.pipe(publish(), refCount())` 等价于 `source.pipe(share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }))`。详细信息： <https://rxjs.dev/deprecations/multicasting>
 *
 */
export function publish<T>(): UnaryFunction<Observable<T>, ConnectableObservable<T>>;

/**
 * Returns an observable, that when subscribed to, creates an underlying {@link Subject},
 * provides an observable view of it to a `selector` function, takes the observable result of
 * that selector function and subscribes to it, sending its values to the consumer, _then_ connects
 * the subject to the original source.
 *
 * 返回一个 observable，当订阅它时，创建一个底层 {@link Subject}，向选择器函数提供它的可观察视图，获取该 `selector` 函数的可观察结果并订阅它，将其值发送给消费者，_ 然后 _ 将主题与原始来源联系起来。
 *
 * @param selector A function used to setup multicasting prior to automatic connection.
 *
 * 用于在自动连接之前设置多播的功能。
 *
 * @deprecated Will be removed in v8. Use the {@link connect} operator instead.
 * `publish(selector)` is equivalent to `connect(selector)`.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 将在 v8 中删除。请改用 {@link connect} 运算符。`publish(selector)` 等价于 `connect(selector)`。详细信息： <https://rxjs.dev/deprecations/multicasting>
 *
 */
export function publish<T, O extends ObservableInput<any>>(selector: (shared: Observable<T>) => O): OperatorFunction<T, ObservedValueOf<O>>;

/**
 * Returns a ConnectableObservable, which is a variety of Observable that waits until its connect method is called
 * before it begins emitting items to those Observers that have subscribed to it.
 *
 * 返回一个 ConnectableObservable，它是一个 Observable 的变体，它一直等到它的 connect 方法被调用，然后才开始向订阅了它的 Observer 发送项目。
 *
 * <span class="informal">Makes a cold Observable hot</span>
*
 * <span class="informal">使冷 Observable 变热</span>
 *
 * ![](publish.png)
 *
 * ## Examples
 *
 * ## 例子
 *
 * Make `source$` hot by applying `publish` operator, then merge each inner observable into a single one
 * and subscribe
 *
 * 通过应用 `publish` 运算符使 `source$` 变热，然后将每个内部 observable 合并为一个并订阅
 *
 * ```ts
 * import { zip, interval, of, map, publish, merge, tap } from 'rxjs';
 *
 * const source$ = zip(interval(2000), of(1, 2, 3, 4, 5, 6, 7, 8, 9))
 *   .pipe(map(([, number]) => number));
 *
 * source$
 *   .pipe(
 *     publish(multicasted$ =>
 *       merge(
 *         multicasted$.pipe(tap(x => console.log('Stream 1:', x))),
 *         multicasted$.pipe(tap(x => console.log('Stream 2:', x))),
 *         multicasted$.pipe(tap(x => console.log('Stream 3:', x)))
 *       )
 *     )
 *   )
 *   .subscribe();
 *
 * // Results every two seconds
 * // Stream 1: 1
 * // Stream 2: 1
 * // Stream 3: 1
 * // ...
 * // Stream 1: 9
 * // Stream 2: 9
 * // Stream 3: 9
 * ```
 * @see {@link publishLast}
 * @see {@link publishReplay}
 * @see {@link publishBehavior}
 * @param {Function} [selector] - Optional selector function which can use the multicasted source sequence as many times
 * as needed, without causing multiple subscriptions to the source sequence.
 * Subscribers to the given source will receive all notifications of the source from the time of the subscription on.
 * @return A function that returns a ConnectableObservable that upon connection
 * causes the source Observable to emit items to its Observers.
 *
 * 一个返回 ConnectableObservable 的函数，该函数在连接时会导致源 Observable 向其 Observers 发出项目。
 *
 * @deprecated Will be removed in v8. Use the {@link connectable} observable, the {@link connect} operator or the
 * {@link share} operator instead. See the overloads below for equivalent replacement examples of this operator's
 * behaviors.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 将在 v8 中删除。请改用 {@link connectable} observable、{@link connect} 运算符或 {@link share} 运算符。有关此运算符行为的等效替换示例，请参见下面的重载。详细信息： <https://rxjs.dev/deprecations/multicasting>
 *
 */
export function publish<T, R>(selector?: OperatorFunction<T, R>): MonoTypeOperatorFunction<T> | OperatorFunction<T, R> {
  return selector ? (source) => connect(selector)(source) : (source) => multicast(new Subject<T>())(source);
}
