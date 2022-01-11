import { ObservableInputTuple, OperatorFunction } from '../types';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { raceWith } from './raceWith';

/**
 * @deprecated Replaced with {@link raceWith}. Will be removed in v8.
 *
 * 替换为 {@link raceWith}。将在 v8 中删除。
 *
 */
export function race<T, A extends readonly unknown[]>(otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;
/**
 * @deprecated Replaced with {@link raceWith}. Will be removed in v8.
 *
 * 替换为 {@link raceWith}。将在 v8 中删除。
 *
 */
export function race<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;

/**
 * Returns an Observable that mirrors the first source Observable to emit a next,
 * error or complete notification from the combination of this Observable and supplied Observables.
 *
 * 返回一个镜像第一个源 Observable 的 Observable，以从这个 Observable 和提供的 Observable 的组合发出下一个、错误或完成通知。
 *
 * @param args Sources used to race for which Observable emits first.
 *
 * 用于竞争 Observable 首先发出的源。
 *
 * @return A function that returns an Observable that mirrors the output of the
 * first Observable to emit an item.
 *
 * 一个返回 Observable 的函数，该函数反映了第一个 Observable 的输出以发射项目。
 *
 * @deprecated Replaced with {@link raceWith}. Will be removed in v8.
 *
 * 替换为 {@link raceWith}。将在 v8 中删除。
 *
 */
export function race<T>(...args: any[]): OperatorFunction<T, unknown> {
  return raceWith(...argsOrArgArray(args));
}
