import { AsyncAction } from './AsyncAction';
import { AsyncScheduler } from './AsyncScheduler';

/**
 * Async Scheduler
 *
 * 异步调度器
 *
 * <span class="informal">Schedule task as if you used setTimeout(task, duration)</span>
*
 * <span class="informal">像使用 setTimeout(task, duration) 一样安排任务</span>
 *
 * `async` scheduler schedules tasks asynchronously, by putting them on the JavaScript
 * event loop queue. It is best used to delay tasks in time or to schedule tasks repeating
 * in intervals.
 *
 * `async` 调度程序通过将任务放在 JavaScript 事件循环队列中来异步调度任务。最好用于及时延迟任务或安排间隔重复的任务。
 *
 * If you just want to "defer" task, that is to perform it right after currently
 * executing synchronous code ends (commonly achieved by `setTimeout(deferredTask, 0)`),
 * better choice will be the {@link asapScheduler} scheduler.
 *
 * 如果你只想“延迟”任务，即在当前执行的同步代码结束后立即执行它（通常由 `setTimeout(deferredTask, 0)` 实现），更好的选择是 {@link asapScheduler} 调度程序。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Use async scheduler to delay task
 *
 * 使用异步调度器延迟任务
 *
 * ```ts
 * import { asyncScheduler } from 'rxjs';
 *
 * const task = () => console.log('it works!');
 *
 * asyncScheduler.schedule(task, 2000);
 *
 * // After 2 seconds logs:
 * // "it works!"
 * ```
 *
 * Use async scheduler to repeat task in intervals
 *
 * 使用异步调度程序间隔重复任务
 *
 * ```ts
 * import { asyncScheduler } from 'rxjs';
 *
 * function task(state) {
 *   console.log(state);
 *   this.schedule(state + 1, 1000); // `this` references currently executing Action,
 *                                   // which we reschedule with new state and delay
 * }
 *
 * asyncScheduler.schedule(task, 3000, 0);
 *
 * // Logs:
 * // 0 after 3s
 * // 1 after 4s
 * // 2 after 5s
 * // 3 after 6s
 * ```
 */

export const asyncScheduler = new AsyncScheduler(AsyncAction);

/**
 * @deprecated Renamed to {@link asyncScheduler}. Will be removed in v8.
 *
 * 重命名为 {@link asyncScheduler}。将在 v8 中删除。
 *
 */
export const async = asyncScheduler;
