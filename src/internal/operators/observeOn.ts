/** @prettier */
import { MonoTypeOperatorFunction, SchedulerLike } from '../types';
import { executeSchedule } from '../util/executeSchedule';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Re-emits all notifications from source Observable with specified scheduler.
 *
 * 使用指定的调度程序从源 Observable 重新发出所有通知。
 *
 * <span class="informal">Ensure a specific scheduler is used, from outside of an Observable.</span>
 *
 * 确保从 Observable 外部使用特定的调度程序。
 *
 * `observeOn` is an operator that accepts a scheduler as a first parameter, which will be used to reschedule
 * notifications emitted by the source Observable. It might be useful, if you do not have control over
 * internal scheduler of a given Observable, but want to control when its values are emitted nevertheless.
 *
 * `observeOn` 是一个接受调度器作为第一个参数的操作符，它将用于重新调度源 Observable 发出的通知。如果你无法控制给定 Observable 的内部调度程序，但仍想控制其值何时发出，这可能很有用。
 *
 * Returned Observable emits the same notifications (nexted values, complete and error events) as the source Observable,
 * but rescheduled with provided scheduler. Note that this doesn't mean that source Observables internal
 * scheduler will be replaced in any way. Original scheduler still will be used, but when the source Observable emits
 * notification, it will be immediately scheduled again - this time with scheduler passed to `observeOn`.
 * An anti-pattern would be calling `observeOn` on Observable that emits lots of values synchronously, to split
 * that emissions into asynchronous chunks. For this to happen, scheduler would have to be passed into the source
 * Observable directly (usually into the operator that creates it). `observeOn` simply delays notifications a
 * little bit more, to ensure that they are emitted at expected moments.
 *
 * 返回的 Observable 发出与源 Observable 相同的通知（下一个值、完成和错误事件），但使用提供的调度程序重新调度。请注意，这并不意味着源 Observables 内部调度程序将以任何方式被替换。原来的调度器仍然会被使用，但是当源 Observable 发出通知时，它会立即再次被调度——这次调度器被传递给了 `observeOn` 。一个反模式是在 Observable 上调用 `observeOn` 同步发射大量值，将发射分成异步块。为此，必须将调度程序直接传递给源 Observable（通常传递给创建它的操作员）。 `observeOn` 只是稍微延迟通知，以确保它们在预期的时刻发出。
 *
 * As a matter of fact, `observeOn` accepts second parameter, which specifies in milliseconds with what delay notifications
 * will be emitted. The main difference between {@link delay} operator and `observeOn` is that `observeOn`
 * will delay all notifications - including error notifications - while `delay` will pass through error
 * from source Observable immediately when it is emitted. In general it is highly recommended to use `delay` operator
 * for any kind of delaying of values in the stream, while using `observeOn` to specify which scheduler should be used
 * for notification emissions in general.
 *
 * 事实上， `observeOn` 接受第二个参数，它以毫秒为单位指定将发出什么延迟通知。 {@link delay} 运算符和 `observeOn` 的主要区别在于 `observeOn` 会延迟所有通知——包括错误通知——而 `delay` 会在源 Observable 发出错误时立即传递它。一般来说，强烈建议对流中的任何类型的值延迟使用 `delay` 运算符，同时使用 `observeOn` 指定通常应该使用哪个调度程序来发出通知。
 *
 * ## Example
 *
 * ## 例子
 *
 * Ensure values in subscribe are called just before browser repaint
 *
 * 确保在浏览器重绘之前调用 subscribe 中的值
 *
 * ```ts
 * import { interval, observeOn, animationFrameScheduler } from 'rxjs';
 *
 * const someDiv = document.createElement('div');
 * someDiv.style.cssText = 'width: 200px;background: #09c';
 * document.body.appendChild(someDiv);
 * const intervals = interval(10);      // Intervals are scheduled
 *                                      // with async scheduler by default...
 * intervals.pipe(
 *   observeOn(animationFrameScheduler) // ...but we will observe on animationFrame
 * )                                    // scheduler to ensure smooth animation.
 * .subscribe(val => {
 *   someDiv.style.height = val + 'px';
 * });
 * ```
 * @see {@link delay}
 * @param scheduler Scheduler that will be used to reschedule notifications from source Observable.
 *
 * 用于重新调度来自源 Observable 的通知的调度程序。
 *
 * @param delay Number of milliseconds that states with what delay every notification should be rescheduled.
 *
 * 说明应该重新安排每个通知的延迟时间的毫秒数。
 *
 * @return A function that returns an Observable that emits the same
 * notifications as the source Observable, but with provided scheduler.
 *
 * 一个返回 Observable 的函数，它发出与源 Observable 相同的通知，但带有提供的调度程序。
 *
 */
export function observeOn<T>(scheduler: SchedulerLike, delay = 0): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value) => executeSchedule(subscriber, scheduler, () => subscriber.next(value), delay),
        () => executeSchedule(subscriber, scheduler, () => subscriber.complete(), delay),
        (err) => executeSchedule(subscriber, scheduler, () => subscriber.error(err), delay)
      )
    );
  });
}
