import { ObservableInputTuple, OperatorFunction } from '../types';
import { concat } from './concat';

/**
 * Emits all of the values from the source observable, then, once it completes, subscribes
 * to each observable source provided, one at a time, emitting all of their values, and not subscribing
 * to the next one until it completes.
 *
 * 发送源 Observable 的所有值，一旦其完成，就再订阅传入的每个可观察源，逐个发送它们的所有值，并且在每一个完成之前不会订阅下一个。
 *
 * `concat(a$, b$, c$)` is the same as `a$.pipe(concatWith(b$, c$))`.
 *
 * `concat(a$, b$, c$)` 与 `a$.pipe(concatWith(b$, c$))` 相同。
 *
 * ## Example
 *
 * ## 例子
 *
 * Listen for one mouse click, then listen for all mouse moves.
 *
 * 监听一次鼠标点击，然后监听所有鼠标移动。
 *
 * ```ts
 * import { fromEvent, map, take, concatWith } from 'rxjs';
 *
 * const clicks$ = fromEvent(document, 'click');
 * const moves$ = fromEvent(document, 'mousemove');
 *
 * clicks$.pipe(
 *   map(() => 'click'),
 *   take(1),
 *   concatWith(
 *     moves$.pipe(
 *       map(() => 'move')
 *     )
 *   )
 * )
 * .subscribe(x => console.log(x));
 *
 * // 'click'
 * // 'move'
 * // 'move'
 * // 'move'
 * // ...
 * ```
 * @param otherSources Other observable sources to subscribe to, in sequence, after the original source is complete.
 *
 * 在原始源完成后，要按顺序订阅的其它可观察源。
 *
 * @return A function that returns an Observable that concatenates
 * subscriptions to the source and provided Observables subscribing to the next
 * only once the current subscription completes.
 *
 * 一个返回 Observable 的函数，这个 Observable 将串联订阅源，并且对这些输入 Observables 只会在当前订阅完成后再订阅下一个。
 *
 */
export function concatWith<T, A extends readonly unknown[]>(
  ...otherSources: [...ObservableInputTuple<A>]
): OperatorFunction<T, T | A[number]> {
  return concat(...otherSources);
}
