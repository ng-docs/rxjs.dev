import { Observable } from './Observable';
import { EmptyError } from './util/EmptyError';
import { SafeSubscriber } from './Subscriber';

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
 * 通过订阅可观察者并将可观察者转换为承诺，并返回一个承诺，该承诺将在第一个值从可观察者到达时立即解决。然后订阅将被关闭。
 *
 * If the observable stream completes before any values were emitted, the
 * returned promise will reject with {@link EmptyError} or will resolve
 * with the default value if a default was specified.
 *
 * 如果 observable 流在发出任何值之前完成，返回的 Promise 将使用 {@link EmptyError} 拒绝，或者如果指定了默认值，则使用默认值解析。
 *
 * If the observable stream emits an error, the returned promise will reject
 * with that error.
 *
 * 如果 observable 流发出错误，返回的 Promise 将拒绝该错误。
 *
 * **WARNING**: Only use this with observables you *know* will emit at least one value,
 * *OR* complete. If the source observable does not emit one value or complete, you will
 * end up with a promise that is hung up, and potentially all of the state of an
 * async function hanging out in memory. To avoid this situation, look into adding
 * something like {@link timeout}, {@link take}, {@link takeWhile}, or {@link takeUntil}
 * amongst others.
 *
 * **警告**：仅将其与你*知道*会发出至少一个值*或*完成的可观察者一起使用。如果源 observable 没有发出一个值或完成，你最终会得到一个挂起的 Promise，并且可能所有异步函数的状态都挂在内存中。为避免这种情况，请考虑添加 {@link timeout}、{@link take}、{@link takeWhile} 或 {@link takeUntil} 等内容。
 *
 * ## Example
 *
 * ## 例子
 *
 * Wait for the first value from a stream and emit it from a promise in
 * an async function
 *
 * 等待流中的第一个值并从异步函数中的 Promise 发出它
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
 * 转换为 promise 的 observable
 *
 * @param config a configuration object to define the `defaultValue` to use if the source completes without emitting a value
 *
 * 一个配置对象，用于定义在源完成但未发出值时使用的 `defaultValue`
 *
 */
export function firstValueFrom<T, D>(source: Observable<T>, config?: FirstValueFromConfig<D>): Promise<T | D> {
  const hasConfig = typeof config === 'object';
  return new Promise<T | D>((resolve, reject) => {
    const subscriber = new SafeSubscriber<T>({
      next: (value) => {
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
