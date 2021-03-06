import { Scheduler } from '../Scheduler';
import { Subscription } from '../Subscription';
import { SchedulerAction } from '../types';

/**
 * A unit of work to be executed in a `scheduler`. An action is typically
 * created from within a {@link SchedulerLike} and an RxJS user does not need to concern
 * themselves about creating and manipulating an Action.
 *
 * 要在 `scheduler` 中执行的工作单元。动作通常是从 {@link SchedulerLike} 中创建的，RxJS 的用户不需要关心创建和操纵等动作。
 *
 * ```ts
 * class Action<T> extends Subscription {
 *   new (scheduler: Scheduler, work: (state?: T) => void);
 *   schedule(state?: T, delay: number = 0): Subscription;
 * }
 * ```
 * @class Action<T>
 */
export class Action<T> extends Subscription {
  constructor(scheduler: Scheduler, work: (this: SchedulerAction<T>, state?: T) => void) {
    super();
  }
  /**
   * Schedules this action on its parent {@link SchedulerLike} for execution. May be passed
   * some context object, `state`. May happen at some point in the future,
   * according to the `delay` parameter, if specified.
   *
   * 在其父 {@link SchedulerLike} 上安排此操作以执行。可以传递一些上下文对象 `state`。根据其 `delay` 参数（如果指定），它可能在将来的某个时间点发生。
   *
   * @param {T} [state] Some contextual data that the `work` function uses when
   * called by the Scheduler.
   *
   * 当调度器调用 `work` 函数时要使用的一些上下文数据。
   *
   * @param {number} [delay] Time to wait before executing the work, where the
   * time unit is implicit and defined by the Scheduler.
   *
   * 执行此工作前要等待的时间，其中时间单位是隐式的，由调度器定义。
   *
   * @return {void}
   */
  public schedule(state?: T, delay: number = 0): Subscription {
    return this;
  }
}
