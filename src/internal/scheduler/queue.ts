import { QueueAction } from './QueueAction';
import { QueueScheduler } from './QueueScheduler';

/**
 * Queue Scheduler
 *
 * 队列调度器
 *
 * <span class="informal">Put every next task on a queue, instead of executing it immediately</span>
 *
 * 将每个下一个任务放在队列中，而不是立即执行
 *
 * `queue` scheduler, when used with delay, behaves the same as {@link asyncScheduler} scheduler.
 *
 * `queue` 调度程序，当与延迟一起使用时，其行为与 {@link asyncScheduler} 调度程序相同。
 *
 * When used without delay, it schedules given task synchronously - executes it right when
 * it is scheduled. However when called recursively, that is when inside the scheduled task,
 * another task is scheduled with queue scheduler, instead of executing immediately as well,
 * that task will be put on a queue and wait for current one to finish.
 *
 * 当不延迟使用时，它会同步调度给定的任务 - 在调度时立即执行它。然而，当递归调用时，即在计划任务内部，另一个任务被队列调度程序调度，而不是立即执行，该任务将被放入队列并等待当前任务完成。
 *
 * This means that when you execute task with `queue` scheduler, you are sure it will end
 * before any other task scheduled with that scheduler will start.
 *
 * 这意味着当你使用 `queue` 调度程序执行任务时，你确定它会在使用该调度程序调度的任何其他任务开始之前结束。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Schedule recursively first, then do something
 *
 * 先递归调度，然后做某事
 *
 * ```ts
 * import { queueScheduler } from 'rxjs';
 *
 * queueScheduler.schedule(() => {
 *   queueScheduler.schedule(() => console.log('second')); // will not happen now, but will be put on a queue
 *
 *   console.log('first');
 * });
 *
 * // Logs:
 * // "first"
 * // "second"
 * ```
 *
 * Reschedule itself recursively
 *
 * 递归地重新调度自身
 *
 * ```ts
 * import { queueScheduler } from 'rxjs';
 *
 * queueScheduler.schedule(function(state) {
 *   if (state !== 0) {
 *     console.log('before', state);
 *     this.schedule(state - 1); // `this` references currently executing Action,
 *                               // which we reschedule with new state
 *     console.log('after', state);
 *   }
 * }, 0, 3);
 *
 * // In scheduler that runs recursively, you would expect:
 * // "before", 3
 * // "before", 2
 * // "before", 1
 * // "after", 1
 * // "after", 2
 * // "after", 3
 *
 * // But with queue it logs:
 * // "before", 3
 * // "after", 3
 * // "before", 2
 * // "after", 2
 * // "before", 1
 * // "after", 1
 * ```
 */

export const queueScheduler = new QueueScheduler(QueueAction);

/**
 * @deprecated Renamed to {@link queueScheduler}. Will be removed in v8.
 *
 * 重命名为 {@link queueScheduler}。将在 v8 中删除。
 *
 */
export const queue = queueScheduler;
