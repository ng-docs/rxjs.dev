import { OperatorFunction, ObservableInputTuple } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/innerFrom';
import { identity } from '../util/identity';
import { noop } from '../util/noop';
import { popResultSelector } from '../util/args';

export function withLatestFrom<T, O extends unknown[]>(...inputs: [...ObservableInputTuple<O>]): OperatorFunction<T, [T, ...O]>;

export function withLatestFrom<T, O extends unknown[], R>(
  ...inputs: [...ObservableInputTuple<O>, (...value: [T, ...O]) => R]
): OperatorFunction<T, R>;

/**
 * Combines the source Observable with other Observables to create an Observable
 * whose values are calculated from the latest values of each, only when the
 * source emits.
 *
 * 将源 Observable 与其它 Observable 进行组合以创建一个 Observable，其值是根据每个 Observable 的最新值计算的，仅当源发送时才发送。
 *
 * <span class="informal">Whenever the source Observable emits a value, it
 * computes a formula using that value plus the latest values from other input
 * Observables, then emits the output of that formula.</span>
 *
 * <span class="informal">每当源 Observable 发出一个值时，它会使用该值加上来自其它输入 Observable 的最新值计算一个公式，然后发送该公式的输出结果。</span>
 *
 * ![](withLatestFrom.png)
 *
 * `withLatestFrom` combines each value from the source Observable (the
 * instance) with the latest values from the other input Observables only when
 * the source emits a value, optionally using a `project` function to determine
 * the value to be emitted on the output Observable. All input Observables must
 * emit at least one value before the output Observable will emit a value.
 *
 * `withLatestFrom` 只会在源发送一个值时将源 Observable（实例）中的每个值与来自其它输入 Observable 的最新值组合在一起，使用可选的 `project` 函数来确定要在输出 Observable 上发送的值。在输出 Observable 发送一个值之前，所有输入 Observable 必须发送过至少一个值。
 *
 * ## Example
 *
 * ## 例子
 *
 * On every click event, emit an array with the latest timer event plus the click event
 *
 * 在每个点击事件上，发送一个包含最新计时器事件和点击事件的数组
 *
 * ```ts
 * import { fromEvent, interval, withLatestFrom } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const timer = interval(1000);
 * const result = clicks.pipe(withLatestFrom(timer));
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link combineLatest}
 * @param {ObservableInput} other An input Observable to combine with the source
 * Observable. More than one input Observables may be given as argument.
 *
 * 要与源 Observable 组合的输入 Observable。这里可以给出多个输入 Observables 作为参数。
 *
 * @param {Function} [project] Projection function for combining values
 * together. Receives all values in order of the Observables passed, where the
 * first parameter is a value from the source Observable. (e.g.
 * `a.pipe(withLatestFrom(b, c), map(([a1, b1, c1]) => a1 + b1 + c1))`). If this is not
 * passed, arrays will be emitted on the output Observable.
 *
 * 用于将值组合在一起的投影功能。按照传递的 Observable 的顺序接收所有值，其中第一个参数是来自源 Observable 的值。（例如 `a.pipe(withLatestFrom(b, c), map(([a1, b1, c1]) => a1 + b1 + c1))` ）。如果未传入本参数，则将在输出 Observable 上发出这些数组。
 *
 * @return A function that returns an Observable of projected values from the
 * most recent values from each input Observable, or an array of the most
 * recent values from each input Observable.
 *
 * 一个函数，它会从每个输入 Observable 的最新值中返回一个由投影后的值组成的 Observable，或者返回一个包含每个输入 Observable 的最新值的数组。
 *
 */
export function withLatestFrom<T, R>(...inputs: any[]): OperatorFunction<T, R | any[]> {
  const project = popResultSelector(inputs) as ((...args: any[]) => R) | undefined;

  return operate((source, subscriber) => {
    const len = inputs.length;
    const otherValues = new Array(len);
    // An array of whether or not the other sources have emitted. Matched with them by index.
    // TODO: At somepoint, we should investigate the performance implications here, and look
    // into using a `Set()` and checking the `size` to see if we're ready.
    let hasValue = inputs.map(() => false);
    // Flipped true when we have at least one value from all other sources and
    // we are ready to start emitting values.
    let ready = false;

    // Other sources. Note that here we are not checking `subscriber.closed`,
    // this causes all inputs to be subscribed to, even if nothing can be emitted
    // from them. This is an important distinction because subscription constitutes
    // a side-effect.
    for (let i = 0; i < len; i++) {
      innerFrom(inputs[i]).subscribe(
        new OperatorSubscriber(
          subscriber,
          (value) => {
            otherValues[i] = value;
            if (!ready && !hasValue[i]) {
              // If we're not ready yet, flag to show this observable has emitted.
              hasValue[i] = true;
              // Intentionally terse code.
              // If all of our other observables have emitted, set `ready` to `true`,
              // so we know we can start emitting values, then clean up the `hasValue` array,
              // because we don't need it anymore.
              (ready = hasValue.every(identity)) && (hasValue = null!);
            }
          },
          // Completing one of the other sources has
          // no bearing on the completion of our result.
          noop
        )
      );
    }

    // Source subscription
    source.subscribe(
      new OperatorSubscriber(subscriber, (value) => {
        if (ready) {
          // We have at least one value from the other sources. Go ahead and emit.
          const values = [value, ...otherValues];
          subscriber.next(project ? project(...values) : values);
        }
      })
    );
  });
}
