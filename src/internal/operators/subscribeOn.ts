import { MonoTypeOperatorFunction, SchedulerLike } from '../types';
import { operate } from '../util/lift';

/**
 * Asynchronously subscribes Observers to this Observable on the specified {@link SchedulerLike}.
 *
 * 在指定的 {@link SchedulerLike} 上异步订阅此 Observable 的各个 Observer。
 *
 * With `subscribeOn` you can decide what type of scheduler a specific Observable will be using when it is subscribed to.
 *
 * 通过 `subscribeOn`，你可以决定特定 Observable 在订阅时要使用哪种类型的调度器。
 *
 * Schedulers control the speed and order of emissions to observers from an Observable stream.
 *
 * 调度器负责控制从 Observable 流向 Observer 的发送速度和顺序。
 *
 * ![](subscribeOn.png)
 *
 * ## Example
 *
 * ## 例子
 *
 * Given the following code:
 *
 * 给定以下代码：
 *
 * ```ts
 * import { of, merge } from 'rxjs';
 *
 * const a = of(1, 2, 3);
 * const b = of(4, 5, 6);
 *
 * merge(a, b).subscribe(console.log);
 *
 * // Outputs
 * // 1
 * // 2
 * // 3
 * // 4
 * // 5
 * // 6
 * ```
 *
 * Both Observable `a` and `b` will emit their values directly and synchronously once they are subscribed to.
 *
 * 一旦订阅，`a` 和 `b` 这两个 Observable 都会直接同步发送它们的值。
 *
 * If we instead use the `subscribeOn` operator declaring that we want to use the {@link asyncScheduler} for values emitted by Observable `a`:
 *
 * 如果我们改为使用 `subscribeOn` 操作符来声明我们想要使用 {@link asyncScheduler} 来处理 Observable `a` 发送的值：
 *
 * ```ts
 * import { of, subscribeOn, asyncScheduler, merge } from 'rxjs';
 *
 * const a = of(1, 2, 3).pipe(subscribeOn(asyncScheduler));
 * const b = of(4, 5, 6);
 *
 * merge(a, b).subscribe(console.log);
 *
 * // Outputs
 * // 4
 * // 5
 * // 6
 * // 1
 * // 2
 * // 3
 * ```
 *
 * The reason for this is that Observable `b` emits its values directly and synchronously like before
 * but the emissions from `a` are scheduled on the event loop because we are now using the {@link asyncScheduler} for that specific Observable.
 *
 * 这样做的原因是 Observable `b` 像以前一样直接和同步地发送它的值，但是来自 `a` 的发送是在事件循环上安排的，因为我们现在正在为那个特定的 Observable 使用 {@link asyncScheduler}。
 *
 * @param scheduler The {@link SchedulerLike} to perform subscription actions on.
 *
 * 要对其执行订阅操作的 {@link SchedulerLike}。
 *
 * @param delay A delay to pass to the scheduler to delay subscriptions
 *
 * 一个延迟数量，用来传给调度器以对订阅进行延迟
 *
 * @return A function that returns an Observable modified so that its
 * subscriptions happen on the specified {@link SchedulerLike}.
 *
 * 一个返回 Observable 的函数，会修改此 Observable，以便它的订阅发生在指定的 {@link SchedulerLike} 上。
 *
 */
export function subscribeOn<T>(scheduler: SchedulerLike, delay: number = 0): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    subscriber.add(scheduler.schedule(() => source.subscribe(subscriber), delay));
  });
}
