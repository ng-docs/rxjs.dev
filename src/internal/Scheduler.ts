import { Action } from './scheduler/Action';
import { Subscription } from './Subscription';
import { SchedulerLike, SchedulerAction } from './types';
import { dateTimestampProvider } from './scheduler/dateTimestampProvider';

/**
 * An execution context and a data structure to order tasks and schedule their
 * execution. Provides a notion of (potentially virtual) time, through the
 * `now()` getter method.
 *
 * 一种执行上下文和数据结构，用于对任务进行排序并对它们的执行进行排期。通过 `now()` 这个 getter 方法提供（可能是虚拟的）时间概念。
 *
 * Each unit of work in a Scheduler is called an `Action`.
 *
 * 调度器中的每个工作单元都称为一个 `Action`。
 *
 * ```ts
 * class Scheduler {
 *   now(): number;
 *   schedule(work, delay?, state?): Subscription;
 * }
 * ```
 * @class Scheduler
 * @deprecated Scheduler is an internal implementation detail of RxJS, and
 * should not be used directly. Rather, create your own class and implement
 * {@link SchedulerLike}. Will be made internal in v8.
 *
 * 调度器是 RxJS 的内部实现细节，不应该直接使用。相反，请创建你自己的类并实现 {@link SchedulerLike}。将在 v8 中内部化。
 *
 */
export class Scheduler implements SchedulerLike {
  public static now: () => number = dateTimestampProvider.now;

  constructor(private schedulerActionCtor: typeof Action, now: () => number = Scheduler.now) {
    this.now = now;
  }

  /**
   * A getter method that returns a number representing the current time
   * (at the time this function was called) according to the scheduler's own
   * internal clock.
   *
   * 根据调度器自己的内部时钟返回一个表示当前时间（调用此函数时）的数字的 getter 方法。
   *
   * @return {number} A number that represents the current time. May or may not
   * have a relation to wall-clock time. May or may not refer to a time unit
   * (e.g. milliseconds).
   *
   * 表示当前时间的数字。可能与钟表上的时间有关，也可能无关。可能会也可能不会带有时间单位（例如毫秒）。
   *
   */
  public now: () => number;

  /**
   * Schedules a function, `work`, for execution. May happen at some point in
   * the future, according to the `delay` parameter, if specified. May be passed
   * some context object, `state`, which will be passed to the `work` function.
   *
   * 安排执行一个函数 `work`。根据 `delay` 参数（如果已指定），可能在将来的某个时间发生。可能会传递一些上下文对象 `state`，它将传给 `work` 函数。
   *
   * The given arguments will be processed an stored as an Action object in a
   * queue of actions.
   *
   * 给定的参数将被处理并存储为动作队列中的动作对象。
   *
   * @param {function(state: ?T): ?Subscription} work A function representing a
   * task, or some unit of work to be executed by the Scheduler.
   *
   * 表示任务的函数，或要由此调度器执行的某个工作单元。
   *
   * @param {number} [delay] Time to wait before executing the work, where the
   * time unit is implicit and defined by the Scheduler itself.
   * @param {T} [state] Some contextual data that the `work` function uses when
   * called by the Scheduler.
   * @return {Subscription} A subscription in order to be able to unsubscribe
   * the scheduled work.
   *
   * 一个订阅对象，以便能退订已安排的工作。
   *
   */
  public schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay: number = 0, state?: T): Subscription {
    return new this.schedulerActionCtor<T>(this, work).schedule(state, delay);
  }
}
