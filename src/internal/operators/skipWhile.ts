import { Falsy, MonoTypeOperatorFunction, OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

export function skipWhile<T>(predicate: BooleanConstructor): OperatorFunction<T, Extract<T, Falsy> extends never ? never : T>;
export function skipWhile<T>(predicate: (value: T, index: number) => true): OperatorFunction<T, never>;
export function skipWhile<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>;

/**
 * Returns an Observable that skips all items emitted by the source Observable as long as a specified condition holds
 * true, but emits all further source items as soon as the condition becomes false.
 *
 * 返回一个 Observable，只要指定条件成立，它就会跳过源 Observable 发出的所有项目，但一旦条件变为 false，就会发出所有其他源项目。
 *
 * ![](skipWhile.png)
 *
 * Skips all the notifications with a truthy predicate. It will not skip the notifications when the predicate is falsy.
 * It can also be skipped using index. Once the predicate is true, it will not be called again.
 *
 * 使用真实谓词跳过所有通知。当谓词为假时，它不会跳过通知。也可以使用索引跳过它。一旦谓词为真，就不会再次调用它。
 *
 * ## Example
 *
 * ## 例子
 *
 * Skip some super heroes
 *
 * 跳过一些超级英雄
 *
 * ```ts
 * import { from, skipWhile } from 'rxjs';
 *
 * const source = from(['Green Arrow', 'SuperMan', 'Flash', 'SuperGirl', 'Black Canary'])
 * // Skip the heroes until SuperGirl
 * const example = source.pipe(skipWhile(hero => hero !== 'SuperGirl'));
 * // output: SuperGirl, Black Canary
 * example.subscribe(femaleHero => console.log(femaleHero));
 * ```
 *
 * Skip values from the array until index 5
 *
 * 跳过数组中的值直到索引 5
 *
 * ```ts
 * import { from, skipWhile } from 'rxjs';
 *
 * const source = from([1, 2, 3, 4, 5, 6, 7, 9, 10]);
 * const example = source.pipe(skipWhile((_, i) => i !== 5));
 * // output: 6, 7, 9, 10
 * example.subscribe(value => console.log(value));
 * ```
 * @see {@link last}
 * @see {@link skip}
 * @see {@link skipUntil}
 * @see {@link skipLast}
 * @param {Function} predicate - A function to test each item emitted from the source Observable.
 *
 *   用于测试从源 Observable 发出的每个项目的函数。
 *
 * @return A function that returns an Observable that begins emitting items
 * emitted by the source Observable when the specified predicate becomes false.
 *
 * 一个返回 Observable 的函数，当指定的谓词变为 false 时，该 Observable 开始发射源 Observable 发出的项目。
 *
 */
export function skipWhile<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let taking = false;
    let index = 0;
    source.subscribe(
      new OperatorSubscriber(subscriber, (value) => (taking || (taking = !predicate(value, index++))) && subscriber.next(value))
    );
  });
}
