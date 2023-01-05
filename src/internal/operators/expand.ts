import { OperatorFunction, ObservableInput, ObservedValueOf, SchedulerLike } from '../types';
import { operate } from '../util/lift';
import { mergeInternals } from './mergeInternals';

/* tslint:disable:max-line-length */
export function expand<T, O extends ObservableInput<unknown>>(
  project: (value: T, index: number) => O,
  concurrent?: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, ObservedValueOf<O>>;
/**
 * @deprecated The `scheduler` parameter will be removed in v8. If you need to schedule the inner subscription,
 * use `subscribeOn` within the projection function: `expand((value) => fn(value).pipe(subscribeOn(scheduler)))`.
 * Details: Details: <https://rxjs.dev/deprecations/scheduler-argument>
 *
 * `scheduler` 参数将在 v8 中删除。如果你需要安排内部订阅，请在投影函数中使用 `subscribeOn`： `expand((value) => fn(value).pipe(subscribeOn(scheduler)))`。详细信息： <https://rxjs.dev/deprecations/scheduler-argument>
 *
 */
export function expand<T, O extends ObservableInput<unknown>>(
  project: (value: T, index: number) => O,
  concurrent: number | undefined,
  scheduler: SchedulerLike
): OperatorFunction<T, ObservedValueOf<O>>;
/* tslint:enable:max-line-length */

/**
 * Recursively projects each source value to an Observable which is merged in
 * the output Observable.
 *
 * 递归地将每个源值投影为一个 Observable，该 Observable 会被合并到输出 Observable 中。
 *
 * <span class="informal">It's similar to {@link mergeMap}, but applies the
 * projection function to every source value as well as every output value.
 * It's recursive.</span>
 *
 * <span class="informal">它类似于 {@link mergeMap}，但会将投影函数应用于每个源值以及每个输出值。它是递归的。</span>
 *
 * ![](expand.png)
 *
 * Returns an Observable that emits items based on applying a function that you
 * supply to each item emitted by the source Observable, where that function
 * returns an Observable, and then merging those resulting Observables and
 * emitting the results of this merger. *Expand* will re-emit on the output
 * Observable every source value. Then, each output value is given to the
 * `project` function which returns an inner Observable to be merged on the
 * output Observable. Those output values resulting from the projection are also
 * given to the `project` function to produce new output values. This is how
 * *expand* behaves recursively.
 *
 * 返回一个 Observable，该 Observable 将针对源 Observable 发出的每个条目调用某个函数，该函数会返回一个 Observable，然后合并这些结果 Observable，并发送其所有条目。*expand* 会在输出 Observable 上重新发送每个源的每个值。然后，对每个输出值调用 `project` 函数，该函数会返回一个内部 Observable，并将其合并到输出 Observable 上。此投影产生的那些输出值也会再传给 `project` 函数以产生新的输出值。这就是 *expand* 的递归式行为。
 *
 * ## Example
 *
 * ## 例子
 *
 * Start emitting the powers of two on every click, at most 10 of them
 *
 * 每次点击时开始发送 2 的幂，最多 10 个
 *
 * ```ts
 * import { fromEvent, map, expand, of, delay, take } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const powersOfTwo = clicks.pipe(
 *   map(() => 1),
 *   expand(x => of(2 * x).pipe(delay(1000))),
 *   take(10)
 * );
 * powersOfTwo.subscribe(x => console.log(x));
 * ```
 * @see {@link mergeMap}
 * @see {@link mergeScan}
 * @param {function(value: T, index: number) => Observable} project A function
 * that, when applied to an item emitted by the source or the output Observable,
 * returns an Observable.
 *
 * 一个函数，当应用于由源 Observable 或输出 Observable 发送的条目时，会返回一个 Observable。
 *
 * @param {number} [concurrent=Infinity] Maximum number of input
 * Observables being subscribed to concurrently.
 *
 * 要同时订阅的输入 Observable 的最大数量。
 *
 * @param {SchedulerLike} [scheduler=null] The {@link SchedulerLike} to use for subscribing to
 * each projected inner Observable.
 *
 * 一个 {@link SchedulerLike}，用于订阅每个投影出的内部 Observable。
 *
 * @return A function that returns an Observable that emits the source values
 * and also result of applying the projection function to each value emitted on
 * the output Observable and merging the results of the Observables obtained
 * from this transformation.
 *
 * 一个函数，它返回一个发送源值的 Observable 并针对输出 Observable 上发送的每个值调用投影函数，并合并从此转换来的 Observable 的结果。
 *
 */
export function expand<T, O extends ObservableInput<unknown>>(
  project: (value: T, index: number) => O,
  concurrent = Infinity,
  scheduler?: SchedulerLike
): OperatorFunction<T, ObservedValueOf<O>> {
  concurrent = (concurrent || 0) < 1 ? Infinity : concurrent;
  return operate((source, subscriber) =>
    mergeInternals(
      // General merge params
      source,
      subscriber,

      // HACK: Cast because TypeScript seems to get confused here.
      project as (value: T, index: number) => ObservableInput<ObservedValueOf<O>>,
      concurrent,

      // onBeforeNext
      undefined,

      // Expand-specific
      true, // Use expand path
      scheduler // Inner subscription scheduler
    )
  );
}
