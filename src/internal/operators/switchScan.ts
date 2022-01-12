import { ObservableInput, ObservedValueOf, OperatorFunction } from '../types';
import { switchMap } from './switchMap';
import { operate } from '../util/lift';

// TODO: Generate a marble diagram for these docs.

/**
 * Applies an accumulator function over the source Observable where the
 * accumulator function itself returns an Observable, emitting values
 * only from the most recently returned Observable.
 *
 * 在源 Observable 上应用一个累加器函数，其中累加器函数本身返回一个 Observable，仅从最近返回的 Observable 发出值。
 *
 * <span class="informal">It's like {@link mergeScan}, but only the most recent
 * Observable returned by the accumulator is merged into the outer Observable.</span>
 *
 * <span class="informal">类似于 {@link mergeScan}，但只有累加器返回的最新 Observable 才会合并到外部 Observable 中。</span>
 *
 * @see {@link scan}
 * @see {@link mergeScan}
 * @see {@link switchMap}
 * @param accumulator
 * The accumulator function called on each source value.
 *
 * 对每个源值调用的累加器函数。
 *
 * @param seed The initial accumulation value.
 *
 * 初始累积值。
 *
 * @return A function that returns an observable of the accumulated values.
 *
 * 返回累积值的可观察值的函数。
 *
 */
export function switchScan<T, R, O extends ObservableInput<any>>(
  accumulator: (acc: R, value: T, index: number) => O,
  seed: R
): OperatorFunction<T, ObservedValueOf<O>> {
  return operate((source, subscriber) => {
    // The state we will keep up to date to pass into our
    // accumulator function at each new value from the source.
    let state = seed;

    // Use `switchMap` on our `source` to do the work of creating
    // this operator. Note the backwards order here of `switchMap()(source)`
    // to avoid needing to use `pipe` unnecessarily
    switchMap(
      // On each value from the source, call the accumulator with
      // our previous state, the value and the index.
      (value: T, index) => accumulator(state, value, index),
      // Using the deprecated result selector here as a dirty trick
      // to update our state with the flattened value.
      (_, innerValue) => ((state = innerValue), innerValue)
    )(source).subscribe(subscriber);

    return () => {
      // Release state on teardown
      state = null!;
    };
  });
}
