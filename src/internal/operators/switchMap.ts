import { Subscriber } from '../Subscriber';
import { ObservableInput, OperatorFunction, ObservedValueOf } from '../types';
import { innerFrom } from '../observable/innerFrom';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/* tslint:disable:max-line-length */
export function switchMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O
): OperatorFunction<T, ObservedValueOf<O>>;
/**
 * @deprecated The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: <https://rxjs.dev/deprecations/resultSelector>
 *
 * `resultSelector` 参数将在 v8 中删除。请改用内部 `map`。详细信息： <https://rxjs.dev/deprecations/resultSelector>
 *
 */
export function switchMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector: undefined
): OperatorFunction<T, ObservedValueOf<O>>;
/**
 * @deprecated The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: <https://rxjs.dev/deprecations/resultSelector>
 *
 * `resultSelector` 参数将在 v8 中删除。请改用内部 `map`。详细信息： <https://rxjs.dev/deprecations/resultSelector>
 *
 */
export function switchMap<T, R, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R
): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * Projects each source value to an Observable which is merged in the output
 * Observable, emitting values only from the most recently projected Observable.
 *
 * 将每个源值投影到一个 Observable，该 Observable 合并到输出 Observable 中，仅从最近投影的 Observable 发出值。
 *
 * <span class="informal">Maps each value to an Observable, then flattens all of
 * these inner Observables.</span>
 *
 * <span class="informal">将每个值映射到一个 Observable，然后展平所有这些内部 Observable。</span>
 *
 * ![](switchMap.png)
 *
 * Returns an Observable that emits items based on applying a function that you
 * supply to each item emitted by the source Observable, where that function
 * returns an (so-called "inner") Observable. Each time it observes one of these
 * inner Observables, the output Observable begins emitting the items emitted by
 * that inner Observable. When a new inner Observable is emitted, `switchMap`
 * stops emitting items from the earlier-emitted inner Observable and begins
 * emitting items from the new one. It continues to behave like this for
 * subsequent inner Observables.
 *
 * 返回一个 Observable，该 Observable 基于应用你提供给源 Observable 发出的每个项目的函数来发射项目，其中该函数返回一个（所谓的“内部”）Observable。每次它观察到这些内部 Observable 之一时，输出 Observable 开始发射由该内部 Observable 发射的项目。当一个新的内部 Observable 被发射时，`switchMap` 停止从之前发射的内部 Observable 发射项目，并开始从新的发射项目。对于后续的内部 Observable，它继续表现得像这样。
 *
 * ## Example
 *
 * ## 例子
 *
 * Generate new Observable according to source Observable values
 *
 * 根据源 Observable 值生成新的 Observable
 *
 * ```ts
 * import { of, switchMap } from 'rxjs';
 *
 * const switched = of(1, 2, 3).pipe(switchMap(x => of(x, x ** 2, x ** 3)));
 * switched.subscribe(x => console.log(x));
 * // outputs
 * // 1
 * // 1
 * // 1
 * // 2
 * // 4
 * // 8
 * // 3
 * // 9
 * // 27
 * ```
 *
 * Restart an interval Observable on every click event
 *
 * 在每个点击事件上重新启动一个时间间隔 Observable
 *
 * ```ts
 * import { fromEvent, switchMap, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(switchMap(() => interval(1000)));
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link concatMap}
 * @see {@link exhaustMap}
 * @see {@link mergeMap}
 * @see {@link switchAll}
 * @see {@link switchMapTo}
 * @param {function(value: T, index: number): ObservableInput} project A function
 * that, when applied to an item emitted by the source Observable, returns an
 * Observable.
 *
 * 一个函数，当应用于源 Observable 发出的项目时，返回一个 Observable。
 *
 * @return A function that returns an Observable that emits the result of
 * applying the projection function (and the optional deprecated
 * `resultSelector`) to each item emitted by the source Observable and taking
 * only the values from the most recently projected inner Observable.
 *
 * 一个返回 Observable 的函数，该函数发出将投影函数（和可选的不推荐使用的 `resultSelector`）应用于源 Observable 发出的每个项目的结果，并且仅从最近投影的内部 Observable 中获取值。
 *
 */
export function switchMap<T, R, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector?: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R
): OperatorFunction<T, ObservedValueOf<O> | R> {
  return operate((source, subscriber) => {
    let innerSubscriber: Subscriber<ObservedValueOf<O>> | null = null;
    let index = 0;
    // Whether or not the source subscription has completed
    let isComplete = false;

    // We only complete the result if the source is complete AND we don't have an active inner subscription.
    // This is called both when the source completes and when the inners complete.
    const checkComplete = () => isComplete && !innerSubscriber && subscriber.complete();

    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value) => {
          // Cancel the previous inner subscription if there was one
          innerSubscriber?.unsubscribe();
          let innerIndex = 0;
          const outerIndex = index++;
          // Start the next inner subscription
          innerFrom(project(value, outerIndex)).subscribe(
            (innerSubscriber = new OperatorSubscriber(
              subscriber,
              // When we get a new inner value, next it through. Note that this is
              // handling the deprecate result selector here. This is because with this architecture
              // it ends up being smaller than using the map operator.
              (innerValue) => subscriber.next(resultSelector ? resultSelector(value, innerValue, outerIndex, innerIndex++) : innerValue),
              () => {
                // The inner has completed. Null out the inner subcriber to
                // free up memory and to signal that we have no inner subscription
                // currently.
                innerSubscriber = null!;
                checkComplete();
              }
            ))
          );
        },
        () => {
          isComplete = true;
          checkComplete();
        }
      )
    );
  });
}
