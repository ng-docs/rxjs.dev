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
 * 通过订阅 observable、等待它完成并使用观察到的流中的最后一个值解析返回的 Promise，将 observable 转换为 Promise。
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
 * **WARNING**: Only use this with observables you *know* will complete. If the source
 * observable does not complete, you will end up with a promise that is hung up, and
 * potentially all of the state of an async function hanging out in memory. To avoid
 * this situation, look into adding something like {@link timeout}, {@link take},
 * {@link takeWhile}, or {@link takeUntil} amongst others.
 *
 * **警告**：仅将其与你*知道*将完成的可观察对象一起使用。如果源 observable 没有完成，你最终会得到一个被挂起的 Promise，并且可能所有异步函数的状态都挂在内存中。为避免这种情况，请考虑添加 {@link timeout}、{@link take}、{@link takeWhile} 或 {@link takeUntil} 等内容。
 *
 * ## Example
 *
 * ## 例子
 *
 * Wait for the last value from a stream and emit it from a promise in
 * an async function
 *
 * 等待流中的最后一个值并从异步函数中的承诺中发出它
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
 * 转换为 promise 的 observable
 *
 * @param config a configuration object to define the `defaultValue` to use if the source completes without emitting a value
 *
 * 一个配置对象，用于定义在源完成但未发出值时使用的 `defaultValue`
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
