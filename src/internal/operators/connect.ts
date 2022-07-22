import { OperatorFunction, ObservableInput, ObservedValueOf, SubjectLike } from '../types';
import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { innerFrom } from '../observable/innerFrom';
import { operate } from '../util/lift';
import { fromSubscribable } from '../observable/fromSubscribable';

/**
 * An object used to configure {@link connect} operator.
 *
 * 用于配置 {@link connect} 操作符的对象。
 *
 */
export interface ConnectConfig<T> {
  /**
   * A factory function used to create the Subject through which the source
   * is multicast. By default, this creates a {@link Subject}.
   *
   * 一个工厂函数，用于创建要通过其源进行多播的主体。默认情况下，这会创建一个 {@link Subject}。
   *
   */
  connector: () => SubjectLike<T>;
}

/**
 * The default configuration for `connect`.
 *
 * `connect` 的默认配置。
 *
 */
const DEFAULT_CONFIG: ConnectConfig<unknown> = {
  connector: () => new Subject<unknown>(),
};

/**
 * Creates an observable by multicasting the source within a function that
 * allows the developer to define the usage of the multicast prior to connection.
 *
 * 在一个函数中创建多播源，以创建 Observable。该函数能让开发人员在连接之前定义多播的用法。
 *
 * This is particularly useful if the observable source you wish to multicast could
 * be synchronous or asynchronous. This sets it apart from {@link share}, which, in the
 * case of totally synchronous sources will fail to share a single subscription with
 * multiple consumers, as by the time the subscription to the result of {@link share}
 * has returned, if the source is synchronous its internal reference count will jump from
 * 0 to 1 back to 0 and reset.
 *
 * 如果你要进行多播的可观察源既可能是同步也可能是异步的，这就特别有用。这让它有别于 {@link share}，后者在完全同步源的情况下，将无法让多个消费者共享单个订阅，因为当对 {@link share} 结果的订阅已返回时，如果源是同步的，它的内部引用计数就会从 0 跳到 1 再回到 0 并复位。
 *
 * To use `connect`, you provide a `selector` function that will give you
 * a multicast observable that is not yet connected. You then use that multicast observable
 * to create a resulting observable that, when subscribed, will set up your multicast. This is
 * generally, but not always, accomplished with {@link merge}.
 *
 * 要使用 `connect`，你需要提供一个 `selector` 函数，该函数将为你提供一个尚未连接的多播 observable。然后，你使用该多播 observable 创建一个结果 observable，当订阅它时，将建立多播。这通常会（但并非总是）通过 {@link merge} 来完成。
 *
 * Note that using a {@link takeUntil} inside of `connect`'s `selector` _might_ mean you were looking
 * to use the {@link takeWhile} operator instead.
 *
 * 请注意，在 `connect` 的 `selector` 中使用 {@link takeUntil} *可能* 意味着你该使用 {@link takeWhile} 操作符。
 *
 * When you subscribe to the result of `connect`, the `selector` function will be called. After
 * the `selector` function returns, the observable it returns will be subscribed to, _then_ the
 * multicast will be connected to the source.
 *
 * 当你订阅 `connect` 的结果时，将调用 `selector` 函数。`selector` 函数返回后，它返回的 observable 将被订阅，*然后*就会把多播连接到源。
 *
 * ## Example
 *
 * ## 例子
 *
 * Sharing a totally synchronous observable
 *
 * 共享一个完全同步的 observable
 *
 * ```ts
 * import { of, tap, connect, merge, map, filter } from 'rxjs';
 *
 * const source$ = of(1, 2, 3, 4, 5).pipe(
 *   tap({
 *     subscribe: () => console.log('subscription started'),
 *     next: n => console.log(`source emitted ${ n }`)
 *   })
 * );
 *
 * source$.pipe(
 *   // Notice in here we're merging 3 subscriptions to `shared$`.
 *   connect(shared$ => merge(
 *     shared$.pipe(map(n => `all ${ n }`)),
 *     shared$.pipe(filter(n => n % 2 === 0), map(n => `even ${ n }`)),
 *     shared$.pipe(filter(n => n % 2 === 1), map(n => `odd ${ n }`))
 *   ))
 * )
 * .subscribe(console.log);
 *
 * // Expected output: (notice only one subscription)
 * 'subscription started'
 * 'source emitted 1'
 * 'all 1'
 * 'odd 1'
 * 'source emitted 2'
 * 'all 2'
 * 'even 2'
 * 'source emitted 3'
 * 'all 3'
 * 'odd 3'
 * 'source emitted 4'
 * 'all 4'
 * 'even 4'
 * 'source emitted 5'
 * 'all 5'
 * 'odd 5'
 * ```
 * @param selector A function used to set up the multicast. Gives you a multicast observable
 * that is not yet connected. With that, you're expected to create and return
 * and Observable, that when subscribed to, will utilize the multicast observable.
 * After this function is executed -- and its return value subscribed to -- the
 * operator will subscribe to the source, and the connection will be made.
 *
 * 用于建立多播的函数。它会为你提供尚未连接的多播 observable。有了它，你应该创建并返回 Observable，当订阅它时，它将使用多播 observable。在这个函数被执行之后（并且它的返回值已被订阅），该操作符将订阅源，并且建立连接。
 *
 * @param config The configuration object for `connect`.
 *
 * `connect` 的配置对象。
 *
 */
export function connect<T, O extends ObservableInput<unknown>>(
  selector: (shared: Observable<T>) => O,
  config: ConnectConfig<T> = DEFAULT_CONFIG
): OperatorFunction<T, ObservedValueOf<O>> {
  const { connector } = config;
  return operate((source, subscriber) => {
    const subject = connector();
    innerFrom(selector(fromSubscribable(subject))).subscribe(subscriber);
    subscriber.add(source.subscribe(subject));
  });
}
