import { ObservableInput, ObservedValueOf, OperatorFunction } from '../types';
import { switchMap } from './switchMap';
import { operate } from '../util/lift';

// TODO: Generate a marble diagram for these docs.

/**
 * Applies an accumulator function over the source Observable where the
 * accumulator function itself returns an Observable, emitting values
 * only from the most recently returned Observable.
 *
 * 在源 Observable 上调用一个累加器函数（此累加器函数本身会返回一个 Observable），只会从最近返回的 Observable 发送值。
 *
 * <span class="informal">It's like {@link mergeScan}, but only the most recent
 * Observable returned by the accumulator is merged into the outer Observable.</span>
 *
 * <span class="informal">类似于 {@link mergeScan}，但只有从累加器会返回的最新 Observable 才会合并到外部 Observable 中。</span>
 *
 * @see {@link scan}
 * @see {@link mergeScan}
 * @see {@link switchMap}
 * @param accumulator
 * The accumulator function called on each source value.
 *
 * 要针对每个源值进行调用的累加器函数。
 *
 * @param seed The initial accumulation value.
 *
 * 累加的初始值。
 *
 * @return A function that returns an observable of the accumulated values.
 *
 * 一个函数，它会返回一个发出累加结果的 Observable。
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
