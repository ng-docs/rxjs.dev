import { ObservableInputTuple, OperatorFunction, Cons } from '../types';
import { zip } from './zip';

/**
 * Subscribes to the source, and the observable inputs provided as arguments, and combines their values, by index, into arrays.
 *
 * 订阅源和作为参数提供的一些可观察输入，并按序号将它们的值组合到数组中。
 *
 * What is meant by "combine by index": The first value from each will be made into a single array, then emitted,
 * then the second value from each will be combined into a single array and emitted, then the third value
 * from each will be combined into a single array and emitted, and so on.
 *
 * “按序号组合”是什么意思：每个中的第一个值将组合成一个数组，然后发送，然后每个中的第二个值将组合成一个数组并发送，然后每个中的第三个值将组合成一个数组并发送，依此类推。
 *
 * This will continue until it is no longer able to combine values of the same index into an array.
 *
 * 以此类推，直到它不能再将相同序号的值组合到一个数组中。
 *
 * After the last value from any one completed source is emitted in an array, the resulting observable will complete,
 * as there is no way to continue "zipping" values together by index.
 *
 * 在数组中发送任何一个已完成源的最后一个值后，结果 observable 也将完成，因为无法继续按序号将值“拉合”在一起。
 *
 * Use-cases for this operator are limited. There are memory concerns if one of the streams is emitting
 * values at a much faster rate than the others. Usage should likely be limited to streams that emit
 * at a similar pace, or finite streams of known length.
 *
 * 此操作符的用例是受限的。如果其中一个流以比其它流快得多的速率发送值，则会存在内存问题。其使用场景可能仅限于一些以相似速度发送的流，或已知长度的有限流。
 *
 * In many cases, authors want `combineLatestWith` and not `zipWith`.
 *
 * 在许多情况下，作者们想要的其实是 `combineLatestWith` 而不是 `zipWith`。
 *
 * @param otherInputs other observable inputs to collate values from.
 *
 * 参与合成这些值的其它可观察者输入。
 *
 * @return A function that returns an Observable that emits items by index
 * combined from the source Observable and provided Observables, in form of an
 * array.
 *
 * 一个返回 Observable 的函数，该 Observable 会按序号从源 Observable 和所提供的 Observables 参数中，以数组的形式发送条目。
 *
 */
export function zipWith<T, A extends readonly unknown[]>(...otherInputs: [...ObservableInputTuple<A>]): OperatorFunction<T, Cons<T, A>> {
  return zip(...otherInputs);
}
