import { Observable } from '../Observable';
import { ReplaySubject } from '../ReplaySubject';
import { multicast } from './multicast';
import { MonoTypeOperatorFunction, OperatorFunction, TimestampProvider, ObservableInput, ObservedValueOf } from '../types';
import { isFunction } from '../util/isFunction';

/**
 * Creates a {@link ConnectableObservable} that uses a {@link ReplaySubject}
 * internally.
 *
 * 创建一个在内部使用 {@link ReplaySubject} 的 {@link ConnectableObservable}。
 *
 * @param bufferSize The buffer size for the underlying {@link ReplaySubject}.
 *
 * 底层 {@link ReplaySubject} 的缓冲区大小。
 *
 * @param windowTime The window time for the underlying {@link ReplaySubject}.
 *
 * 底层 {@link ReplaySubject} 的窗口时间。
 *
 * @param timestampProvider The timestamp provider for the underlying {@link ReplaySubject}.
 *
 * 底层 {@link ReplaySubject} 的时间戳提供程序。
 *
 * @deprecated Will be removed in v8. To create a connectable observable that uses a
 * {@link ReplaySubject} under the hood, use {@link connectable}.
 * `source.pipe(publishReplay(size, time, scheduler))` is equivalent to
 * `connectable(source, { connector: () => new ReplaySubject(size, time, scheduler), resetOnDisconnect: false })`.
 * If you're using {@link refCount} after `publishReplay`, use the {@link share} operator instead.
 * `publishReplay(size, time, scheduler), refCount()` is equivalent to
 * `share({ connector: () => new ReplaySubject(size, time, scheduler), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })`.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 将在 v8 中删除。要创建一个在底层使用 {@link ReplaySubject} 的可连接 observable，请使用 {@link connectable}。 `source.pipe(publishReplay(size, time, scheduler))` 等价于 `connectable(source, { connector: () => new ReplaySubject(size, time, scheduler), resetOnDisconnect: false })` 。如果你在 `publishReplay` 之后使用 {@link refCount}，请改用 {@link share} 运算符。 `publishReplay(size, time, scheduler), refCount()` 等价于 `share({ connector: () => new ReplaySubject(size, time, scheduler), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })` 。详细信息： [https](https://rxjs.dev/deprecations/multicasting) ://rxjs.dev/deprecations/multicasting
 *
 */
export function publishReplay<T>(
  bufferSize?: number,
  windowTime?: number,
  timestampProvider?: TimestampProvider
): MonoTypeOperatorFunction<T>;

/**
 * Creates an observable, that when subscribed to, will create a {@link ReplaySubject},
 * and pass an observable from it (using [asObservable](api/index/class/Subject#asObservable)) to
 * the `selector` function, which then returns an observable that is subscribed to before
 * "connecting" the source to the internal `ReplaySubject`.
 *
 * 创建一个 observable，当订阅它时，将创建一个 {@link ReplaySubject}，并从它传递一个 observable（使用[asObservable](api/index/class/Subject#asObservable) ）到 `selector` 函数，然后返回一个在将源“连接”到源之前订阅的 observable 内部 `ReplaySubject` 。
 *
 * Since this is deprecated, for additional details see the documentation for {@link connect}.
 *
 * 由于已弃用此功能，因此有关其他详细信息，请参阅 {@link connect} 的文档。
 *
 * @param bufferSize The buffer size for the underlying {@link ReplaySubject}.
 *
 * 底层 {@link ReplaySubject} 的缓冲区大小。
 *
 * @param windowTime The window time for the underlying {@link ReplaySubject}.
 *
 * 底层 {@link ReplaySubject} 的窗口时间。
 *
 * @param selector A function used to setup the multicast.
 *
 * 用于设置多播的函数。
 *
 * @param timestampProvider The timestamp provider for the underlying {@link ReplaySubject}.
 *
 * 底层 {@link ReplaySubject} 的时间戳提供程序。
 *
 * @deprecated Will be removed in v8. Use the {@link connect} operator instead.
 * `source.pipe(publishReplay(size, window, selector, scheduler))` is equivalent to
 * `source.pipe(connect(selector, { connector: () => new ReplaySubject(size, window, scheduler) }))`.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 将在 v8 中删除。请改用 {@link connect} 运算符。 `source.pipe(publishReplay(size, window, selector, scheduler))` 等价于 `source.pipe(connect(selector, { connector: () => new ReplaySubject(size, window, scheduler) }))` 。详细信息： [https](https://rxjs.dev/deprecations/multicasting) ://rxjs.dev/deprecations/multicasting
 *
 */
export function publishReplay<T, O extends ObservableInput<any>>(
  bufferSize: number | undefined,
  windowTime: number | undefined,
  selector: (shared: Observable<T>) => O,
  timestampProvider?: TimestampProvider
): OperatorFunction<T, ObservedValueOf<O>>;

/**
 * Creates a {@link ConnectableObservable} that uses a {@link ReplaySubject}
 * internally.
 *
 * 创建一个在内部使用 {@link ReplaySubject} 的 {@link ConnectableObservable}。
 *
 * @param bufferSize The buffer size for the underlying {@link ReplaySubject}.
 *
 * 底层 {@link ReplaySubject} 的缓冲区大小。
 *
 * @param windowTime The window time for the underlying {@link ReplaySubject}.
 *
 * 底层 {@link ReplaySubject} 的窗口时间。
 *
 * @param selector Passing `undefined` here determines that this operator will return a {@link ConnectableObservable}.
 *
 * 在此处传递 `undefined` 确定此运算符将返回 {@link ConnectableObservable}。
 *
 * @param timestampProvider The timestamp provider for the underlying {@link ReplaySubject}.
 *
 * 底层 {@link ReplaySubject} 的时间戳提供程序。
 *
 * @deprecated Will be removed in v8. To create a connectable observable that uses a
 * {@link ReplaySubject} under the hood, use {@link connectable}.
 * `source.pipe(publishReplay(size, time, scheduler))` is equivalent to
 * `connectable(source, { connector: () => new ReplaySubject(size, time, scheduler), resetOnDisconnect: false })`.
 * If you're using {@link refCount} after `publishReplay`, use the {@link share} operator instead.
 * `publishReplay(size, time, scheduler), refCount()` is equivalent to
 * `share({ connector: () => new ReplaySubject(size, time, scheduler), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })`.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 将在 v8 中删除。要创建一个在底层使用 {@link ReplaySubject} 的可连接 observable，请使用 {@link connectable}。 `source.pipe(publishReplay(size, time, scheduler))` 等价于 `connectable(source, { connector: () => new ReplaySubject(size, time, scheduler), resetOnDisconnect: false })` 。如果你在 `publishReplay` 之后使用 {@link refCount}，请改用 {@link share} 运算符。 `publishReplay(size, time, scheduler), refCount()` 等价于 `share({ connector: () => new ReplaySubject(size, time, scheduler), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })` 。详细信息： [https](https://rxjs.dev/deprecations/multicasting) ://rxjs.dev/deprecations/multicasting
 *
 */
export function publishReplay<T, O extends ObservableInput<any>>(
  bufferSize: number | undefined,
  windowTime: number | undefined,
  selector: undefined,
  timestampProvider: TimestampProvider
): OperatorFunction<T, ObservedValueOf<O>>;

/**
 * @deprecated Will be removed in v8. Use the {@link connectable} observable, the {@link connect} operator or the
 * {@link share} operator instead. See the overloads below for equivalent replacement examples of this operator's
 * behaviors.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 将在 v8 中删除。请改用 {@link connectable} observable、{@link connect} 运算符或 {@link share} 运算符。有关此运算符行为的等效替换示例，请参见下面的重载。详细信息： [https](https://rxjs.dev/deprecations/multicasting) ://rxjs.dev/deprecations/multicasting
 *
 */
export function publishReplay<T, R>(
  bufferSize?: number,
  windowTime?: number,
  selectorOrScheduler?: TimestampProvider | OperatorFunction<T, R>,
  timestampProvider?: TimestampProvider
) {
  if (selectorOrScheduler && !isFunction(selectorOrScheduler)) {
    timestampProvider = selectorOrScheduler;
  }
  const selector = isFunction(selectorOrScheduler) ? selectorOrScheduler : undefined;
  // Note, we're passing `selector!` here, because at runtime, `undefined` is an acceptable argument
  // but it makes our TypeScript signature for `multicast` unhappy (as it should, because it's gross).
  return (source: Observable<T>) => multicast(new ReplaySubject<T>(bufferSize, windowTime, timestampProvider), selector!)(source);
}
