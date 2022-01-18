import { Subscription } from '../Subscription';
import { OperatorFunction, SchedulerLike } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { arrRemove } from '../util/arrRemove';
import { asyncScheduler } from '../scheduler/async';
import { popScheduler } from '../util/args';
import { executeSchedule } from '../util/executeSchedule';

/* tslint:disable:max-line-length */
export function bufferTime<T>(bufferTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
export function bufferTime<T>(
  bufferTimeSpan: number,
  bufferCreationInterval: number | null | undefined,
  scheduler?: SchedulerLike
): OperatorFunction<T, T[]>;
export function bufferTime<T>(
  bufferTimeSpan: number,
  bufferCreationInterval: number | null | undefined,
  maxBufferSize: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, T[]>;
/* tslint:enable:max-line-length */

/**
 * Buffers the source Observable values for a specific time period.
 *
 * 每隔特定时间段，对源 Observable 的值进行缓冲。
 *
 * <span class="informal">Collects values from the past as an array, and emits
 * those arrays periodically in time.</span>
 *
 * <span class="informal">将已过去的值收集为数组，并定期发送这些数组。</span>
 *
 * ![](bufferTime.png)
 *
 * Buffers values from the source for a specific time duration `bufferTimeSpan`.
 * Unless the optional argument `bufferCreationInterval` is given, it emits and
 * resets the buffer every `bufferTimeSpan` milliseconds. If
 * `bufferCreationInterval` is given, this operator opens the buffer every
 * `bufferCreationInterval` milliseconds and closes (emits and resets) the
 * buffer every `bufferTimeSpan` milliseconds. When the optional argument
 * `maxBufferSize` is specified, the buffer will be closed either after
 * `bufferTimeSpan` milliseconds or when it contains `maxBufferSize` elements.
 *
 * 在特定持续时间 `bufferTimeSpan` 内缓冲来自源的值。除非给定可选参数 `bufferCreationInterval`，否则它会每隔 `bufferTimeSpan` 毫秒发送一次并重置缓冲区。如果给定了 `bufferCreationInterval`，则此操作符会每隔 `bufferCreationInterval` 毫秒打开缓冲区，并每隔 `bufferTimeSpan` 毫秒关闭（发送和重置）缓冲区。当指定可选参数 `maxBufferSize` 时，缓冲区将在 `bufferTimeSpan` 毫秒后或包含 `maxBufferSize` 个元素时关闭。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Every second, emit an array of the recent click events
 *
 * 每秒发送一组最近的点击事件
 *
 * ```ts
 * import { fromEvent, bufferTime } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferTime(1000));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * Every 5 seconds, emit the click events from the next 2 seconds
 *
 * 每 5 秒，发送以 2 秒间隔缓冲到的点击事件
 *
 * ```ts
 * import { fromEvent, bufferTime } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferTime(2000, 5000));
 * buffered.subscribe(x => console.log(x));
 * ```
 * @see {@link buffer}
 * @see {@link bufferCount}
 * @see {@link bufferToggle}
 * @see {@link bufferWhen}
 * @see {@link windowTime}
 * @param {number} bufferTimeSpan The amount of time to fill each buffer array.
 *
 * 填充每个缓冲区数组的时间段。
 *
 * @param {number} [bufferCreationInterval] The interval at which to start new
 * buffers.
 *
 * 启动新缓冲区的时间间隔。
 *
 * @param {number} [maxBufferSize] The maximum buffer size.
 *
 * 最大缓冲区大小。
 *
 * @param {SchedulerLike} [scheduler=async] The scheduler on which to schedule the
 * intervals that determine buffer boundaries.
 *
 * 一个调度器，用于调度决定缓冲区边界的时间间隔。
 *
 * @return A function that returns an Observable of arrays of buffered values.
 *
 * 一个返回 Observable 的函数，该 Observable 的值是一些缓冲区构成的数组。
 *
 */
export function bufferTime<T>(bufferTimeSpan: number, ...otherArgs: any[]): OperatorFunction<T, T[]> {
  const scheduler = popScheduler(otherArgs) ?? asyncScheduler;
  const bufferCreationInterval = (otherArgs[0] as number) ?? null;
  const maxBufferSize = (otherArgs[1] as number) || Infinity;

  return operate((source, subscriber) => {
    // The active buffers, their related subscriptions, and removal functions.
    let bufferRecords: { buffer: T[]; subs: Subscription }[] | null = [];
    // If true, it means that every time we emit a buffer, we want to start a new buffer
    // this is only really used for when *just* the buffer time span is passed.
    let restartOnEmit = false;

    /**
     * Does the work of emitting the buffer from the record, ensuring that the
     * record is removed before the emission so reentrant code (from some custom scheduling, perhaps)
     * does not alter the buffer. Also checks to see if a new buffer needs to be started
     * after the emit.
     *
     * 执行从此记录中发送缓冲区的工作，以确保在发送之前删除记录，因此某些可重入代码（可能来自某些自定义调度器）不会修改缓冲区。它还会检查发送后是否需要启动新缓冲区。
     *
     */
    const emit = (record: { buffer: T[]; subs: Subscription }) => {
      const { buffer, subs } = record;
      subs.unsubscribe();
      arrRemove(bufferRecords, record);
      subscriber.next(buffer);
      restartOnEmit && startBuffer();
    };

    /**
     * Called every time we start a new buffer. This does
     * the work of scheduling a job at the requested bufferTimeSpan
     * that will emit the buffer (if it's not unsubscribed before then).
     *
     * 每当我们开始一个新的缓冲区时调用时。这会在请求的 bufferTimeSpan 处调度一个任务，该任务会发送缓冲区（如果在此之前未退订）。
     *
     */
    const startBuffer = () => {
      if (bufferRecords) {
        const subs = new Subscription();
        subscriber.add(subs);
        const buffer: T[] = [];
        const record = {
          buffer,
          subs,
        };
        bufferRecords.push(record);
        executeSchedule(subs, scheduler, () => emit(record), bufferTimeSpan);
      }
    };

    if (bufferCreationInterval !== null && bufferCreationInterval >= 0) {
      // The user passed both a bufferTimeSpan (required), and a creation interval
      // That means we need to start new buffers on the interval, and those buffers need
      // to wait the required time span before emitting.
      executeSchedule(subscriber, scheduler, startBuffer, bufferCreationInterval, true);
    } else {
      restartOnEmit = true;
    }

    startBuffer();

    const bufferTimeSubscriber = new OperatorSubscriber(
      subscriber,
      (value: T) => {
        // Copy the records, so if we need to remove one we
        // don't mutate the array. It's hard, but not impossible to
        // set up a buffer time that could mutate the array and
        // cause issues here.
        const recordsCopy = bufferRecords!.slice();
        for (const record of recordsCopy) {
          // Loop over all buffers and
          const { buffer } = record;
          buffer.push(value);
          // If the buffer is over the max size, we need to emit it.
          maxBufferSize <= buffer.length && emit(record);
        }
      },
      () => {
        // The source completed, emit all of the active
        // buffers we have before we complete.
        while (bufferRecords?.length) {
          subscriber.next(bufferRecords.shift()!.buffer);
        }
        bufferTimeSubscriber?.unsubscribe();
        subscriber.complete();
        subscriber.unsubscribe();
      },
      // Pass all errors through to consumer.
      undefined,
      // Clean up
      () => (bufferRecords = null)
    );

    source.subscribe(bufferTimeSubscriber);
  });
}
