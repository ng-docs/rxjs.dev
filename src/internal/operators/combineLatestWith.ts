import { ObservableInputTuple, OperatorFunction, Cons } from '../types';
import { combineLatest } from './combineLatest';

/**
 * Create an observable that combines the latest values from all passed observables and the source
 * into arrays and emits them.
 *
 * 创建一个可观察者，它将所有传递的可观察者和源中的最新值组合到数组中并发出它们。
 *
 * Returns an observable, that when subscribed to, will subscribe to the source observable and all
 * sources provided as arguments. Once all sources emit at least one value, all of the latest values
 * will be emitted as an array. After that, every time any source emits a value, all of the latest values
 * will be emitted as an array.
 *
 * 返回一个 observable，当订阅它时，将订阅源 observable 和所有作为参数提供的源。一旦所有源发出至少一个值，所有最新值将作为数组发出。之后，每次任何源发出一个值时，所有最新的值都将作为一个数组发出。
 *
 * This is a useful operator for eagerly calculating values based off of changed inputs.
 *
 * 这是一个有用的操作符，用于根据更改的输入急切地计算值。
 *
 * ## Example
 *
 * ## 例子
 *
 * Simple concatenation of values from two inputs
 *
 * 来自两个输入的值的简单串联
 *
 * ```ts
 * import { fromEvent, combineLatestWith, map } from 'rxjs';
 *
 * // Setup: Add two inputs to the page
 * const input1 = document.createElement('input');
 * document.body.appendChild(input1);
 * const input2 = document.createElement('input');
 * document.body.appendChild(input2);
 *
 * // Get streams of changes
 * const input1Changes$ = fromEvent(input1, 'change');
 * const input2Changes$ = fromEvent(input2, 'change');
 *
 * // Combine the changes by adding them together
 * input1Changes$.pipe(
 *   combineLatestWith(input2Changes$),
 *   map(([e1, e2]) => (<HTMLInputElement>e1.target).value + ' - ' + (<HTMLInputElement>e2.target).value)
 * )
 * .subscribe(x => console.log(x));
 * ```
 * @param otherSources the other sources to subscribe to.
 *
 * 要订阅的其他来源。
 *
 * @return A function that returns an Observable that emits the latest
 * emissions from both source and provided Observables.
 *
 * 一个返回 Observable 的函数，该 Observable 从源和提供的 Observable 发出最新的排放。
 *
 */
export function combineLatestWith<T, A extends readonly unknown[]>(
  ...otherSources: [...ObservableInputTuple<A>]
): OperatorFunction<T, Cons<T, A>> {
  return combineLatest(...otherSources);
}
