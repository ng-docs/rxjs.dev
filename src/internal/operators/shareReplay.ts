import { ReplaySubject } from '../ReplaySubject';
import { MonoTypeOperatorFunction, SchedulerLike } from '../types';
import { share } from './share';

export interface ShareReplayConfig {
  bufferSize?: number;
  windowTime?: number;
  refCount: boolean;
  scheduler?: SchedulerLike;
}

export function shareReplay<T>(config: ShareReplayConfig): MonoTypeOperatorFunction<T>;
export function shareReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

/**
 * Share source and replay specified number of emissions on subscription.
 *
 * 共享源并在订阅时重放指定数量的排放。
 *
 * This operator is a specialization of `replay` that connects to a source observable
 * and multicasts through a `ReplaySubject` constructed with the specified arguments.
 * A successfully completed source will stay cached in the `shareReplayed observable` forever,
 * but an errored source can be retried.
 *
 * 该操作符是 `replay` 的一种特殊化，它连接到源 observable 并通过使用指定参数构造的 `ReplaySubject` 进行多播。成功完成的源将永远缓存在 `shareReplayed observable` 中，但可以重试错误的源。
 *
 * ## Why use shareReplay?
 *
 * ## 为什么要使用 shareReplay？
 *
 * You generally want to use `shareReplay` when you have side-effects or taxing computations
 * that you do not wish to be executed amongst multiple subscribers.
 * It may also be valuable in situations where you know you will have late subscribers to
 * a stream that need access to previously emitted values.
 * This ability to replay values on subscription is what differentiates {@link share} and `shareReplay`.
 *
 * 当你不希望在多个订阅者之间执行的副作用或繁重的计算时，你通常希望使用 `shareReplay`。在你知道你将有迟到的订阅者需要访问先前发出的值的流的情况下，它也可能很有价值。这种重播订阅值的能力是 {@link share} 和 `shareReplay` 的区别。
 *
 * ![](shareReplay.png)
 *
 * ## Reference counting
 *
 * ## 引用计数
 *
 * As of RXJS version 6.4.0 a new overload signature was added to allow for manual control over what
 * happens when the operators internal reference counter drops to zero.
 * If `refCount` is true, the source will be unsubscribed from once the reference count drops to zero, i.e.
 * the inner `ReplaySubject` will be unsubscribed. All new subscribers will receive value emissions from a
 * new `ReplaySubject` which in turn will cause a new subscription to the source observable.
 * If `refCount` is false on the other hand, the source will not be unsubscribed meaning that the inner
 * `ReplaySubject` will still be subscribed to the source (and potentially run for ever).
 *
 * 从 RXJS 版本 6.4.0 开始，添加了一个新的重载签名，以允许手动控制操作员内部引用计数器下降到零时发生的情况。如果 `refCount` 为真，一旦引用计数下降到零，源将被取消订阅，即内部 `ReplaySubject` 将被取消订阅。所有新订阅者都将从新的 `ReplaySubject` 接收到值发射，这反过来将导致对源 observable 的新订阅。另一方面，如果 `refCount` 为 false，则不会取消订阅源，这意味着内部 `ReplaySubject` 仍将订阅源（并可能永远运行）。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Example with a third subscriber coming late to the party
 *
 * 第三个订阅者迟到的示例
 *
 * ```ts
 * import { interval, take, shareReplay } from 'rxjs';
 *
 * const shared$ = interval(2000).pipe(
 *   take(6),
 *   shareReplay(3)
 * );
 *
 * shared$.subscribe(x => console.log('sub A: ', x));
 * shared$.subscribe(y => console.log('sub B: ', y));
 *
 * setTimeout(() => {
 *   shared$.subscribe(y => console.log('sub C: ', y));
 * }, 11000);
 *
 * // Logs:
 * // (after ~2000 ms)
 * // sub A: 0
 * // sub B: 0
 * // (after ~4000 ms)
 * // sub A: 1
 * // sub B: 1
 * // (after ~6000 ms)
 * // sub A: 2
 * // sub B: 2
 * // (after ~8000 ms)
 * // sub A: 3
 * // sub B: 3
 * // (after ~10000 ms)
 * // sub A: 4
 * // sub B: 4
 * // (after ~11000 ms, sub C gets the last 3 values)
 * // sub C: 2
 * // sub C: 3
 * // sub C: 4
 * // (after ~12000 ms)
 * // sub A: 5
 * // sub B: 5
 * // sub C: 5
 * ```
 *
 * Example for `refCount` usage
 *
 * `refCount` 使用示例
 *
 * ```ts
 * import { Observable, tap, interval, shareReplay, take } from 'rxjs';
 *
 * const log = <T>(name: string, source: Observable<T>) => source.pipe(
 *   tap({
 *     subscribe: () => console.log(`${ name }: subscribed`),
 *     next: value => console.log(`${ name }: ${ value }`),
 *     complete: () => console.log(`${ name }: completed`),
 *     finalize: () => console.log(`${ name }: unsubscribed`)
 *   })
 * );
 *
 * const obs$ = log('source', interval(1000));
 *
 * const shared$ = log('shared', obs$.pipe(
 *   shareReplay({ bufferSize: 1, refCount: true }),
 *   take(2)
 * ));
 *
 * shared$.subscribe(x => console.log('sub A: ', x));
 * shared$.subscribe(y => console.log('sub B: ', y));
 *
 * // PRINTS:
 * // shared: subscribed <-- reference count = 1
 * // source: subscribed
 * // shared: subscribed <-- reference count = 2
 * // source: 0
 * // shared: 0
 * // sub A: 0
 * // shared: 0
 * // sub B: 0
 * // source: 1
 * // shared: 1
 * // sub A: 1
 * // shared: completed <-- take(2) completes the subscription for sub A
 * // shared: unsubscribed <-- reference count = 1
 * // shared: 1
 * // sub B: 1
 * // shared: completed <-- take(2) completes the subscription for sub B
 * // shared: unsubscribed <-- reference count = 0
 * // source: unsubscribed <-- replaySubject unsubscribes from source observable because the reference count dropped to 0 and refCount is true
 *
 * // In case of refCount being false, the unsubscribe is never called on the source and the source would keep on emitting, even if no subscribers
 * // are listening.
 * // source: 2
 * // source: 3
 * // source: 4
 * // ...
 * ```
 * @see {@link publish}
 * @see {@link share}
 * @see {@link publishReplay}
 * @param {Number} [bufferSize=Infinity] Maximum element count of the replay buffer.
 * @param {Number} [windowTime=Infinity] Maximum time length of the replay buffer in milliseconds.
 * @param {Scheduler} [scheduler] Scheduler where connected observers within the selector function
 * will be invoked on.
 * @return A function that returns an Observable sequence that contains the
 * elements of a sequence produced by multicasting the source sequence within a
 * selector function.
 *
 * 一个返回 Observable 序列的函数，该序列包含通过在选择器函数中多播源序列而产生的序列元素。
 *
 */
export function shareReplay<T>(
  configOrBufferSize?: ShareReplayConfig | number,
  windowTime?: number,
  scheduler?: SchedulerLike
): MonoTypeOperatorFunction<T> {
  let bufferSize: number;
  let refCount = false;
  if (configOrBufferSize && typeof configOrBufferSize === 'object') {
    bufferSize = configOrBufferSize.bufferSize ?? Infinity;
    windowTime = configOrBufferSize.windowTime ?? Infinity;
    refCount = !!configOrBufferSize.refCount;
    scheduler = configOrBufferSize.scheduler;
  } else {
    bufferSize = configOrBufferSize ?? Infinity;
  }
  return share<T>({
    connector: () => new ReplaySubject(bufferSize, windowTime, scheduler),
    resetOnError: true,
    resetOnComplete: false,
    resetOnRefCountZero: refCount,
  });
}
