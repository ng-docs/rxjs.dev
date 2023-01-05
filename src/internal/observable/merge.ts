import { Observable } from '../Observable';
import { ObservableInput, ObservableInputTuple, SchedulerLike } from '../types';
import { mergeAll } from '../operators/mergeAll';
import { innerFrom } from './innerFrom';
import { EMPTY } from './empty';
import { popNumber, popScheduler } from '../util/args';
import { from } from './from';

export function merge<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A[number]>;
export function merge<A extends readonly unknown[]>(...sourcesAndConcurrency: [...ObservableInputTuple<A>, number?]): Observable<A[number]>;
/**
 * @deprecated The `scheduler` parameter will be removed in v8. Use `scheduled` and `mergeAll`. Details: <https://rxjs.dev/deprecations/scheduler-argument>
 *
 * `scheduler` 参数将在 v8 中删除。请改用 `scheduled` 和 `mergeAll`。详细信息： <https://rxjs.dev/deprecations/scheduler-argument>
 *
 */
export function merge<A extends readonly unknown[]>(
  ...sourcesAndScheduler: [...ObservableInputTuple<A>, SchedulerLike?]
): Observable<A[number]>;
/**
 * @deprecated The `scheduler` parameter will be removed in v8. Use `scheduled` and `mergeAll`. Details: <https://rxjs.dev/deprecations/scheduler-argument>
 *
 * `scheduler` 参数将在 v8 中删除。请改用 `scheduled` 和 `mergeAll`。详细信息： <https://rxjs.dev/deprecations/scheduler-argument>
 *
 */
export function merge<A extends readonly unknown[]>(
  ...sourcesAndConcurrencyAndScheduler: [...ObservableInputTuple<A>, number?, SchedulerLike?]
): Observable<A[number]>;

/**
 * Creates an output Observable which concurrently emits all values from every
 * given input Observable.
 *
 * 创建一个输出 Observable，它会同时从每个给定的输入 Observable 中发送所有值。
 *
 * <span class="informal">Flattens multiple Observables together by blending
 * their values into one Observable.</span>
 *
 * <span class="informal">通过将多个 Observable 的值混合到一个 Observable 中来将多个 Observable 扁平化。</span>
 *
 * ![](merge.png)
 *
 * `merge` subscribes to each given input Observable (as arguments), and simply
 * forwards (without doing any transformation) all the values from all the input
 * Observables to the output Observable. The output Observable only completes
 * once all input Observables have completed. Any error delivered by an input
 * Observable will be immediately emitted on the output Observable.
 *
 * `merge` 订阅每个给定的输入 Observable（作为参数传入），并简单地将所有输入 Observable 中的所有值转发（不做任何转换）到输出 Observable。只有在所有输入 Observable 都完成后，输出 Observable 才会完成。输入 Observable 传递的任何错误都会立即在输出 Observable 上发送。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Merge together two Observables: 1s interval and clicks
 *
 * 将两个 Observable 合并在一起：“一秒定时”和“点击”
 *
 * ```ts
 * import { merge, fromEvent, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const timer = interval(1000);
 * const clicksOrTimer = merge(clicks, timer);
 * clicksOrTimer.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // timer will emit ascending values, one every second(1000ms) to console
 * // clicks logs MouseEvents to console every time the "document" is clicked
 * // Since the two streams are merged you see these happening
 * // as they occur.
 * ```
 *
 * Merge together 3 Observables, but run only 2 concurrently
 *
 * 合并 3 个 Observable，但同时运行 2 个
 *
 * ```ts
 * import { interval, take, merge } from 'rxjs';
 *
 * const timer1 = interval(1000).pipe(take(10));
 * const timer2 = interval(2000).pipe(take(6));
 * const timer3 = interval(500).pipe(take(10));
 *
 * const concurrent = 2; // the argument
 * const merged = merge(timer1, timer2, timer3, concurrent);
 * merged.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // - First timer1 and timer2 will run concurrently
 * // - timer1 will emit a value every 1000ms for 10 iterations
 * // - timer2 will emit a value every 2000ms for 6 iterations
 * // - after timer1 hits its max iteration, timer2 will
 * //   continue, and timer3 will start to run concurrently with timer2
 * // - when timer2 hits its max iteration it terminates, and
 * //   timer3 will continue to emit a value every 500ms until it is complete
 * ```
 * @see {@link mergeAll}
 * @see {@link mergeMap}
 * @see {@link mergeMapTo}
 * @see {@link mergeScan}
 * @param {...ObservableInput} observables Input Observables to merge together.
 *
 * 要合并在一起的输入 Observables。
 *
 * @param {number} [concurrent=Infinity] Maximum number of input
 * Observables being subscribed to concurrently.
 *
 * 要同时订阅的输入 Observable 的最大数量。
 *
 * @param {SchedulerLike} [scheduler=null] The {@link SchedulerLike} to use for managing
 * concurrency of input Observables.
 *
 * 用于管理输入 Observables 并发性的 {@link SchedulerLike}。
 *
 * @return {Observable} an Observable that emits items that are the result of
 * every input Observable.
 *
 * 一个 Observable，它发送的条目是每个输入 Observable 的结果。
 *
 */
export function merge(...args: (ObservableInput<unknown> | number | SchedulerLike)[]): Observable<unknown> {
  const scheduler = popScheduler(args);
  const concurrent = popNumber(args, Infinity);
  const sources = args as ObservableInput<unknown>[];
  return !sources.length
    ? // No source provided
      EMPTY
    : sources.length === 1
    ? // One source? Just return it.
      innerFrom(sources[0])
    : // Merge all sources
      mergeAll(concurrent)(from(sources, scheduler));
}
