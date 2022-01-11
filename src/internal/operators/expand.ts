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
 * `scheduler` 参数将在 v8 中删除。如果你需要安排内部订阅，请在投影函数中使用 `subscribeOn` ： `expand((value) => fn(value).pipe(subscribeOn(scheduler)))` 。详细信息：详细信息： [https](https://rxjs.dev/deprecations/scheduler-argument) ://rxjs.dev/deprecations/scheduler-argument
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
 * 递归地将每个源值投影到一个 Observable，该 Observable 被合并到输出 Observable 中。
 *
 * <span class="informal">It's similar to {@link mergeMap}, but applies the
 * projection function to every source value as well as every output value.
 * It's recursive.</span>
 *
 * 它类似于 {@link mergeMap}，但将投影函数应用于每个源值以及每个输出值。它是递归的。
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
 * 返回一个 Observable，该 Observable 基于将你提供的函数应用于源 Observable 发出的每个项目，其中该函数返回一个 Observable，然后合并这些结果 Observable 并发出此合并的结果来发出项目。 *Expand*将在输出 Observable 上重新发出每个源值。然后，将每个输出值提供给 `project` 函数，该函数返回一个内部 Observable 以合并到输出 Observable 上。投影产生的那些输出值也被赋予 `project` 函数以产生新的输出值。这就是*expand*递归的行为方式。
 *
 * ## Example
 *
 * ## 例子
 *
 * Start emitting the powers of two on every click, at most 10 of them
 *
 * 每次点击时开始发射 2 的幂，最多 10 个
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
 * 一个函数，当应用于由源或输出 Observable 发出的项目时，会返回一个 Observable。
 *
 * @param {number} [concurrent=Infinity] Maximum number of input
 * Observables being subscribed to concurrently.
 * @param {SchedulerLike} [scheduler=null] The {@link SchedulerLike} to use for subscribing to
 * each projected inner Observable.
 *
 * 用于订阅每个投影的内部 Observable。
 *
 * @return A function that returns an Observable that emits the source values
 * and also result of applying the projection function to each value emitted on
 * the output Observable and merging the results of the Observables obtained
 * from this transformation.
 *
 * 一个函数，它返回一个发出源值的 Observable 以及将投影函数应用于输出 Observable 上发出的每个值并合并从此转换获得的 Observable 的结果的结果。
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
      project,
      concurrent,

      // onBeforeNext
      undefined,

      // Expand-specific
      true, // Use expand path
      scheduler // Inner subscription scheduler
    )
  );
}
