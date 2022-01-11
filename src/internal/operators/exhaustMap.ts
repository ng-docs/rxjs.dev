import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { ObservableInput, OperatorFunction, ObservedValueOf } from '../types';
import { map } from './map';
import { innerFrom } from '../observable/innerFrom';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/* tslint:disable:max-line-length */
export function exhaustMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O
): OperatorFunction<T, ObservedValueOf<O>>;
/**
 * @deprecated The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: <https://rxjs.dev/deprecations/resultSelector>
 *
 * `resultSelector` 参数将在 v8 中删除。请改用内部 `map`。详细信息： <https://rxjs.dev/deprecations/resultSelector>
 *
 */
export function exhaustMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector: undefined
): OperatorFunction<T, ObservedValueOf<O>>;
/**
 * @deprecated The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: <https://rxjs.dev/deprecations/resultSelector>
 *
 * `resultSelector` 参数将在 v8 中删除。请改用内部 `map`。详细信息： <https://rxjs.dev/deprecations/resultSelector>
 *
 */
export function exhaustMap<T, I, R>(
  project: (value: T, index: number) => ObservableInput<I>,
  resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R
): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * Projects each source value to an Observable which is merged in the output
 * Observable only if the previous projected Observable has completed.
 *
 * 将每个源值投影成一个 Observable，该 Observable 仅在前一个投影的 Observable 完成时才会合并到输出 Observable 中。
 *
 * <span class="informal">Maps each value to an Observable, then flattens all of
 * these inner Observables using {@link exhaust}.</span>
 *
 * <span class="informal">将每个值映射到一个 Observable，然后使用 {@link exhaust} 展平所有这些内部 Observable。</span>
 *
 * ![](exhaustMap.png)
 *
 * Returns an Observable that emits items based on applying a function that you
 * supply to each item emitted by the source Observable, where that function
 * returns an (so-called "inner") Observable. When it projects a source value to
 * an Observable, the output Observable begins emitting the items emitted by
 * that projected Observable. However, `exhaustMap` ignores every new projected
 * Observable if the previous projected Observable has not yet completed. Once
 * that one completes, it will accept and flatten the next projected Observable
 * and repeat this process.
 *
 * 返回一个 Observable，该 Observable 会针对源 Observable 发送的每个条目调用某个函数并发送其结果，该函数会返回一个（所谓的“内部”）Observable。当它将源值投影到 Observable 时，输出 Observable 就会开始发送由该投影出的 Observable 发送的条目。但是，如果前一个投影出的 Observable 尚未完成，`exhaustMap` 就会忽略每个新的投影 Observable。一旦完成，它将接受并展平下一个投影出的 Observable 并重复此过程。
 *
 * ## Example
 *
 * ## 例子
 *
 * Run a finite timer for each click, only if there is no currently active timer
 *
 * 仅当目前没有活动计时器时，才为每次点击运行有限计时器
 *
 * ```ts
 * import { fromEvent, exhaustMap, interval, take } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   exhaustMap(() => interval(1000).pipe(take(5)))
 * );
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link concatMap}
 * @see {@link exhaust}
 * @see {@link mergeMap}
 * @see {@link switchMap}
 * @param {function(value: T, ?index: number): ObservableInput} project A function
 * that, when applied to an item emitted by the source Observable, returns an
 * Observable.
 *
 * 一个函数，当针对源 Observable 发送的条目调用它时，会返回一个 Observable。
 *
 * @return A function that returns an Observable containing projected
 * Observables of each item of the source, ignoring projected Observables that
 * start before their preceding Observable has completed.
 *
 * 一个函数，它会返回一个 Observable，其中包含根据源中每个条目投影出的 Observable ，并忽略在前一个 Observable 完成之前已开始的那些投影出的 Observable。
 *
 */
export function exhaustMap<T, R, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector?: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R
): OperatorFunction<T, ObservedValueOf<O> | R> {
  if (resultSelector) {
    // DEPRECATED PATH
    return (source: Observable<T>) =>
      source.pipe(exhaustMap((a, i) => innerFrom(project(a, i)).pipe(map((b: any, ii: any) => resultSelector(a, b, i, ii)))));
  }
  return operate((source, subscriber) => {
    let index = 0;
    let innerSub: Subscriber<T> | null = null;
    let isComplete = false;
    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (outerValue) => {
          if (!innerSub) {
            innerSub = new OperatorSubscriber(subscriber, undefined, () => {
              innerSub = null;
              isComplete && subscriber.complete();
            });
            innerFrom(project(outerValue, index++)).subscribe(innerSub);
          }
        },
        () => {
          isComplete = true;
          !innerSub && subscriber.complete();
        }
      )
    );
  });
}
