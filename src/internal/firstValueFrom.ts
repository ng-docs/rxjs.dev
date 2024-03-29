import { Observable } from './Observable';
import { EmptyError } from './util/EmptyError';
import { Subscriber } from './Subscriber';

export interface FirstValueFromConfig<T> {
  defaultValue: T;
}

export function firstValueFrom<T, D>(source: Observable<T>, config: FirstValueFromConfig<D>): Promise<T | D>;
export function firstValueFrom<T>(source: Observable<T>): Promise<T>;

/**
 * Converts an observable to a promise by subscribing to the observable,
 * and returning a promise that will resolve as soon as the first value
 * arrives from the observable. The subscription will then be closed.
 *
 * 订阅 Observable 并将 Observable 转换为 Promise，并返回这个 Promise，该 Promise 将在第一个值从 Observable 抵达时立即解析（resolve）。然后此订阅就会被关闭。
 *
 * If the observable stream completes before any values were emitted, the
 * returned promise will reject with {@link EmptyError} or will resolve
 * with the default value if a default was specified.
 *
 * 如果 observable 流在发出任何值之前就已完成，则它返回的 Promise 将以 {@link EmptyError} 为参数进行拒绝（reject），如果指定了默认值，则会使用默认值进行解析。
 *
 * If the observable stream emits an error, the returned promise will reject
 * with that error.
 *
 * 如果 observable 流发送错误，返回的 Promise 将以该错误为参数进行拒绝。
 *
 * **WARNING**: Only use this with observables you *know* will emit at least one value,
 * *OR* complete. If the source observable does not emit one value or complete, you will
 * end up with a promise that is hung up, and potentially all of the state of an
 * async function hanging out in memory. To avoid this situation, look into adding
 * something like {@link timeout}, {@link take}, {@link takeWhile}, or {@link takeUntil}
 * amongst others.
 *
 * **警告**：仅将其与你*知道*会发送至少一个值*或*会完成的 Observable 一起使用。如果源 observable 没有发送任何值或不会完成，你最终会得到一个挂起的 Promise，并可能导致所有异步函数的状态都挂在内存中。为避免这种情况，请考虑添加 {@link timeout}、{@link take}、{@link takeWhile} 或 {@link takeUntil} 等操作符。
 *
 * ## Example
 *
 * ## 例子
 *
 * Wait for the first value from a stream and emit it from a promise in
 * an async function
 *
 * 等待流中的第一个值并从异步函数中的 Promise 发送它
 *
 * ```ts
 * import { interval, firstValueFrom } from 'rxjs';
 *
 * async function execute() {
 *   const source$ = interval(2000);
 *   const firstNumber = await firstValueFrom(source$);
 *   console.log(`The first number is ${ firstNumber }`);
 * }
 *
 * execute();
 *
 * // Expected output:
 * // 'The first number is 0'
 * ```
 * @see {@link lastValueFrom}
 * @param source the observable to convert to a promise
 *
 * 要转换为 Promise 的 observable
 *
 * @param config a configuration object to define the `defaultValue` to use if the source completes without emitting a value
 *
 * 一个配置对象，用于定义当源已完成但未发送值时使用的 `defaultValue`
 *
 */
export function firstValueFrom<T, D>(source: Observable<T>, config?: FirstValueFromConfig<D>): Promise<T | D> {
  const hasConfig = typeof config === 'object';
  return new Promise<T | D>((resolve, reject) => {
    const subscriber = new Subscriber({
      next: (value: T) => {
        resolve(value);
        subscriber.unsubscribe();
      },
      error: reject,
      complete: () => {
        if (hasConfig) {
          resolve(config!.defaultValue);
        } else {
          reject(new EmptyError());
        }
      },
    });
    source.subscribe(subscriber);
  });
}
