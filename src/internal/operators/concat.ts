import { ObservableInputTuple, OperatorFunction, SchedulerLike } from '../types';
import { operate } from '../util/lift';
import { concatAll } from './concatAll';
import { popScheduler } from '../util/args';
import { from } from '../observable/from';

/**
 * @deprecated Replaced with {@link concatWith}. Will be removed in v8.
 *
 * 已替换为 {@link concatWith}。将在 v8 中删除。
 *
 */
export function concat<T, A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;
/**
 * @deprecated Replaced with {@link concatWith}. Will be removed in v8.
 *
 * 已替换为 {@link concatWith}。将在 v8 中删除。
 *
 */
export function concat<T, A extends readonly unknown[]>(
  ...sourcesAndScheduler: [...ObservableInputTuple<A>, SchedulerLike]
): OperatorFunction<T, T | A[number]>;

/**
 * @deprecated Replaced with {@link concatWith}. Will be removed in v8.
 *
 * 已替换为 {@link concatWith}。将在 v8 中删除。
 *
 */
export function concat<T, R>(...args: any[]): OperatorFunction<T, R> {
  const scheduler = popScheduler(args);
  return operate((source, subscriber) => {
    concatAll()(from([source, ...args], scheduler)).subscribe(subscriber);
  });
}
