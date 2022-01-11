import { ObservableInputTuple, OperatorFunction, Cons } from '../types';
import { zip } from './zip';

/**
 * Subscribes to the source, and the observable inputs provided as arguments, and combines their values, by index, into arrays.
 *
 * 订阅源和作为参数提供的可观察输入，并按索引将它们的值组合到数组中。
 *
 * What is meant by "combine by index": The first value from each will be made into a single array, then emitted,
 * then the second value from each will be combined into a single array and emitted, then the third value
 * from each will be combined into a single array and emitted, and so on.
 *
 * “按索引组合”是什么意思：每个中的第一个值将被制成一个数组，然后发出，然后每个中的第二个值将组合成一个数组并发出，然后每个中的第三个值将是组合成一个数组并发出，依此类推。
 *
 * This will continue until it is no longer able to combine values of the same index into an array.
 *
 * 这将继续，直到它不再能够将相同索引的值组合到一个数组中。
 *
 * After the last value from any one completed source is emitted in an array, the resulting observable will complete,
 * as there is no way to continue "zipping" values together by index.
 *
 * 在数组中发出任何一个已完成源的最后一个值后，生成的 observable 将完成，因为无法继续按索引将值“压缩”在一起。
 *
 * Use-cases for this operator are limited. There are memory concerns if one of the streams is emitting
 * values at a much faster rate than the others. Usage should likely be limited to streams that emit
 * at a similar pace, or finite streams of known length.
 *
 * 此操作符的用例是有限的。如果其中一个流以比其他流快得多的速率发出值，则会存在内存问题。使用可能仅限于以相似速度发射的流，或已知长度的有限流。
 *
 * In many cases, authors want `combineLatestWith` and not `zipWith`.
 *
 * 在许多情况下，作者想要 `combineLatestWith` 而不是 `zipWith`。
 *
 * @param otherInputs other observable inputs to collate values from.
 *
 * 其他可观察者输入来整理值。
 *
 * @return A function that returns an Observable that emits items by index
 * combined from the source Observable and provided Observables, in form of an
 * array.
 *
 * 一个返回 Observable 的函数，该函数按索引从源 Observable 和提供的 Observables 以数组的形式发出项目。
 *
 */
export function zipWith<T, A extends readonly unknown[]>(...otherInputs: [...ObservableInputTuple<A>]): OperatorFunction<T, Cons<T, A>> {
  return zip(...otherInputs);
}
