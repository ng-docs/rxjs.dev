import { AsapAction } from './AsapAction';
import { AsapScheduler } from './AsapScheduler';

/**
 * Asap Scheduler
 *
 * 尽快调度程序
 *
 * <span class="informal">Perform task as fast as it can be performed asynchronously</span>
 *
 * 尽可能快地执行任务，因为它可以异步执行
 *
 * `asap` scheduler behaves the same as {@link asyncScheduler} scheduler when you use it to delay task
 * in time. If however you set delay to `0`, `asap` will wait for current synchronously executing
 * code to end and then it will try to execute given task as fast as possible.
 *
 * 当你使用 `asap` 调度程序来延迟任务时，它的行为与 {@link asyncScheduler} 调度程序相同。但是，如果你将延迟设置为 `0` ，则 `asap` 将等待当前同步执行的代码结束，然后它将尝试尽快执行给定的任务。
 *
 * `asap` scheduler will do its best to minimize time between end of currently executing code
 * and start of scheduled task. This makes it best candidate for performing so called "deferring".
 * Traditionally this was achieved by calling `setTimeout(deferredTask, 0)`, but that technique involves
 * some (although minimal) unwanted delay.
 *
 * `asap` 调度程序将尽最大努力减少当前执行代码结束和计划任务开始之间的时间。这使它成为执行所谓的“延迟”的最佳候选者。传统上，这是通过调用 `setTimeout(deferredTask, 0)` 来实现的，但是该技术涉及一些（尽管很小）不需要的延迟。
 *
 * Note that using `asap` scheduler does not necessarily mean that your task will be first to process
 * after currently executing code. In particular, if some task was also scheduled with `asap` before,
 * that task will execute first. That being said, if you need to schedule task asynchronously, but
 * as soon as possible, `asap` scheduler is your best bet.
 *
 * 请注意，使用 `asap` 调度程序并不一定意味着你的任务将在当前执行代码之后首先处理。特别是，如果之前还用 `asap` 安排了某个任务，则该任务将首先执行。话虽如此，如果你需要异步调度任务，但尽快， `asap` scheduler 是你最好的选择。
 *
 * ## Example
 *
 * ## 例子
 *
 * Compare async and asap scheduler&lt;
 *
 * 比较异步和尽快调度器&lt;
 *
 * ```ts
 * import { asapScheduler, asyncScheduler } from 'rxjs';
 *
 * asyncScheduler.schedule(() => console.log('async')); // scheduling 'async' first...
 * asapScheduler.schedule(() => console.log('asap'));
 *
 * // Logs:
 * // "asap"
 * // "async"
 * // ... but 'asap' goes first!
 * ```
 */

export const asapScheduler = new AsapScheduler(AsapAction);

/**
 * @deprecated Renamed to {@link asapScheduler}. Will be removed in v8.
 *
 * 重命名为 {@link asapScheduler}。将在 v8 中删除。
 *
 */
export const asap = asapScheduler;
