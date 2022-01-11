import { Subject } from './Subject';
import { TimestampProvider } from './types';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { dateTimestampProvider } from './scheduler/dateTimestampProvider';

/**
 * A variant of {@link Subject} that "replays" old values to new subscribers by emitting them when they first subscribe.
 *
 * {@link Subject} 的一种变体，它通过在新订阅者首次订阅时发出旧值来“重播”旧值。
 *
 * `ReplaySubject` has an internal buffer that will store a specified number of values that it has observed. Like `Subject`,
 * `ReplaySubject` "observes" values by having them passed to its `next` method. When it observes a value, it will store that
 * value for a time determined by the configuration of the `ReplaySubject`, as passed to its constructor.
 *
 * `ReplaySubject` 有一个内部缓冲区，它将存储它观察到的指定数量的值。与 `Subject` 一样，`ReplaySubject` 通过将值传递给 `next` 方法来“观察”值。当它观察到一个值时，它将将该值存储一段时间，该时间由 `ReplaySubject` 的配置确定，并传递给其构造函数。
 *
 * When a new subscriber subscribes to the `ReplaySubject` instance, it will synchronously emit all values in its buffer in
 * a First-In-First-Out (FIFO) manner. The `ReplaySubject` will also complete, if it has observed completion; and it will
 * error if it has observed an error.
 *
 * 当新订阅者订阅 `ReplaySubject` 实例时，它将以先进先出 (FIFO) 的方式同步发出其缓冲区中的所有值。如果 `ReplaySubject` 观察到完成，它也将完成；如果它观察到错误，它将出错。
 *
 * There are two main configuration items to be concerned with:
 *
 * 有两个主要的配置项需要关注：
 *
 * 1. `bufferSize` - This will determine how many items are stored in the buffer, defaults to infinite.
 *
 *    `bufferSize` - 这将确定缓冲区中存储了多少项目，默认为无限。
 *
 * 2. `windowTime` - The amount of time to hold a value in the buffer before removing it from the buffer.
 *
 *    `windowTime` - 从缓冲区中删除值之前在缓冲区中保存值的时间量。
 *
 * Both configurations may exist simultaneously. So if you would like to buffer a maximum of 3 values, as long as the values
 * are less than 2 seconds old, you could do so with a `new ReplaySubject(3, 2000)`.
 *
 * 两种配置可以同时存在。因此，如果你想缓冲最多 3 个值，只要这些值小于 2 秒，你就可以使用 `new ReplaySubject(3, 2000)` 来实现。
 *
 * ### Differences with BehaviorSubject
 *
 * ### 与 BehaviorSubject 的差异
 *
 * `BehaviorSubject` is similar to `new ReplaySubject(1)`, with a couple fo exceptions:
 *
 * `BehaviorSubject` 类似于 `new ReplaySubject(1)`，但有几个例外：
 *
 * 1. `BehaviorSubject` comes "primed" with a single value upon construction.
 *
 *    `BehaviorSubject` 在构造时带有一个单一的值。
 *
 * 2. `ReplaySubject` will replay values, even after observing an error, where `BehaviorSubject` will not.
 *
 *    `ReplaySubject` 将重播值，即使在观察到错误之后，`BehaviorSubject` 也不会。
 *
 * @see {@link Subject}
 * @see {@link BehaviorSubject}
 * @see {@link shareReplay}
 */
export class ReplaySubject<T> extends Subject<T> {
  private _buffer: (T | number)[] = [];
  private _infiniteTimeWindow = true;

  /**
   * @param bufferSize The size of the buffer to replay on subscription
   *
   * 订阅时重播的缓冲区大小
   *
   * @param windowTime The amount of time the buffered items will say buffered
   *
   * 缓冲项目会说缓冲的时间量
   *
   * @param timestampProvider An object with a `now()` method that provides the current timestamp. This is used to
   * calculate the amount of time something has been buffered.
   *
   * 具有提供当前时间戳的 `now()` 方法的对象。这用于计算缓冲的时间量。
   *
   */
  constructor(
    private _bufferSize = Infinity,
    private _windowTime = Infinity,
    private _timestampProvider: TimestampProvider = dateTimestampProvider
  ) {
    super();
    this._infiniteTimeWindow = _windowTime === Infinity;
    this._bufferSize = Math.max(1, _bufferSize);
    this._windowTime = Math.max(1, _windowTime);
  }

  next(value: T): void {
    const { isStopped, _buffer, _infiniteTimeWindow, _timestampProvider, _windowTime } = this;
    if (!isStopped) {
      _buffer.push(value);
      !_infiniteTimeWindow && _buffer.push(_timestampProvider.now() + _windowTime);
    }
    this._trimBuffer();
    super.next(value);
  }

  /** @internal */
  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    this._throwIfClosed();
    this._trimBuffer();

    const subscription = this._innerSubscribe(subscriber);

    const { _infiniteTimeWindow, _buffer } = this;
    // We use a copy here, so reentrant code does not mutate our array while we're
    // emitting it to a new subscriber.
    const copy = _buffer.slice();
    for (let i = 0; i < copy.length && !subscriber.closed; i += _infiniteTimeWindow ? 1 : 2) {
      subscriber.next(copy[i] as T);
    }

    this._checkFinalizedStatuses(subscriber);

    return subscription;
  }

  private _trimBuffer() {
    const { _bufferSize, _timestampProvider, _buffer, _infiniteTimeWindow } = this;
    // If we don't have an infinite buffer size, and we're over the length,
    // use splice to truncate the old buffer values off. Note that we have to
    // double the size for instances where we're not using an infinite time window
    // because we're storing the values and the timestamps in the same array.
    const adjustedBufferSize = (_infiniteTimeWindow ? 1 : 2) * _bufferSize;
    _bufferSize < Infinity && adjustedBufferSize < _buffer.length && _buffer.splice(0, _buffer.length - adjustedBufferSize);

    // Now, if we're not in an infinite time window, remove all values where the time is
    // older than what is allowed.
    if (!_infiniteTimeWindow) {
      const now = _timestampProvider.now();
      let last = 0;
      // Search the array for the first timestamp that isn't expired and
      // truncate the buffer up to that point.
      for (let i = 1; i < _buffer.length && (_buffer[i] as number) <= now; i += 2) {
        last = i;
      }
      last && _buffer.splice(0, last + 1);
    }
  }
}
