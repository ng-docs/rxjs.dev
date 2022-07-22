import { Observable } from '../Observable';
import { innerFrom } from '../observable/innerFrom';
import { Subscriber } from '../Subscriber';
import { ObservableInput, SchedulerLike } from '../types';
import { executeSchedule } from '../util/executeSchedule';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * A process embodying the general "merge" strategy. This is used in
 * `mergeMap` and `mergeScan` because the logic is otherwise nearly identical.
 *
 * 体现一般化“合并”策略的过程。`mergeMap` 和 `mergeScan` 都用了它，因为其逻辑几乎相同。
 *
 * @param source The original source observable
 *
 * 原始的源 Observable
 *
 * @param subscriber The consumer subscriber
 *
 * 消费者/订阅者
 *
 * @param project The projection function to get our inner sources
 *
 * 用于获取内部资源的投影函数
 *
 * @param concurrent The number of concurrent inner subscriptions
 *
 * 内部订阅的最大并发数
 *
 * @param onBeforeNext Additional logic to apply before nexting to our consumer
 *
 * 在传给（next to）消费者之前要执行的附加逻辑
 *
 * @param expand If `true` this will perform an "expand" strategy, which differs only
 * in that it recurses, and the inner subscription must be schedule-able.
 *
 * 如果为 `true`，这将执行“展开”策略，其唯一的不同点在于它是递归的，并且内部订阅必须是可调度的。
 *
 * @param innerSubScheduler A scheduler to use to schedule inner subscriptions,
 * this is to support the expand strategy, mostly, and should be deprecated
 *
 * 用于调度各个内部订阅的调度器，主要用于支持这里的展开策略，即将弃用
 *
 */
export function mergeInternals<T, R>(
  source: Observable<T>,
  subscriber: Subscriber<R>,
  project: (value: T, index: number) => ObservableInput<R>,
  concurrent: number,
  onBeforeNext?: (innerValue: R) => void,
  expand?: boolean,
  innerSubScheduler?: SchedulerLike,
  additionalFinalizer?: () => void
) {
  // Buffered values, in the event of going over our concurrency limit
  const buffer: T[] = [];
  // The number of active inner subscriptions.
  let active = 0;
  // An index to pass to our accumulator function
  let index = 0;
  // Whether or not the outer source has completed.
  let isComplete = false;

  /**
   * Checks to see if we can complete our result or not.
   *
   * 检查我们是否可以完成我们的结果。
   *
   */
  const checkComplete = () => {
    // If the outer has completed, and nothing is left in the buffer,
    // and we don't have any active inner subscriptions, then we can
    // Emit the state and complete.
    if (isComplete && !buffer.length && !active) {
      subscriber.complete();
    }
  };

  // If we're under our concurrency limit, just start the inner subscription, otherwise buffer and wait.
  const outerNext = (value: T) => (active < concurrent ? doInnerSub(value) : buffer.push(value));

  const doInnerSub = (value: T) => {
    // If we're expanding, we need to emit the outer values and the inner values
    // as the inners will "become outers" in a way as they are recursively fed
    // back to the projection mechanism.
    expand && subscriber.next(value as any);

    // Increment the number of active subscriptions so we can track it
    // against our concurrency limit later.
    active++;

    // A flag used to show that the inner observable completed.
    // This is checked during finalization to see if we should
    // move to the next item in the buffer, if there is on.
    let innerComplete = false;

    // Start our inner subscription.
    innerFrom(project(value, index++)).subscribe(
      createOperatorSubscriber(
        subscriber,
        (innerValue) => {
          // `mergeScan` has additional handling here. For example
          // taking the inner value and updating state.
          onBeforeNext?.(innerValue);

          if (expand) {
            // If we're expanding, then just recurse back to our outer
            // handler. It will emit the value first thing.
            outerNext(innerValue as any);
          } else {
            // Otherwise, emit the inner value.
            subscriber.next(innerValue);
          }
        },
        () => {
          // Flag that we have completed, so we know to check the buffer
          // during finalization.
          innerComplete = true;
        },
        // Errors are passed to the destination.
        undefined,
        () => {
          // During finalization, if the inner completed (it wasn't errored or
          // cancelled), then we want to try the next item in the buffer if
          // there is one.
          if (innerComplete) {
            // We have to wrap this in a try/catch because it happens during
            // finalization, possibly asynchronously, and we want to pass
            // any errors that happen (like in a projection function) to
            // the outer Subscriber.
            try {
              // INNER SOURCE COMPLETE
              // Decrement the active count to ensure that the next time
              // we try to call `doInnerSub`, the number is accurate.
              active--;
              // If we have more values in the buffer, try to process those
              // Note that this call will increment `active` ahead of the
              // next conditional, if there were any more inner subscriptions
              // to start.
              while (buffer.length && active < concurrent) {
                const bufferedValue = buffer.shift()!;
                // Particularly for `expand`, we need to check to see if a scheduler was provided
                // for when we want to start our inner subscription. Otherwise, we just start
                // are next inner subscription.
                if (innerSubScheduler) {
                  executeSchedule(subscriber, innerSubScheduler, () => doInnerSub(bufferedValue));
                } else {
                  doInnerSub(bufferedValue);
                }
              }
              // Check to see if we can complete, and complete if so.
              checkComplete();
            } catch (err) {
              subscriber.error(err);
            }
          }
        }
      )
    );
  };

  // Subscribe to our source observable.
  source.subscribe(
    createOperatorSubscriber(subscriber, outerNext, () => {
      // Outer completed, make a note of it, and check to see if we can complete everything.
      isComplete = true;
      checkComplete();
    })
  );

  // Additional finalization (for when the destination is torn down).
  // Other finalization is added implicitly via subscription above.
  return () => {
    additionalFinalizer?.();
  };
}
