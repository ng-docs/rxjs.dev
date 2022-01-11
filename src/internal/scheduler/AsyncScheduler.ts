import { Scheduler } from '../Scheduler';
import { Action } from './Action';
import { AsyncAction } from './AsyncAction';

export class AsyncScheduler extends Scheduler {
  public actions: Array<AsyncAction<any>> = [];
  /**
   * A flag to indicate whether the Scheduler is currently executing a batch of
   * queued actions.
   *
   * 指示调度程序当前是否正在执行一批排队的操作的标志。
   *
   * @type {boolean}
   * @internal
   */
  public _active: boolean = false;
  /**
   * An internal ID used to track the latest asynchronous task such as those
   * coming from `setTimeout`, `setInterval`, `requestAnimationFrame`, and
   * others.
   *
   * 用于跟踪最新异步任务的内部 ID，例如来自 `setTimeout`、`setInterval`、`requestAnimationFrame` 等的任务。
   *
   * @type {any}
   * @internal
   */
  public _scheduled: any = undefined;

  constructor(SchedulerAction: typeof Action, now: () => number = Scheduler.now) {
    super(SchedulerAction, now);
  }

  public flush(action: AsyncAction<any>): void {
    const { actions } = this;

    if (this._active) {
      actions.push(action);
      return;
    }

    let error: any;
    this._active = true;

    do {
      if ((error = action.execute(action.state, action.delay))) {
        break;
      }
    } while ((action = actions.shift()!)); // exhaust the scheduler queue

    this._active = false;

    if (error) {
      while ((action = actions.shift()!)) {
        action.unsubscribe();
      }
      throw error;
    }
  }
}
