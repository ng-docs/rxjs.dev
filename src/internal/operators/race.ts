import { ObservableInputTuple, OperatorFunction } from '../types';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { raceWith } from './raceWith';

/**
 * @deprecated Replaced with {@link raceWith}. Will be removed in v8.
 *
 * 已替换为 {@link raceWith}。将在 v8 中删除。
 *
 */
export function race<T, A extends readonly unknown[]>(otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;
/**
 * @deprecated Replaced with {@link raceWith}. Will be removed in v8.
 *
 * 已替换为 {@link raceWith}。将在 v8 中删除。
 *
 */
export function race<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;

/**
 * Returns an Observable that mirrors the first source Observable to emit a next,
 * error or complete notification from the combination of this Observable and supplied Observables.
 *
 * 返回一个 Observable，它会镜像所提供的这些源中首先发出 next、error 或 complete 的那个，这些源包括源 Observable 和那些传入的 Observable 参数。
 *
 * @param args Sources used to race for which Observable emits first.
 *
 * 一些源，它们将通过谁先发出值的方式进行竞争。
 *
 * @return A function that returns an Observable that mirrors the output of the
 * first Observable to emit an item.
 *
 * 一个返回 Observable 的函数，该 Observable 会镜像首先发出了条目的 Observable 的输出。
 *
 * @deprecated Replaced with {@link raceWith}. Will be removed in v8.
 *
 * 已替换为 {@link raceWith}。将在 v8 中删除。
 *
 */
export function race<T>(...args: any[]): OperatorFunction<T, unknown> {
  return raceWith(...argsOrArgArray(args));
}
