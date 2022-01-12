import { asyncScheduler } from '../scheduler/async';
import { MonoTypeOperatorFunction, SchedulerLike } from '../types';
import { sample } from './sample';
import { interval } from '../observable/interval';

/**
 * Emits the most recently emitted value from the source Observable within
 * periodic time intervals.
 *
 * 在周期性时间间隔内从源 Observable 发出最近发出的值。
 *
 * <span class="informal">Samples the source Observable at periodic time
 * intervals, emitting what it samples.</span>
 *
 * <span class="informal">以周期性的时间间隔对源 Observable 进行采样，发出它所采样的内容。</span>
 *
 * ![](sampleTime.png)
 *
 * `sampleTime` periodically looks at the source Observable and emits whichever
 * value it has most recently emitted since the previous sampling, unless the
 * source has not emitted anything since the previous sampling. The sampling
 * happens periodically in time every `period` milliseconds (or the time unit
 * defined by the optional `scheduler` argument). The sampling starts as soon as
 * the output Observable is subscribed.
 *
 * `sampleTime` 定期查看源 Observable 并发出自上次采样以来它最近发出的任何值，除非源自上次采样以来没有发出任何东西。采样每隔一段时间毫秒（或由可选 `scheduler` 参数定义的 `period` 单位）定期发生。一旦订阅了输出 Observable，采样就开始了。
 *
 * ## Example
 *
 * ## 例子
 *
 * Every second, emit the most recent click at most once
 *
 * 每秒，最多发出一次最近的点击
 *
 * ```ts
 * import { fromEvent, sampleTime } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(sampleTime(1000));
 *
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link auditTime}
 * @see {@link debounceTime}
 * @see {@link delay}
 * @see {@link sample}
 * @see {@link throttleTime}
 * @param {number} period The sampling period expressed in milliseconds or the
 * time unit determined internally by the optional `scheduler`.
 *
 * 以毫秒表示的采样周期或由可选 `scheduler` 内部确定的时间单位。
 *
 * @param {SchedulerLike} [scheduler=async] The {@link SchedulerLike} to use for
 * managing the timers that handle the sampling.
 *
 * 用于管理处理采样的定时器。
 *
 * @return A function that returns an Observable that emits the results of
 * sampling the values emitted by the source Observable at the specified time
 * interval.
 *
 * 一个返回 Observable 的函数，该函数在指定的时间间隔发出对源 Observable 发出的值进行采样的结果。
 *
 */
export function sampleTime<T>(period: number, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T> {
  return sample(interval(period, scheduler));
}
