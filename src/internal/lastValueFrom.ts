import { Observable } from './Observable';
import { EmptyError } from './util/EmptyError';

export interface LastValueFromConfig<T> {
  defaultValue: T;
}

export function lastValueFrom<T, D>(source: Observable<T>, config: LastValueFromConfig<D>): Promise<T | D>;
export function lastValueFrom<T>(source: Observable<T>): Promise<T>;

/**
 * Converts an observable to a promise by subscribing to the observable,
 * waiting for it to complete, and resolving the returned promise with the
 * last value from the observed stream.
 *
 * 通过订阅 observable、等待它完成并使用所观察的流中最后一个值解析（resolve）所返回的 Promise，来将 observable 转换为 Promise。
 *
 * If the observable stream completes before any values were emitted, the
 * returned promise will reject with {@link EmptyError} or will resolve
 * with the default value if a default was specified.
 *
 * 如果 observable 流在发送任何值之前已完成，返回的 Promise 将以 {@link EmptyError} 为参数进行拒绝（reject），如果指定了默认值，则会使用默认值进行解析。
 *
 * If the observable stream emits an error, the returned promise will reject
 * with that error.
 *
 * 如果 observable 流发送了错误，则返回的 Promise 将以该错误为参数进行拒绝。
 *
 * **WARNING**: Only use this with observables you *know* will complete. If the source
 * observable does not complete, you will end up with a promise that is hung up, and
 * potentially all of the state of an async function hanging out in memory. To avoid
 * this situation, look into adding something like {@link timeout}, {@link take},
 * {@link takeWhile}, or {@link takeUntil} amongst others.
 *
 * **警告**：仅将其与你*知道*一定会完成的 Observable 一起使用。如果源 observable 不会完成，你最终会得到一个挂起的 Promise，并且可能导致所有异步函数的状态都挂在内存中。为避免这种情况，请考虑添加 {@link timeout}、{@link take}、{@link takeWhile} 或 {@link takeUntil} 等操作符。
 *
 * ## Example
 *
 * ## 例子
 *
 * Wait for the last value from a stream and emit it from a promise in
 * an async function
 *
 * 等待流中的最后一个值并从异步函数中的 Promise 中发送它
 *
 * ```ts
 * import { interval, take, lastValueFrom } from 'rxjs';
 *
 * async function execute() {
 *   const source$ = interval(2000).pipe(take(10));
 *   const finalNumber = await lastValueFrom(source$);
 *   console.log(`The final number is ${ finalNumber }`);
 * }
 *
 * execute();
 *
 * // Expected output:
 * // 'The final number is 9'
 * ```
 * @see {@link firstValueFrom}
 * @param source the observable to convert to a promise
 *
 * 要转换为 promise 的 observable
 *
 * @param config a configuration object to define the `defaultValue` to use if the source completes without emitting a value
 *
 * 一个配置对象，用于定义在源已完成但未发送任何值时使用的 `defaultValue`
 *
 */
export function lastValueFrom<T, D>(source: Observable<T>, config?: LastValueFromConfig<D>): Promise<T | D> {
  const hasConfig = typeof config === 'object';
  return new Promise<T | D>((resolve, reject) => {
    let _hasValue = false;
    let _value: T;
    source.subscribe({
      next: (value) => {
        _value = value;
        _hasValue = true;
      },
      error: reject,
      complete: () => {
        if (_hasValue) {
          resolve(_value);
        } else if (hasConfig) {
          resolve(config!.defaultValue);
        } else {
          reject(new EmptyError());
        }
      },
    });
  });
}
