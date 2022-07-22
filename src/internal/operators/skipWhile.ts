import { Falsy, MonoTypeOperatorFunction, OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

export function skipWhile<T>(predicate: BooleanConstructor): OperatorFunction<T, Extract<T, Falsy> extends never ? never : T>;
export function skipWhile<T>(predicate: (value: T, index: number) => true): OperatorFunction<T, never>;
export function skipWhile<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>;

/**
 * Returns an Observable that skips all items emitted by the source Observable as long as a specified condition holds
 * true, but emits all further source items as soon as the condition becomes false.
 *
 * 返回一个 Observable，只要指定的条件依然成立，它就会跳过源 Observable 发送的所有条目，但一旦条件变为 false，就会发送源的所有其它条目。
 *
 * ![](skipWhile.png)
 *
 * Skips all the notifications with a truthy predicate. It will not skip the notifications when the predicate is falsy.
 * It can also be skipped using index. Once the predicate is true, it will not be called again.
 *
 * 当谓词为真值时，跳过所有通知。当谓词为假值时，则不会跳过通知。也可以根据序号跳过它。一旦谓词为真，就不会再次调用它。
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
 * 跳过数组中的值直到其序号为 5
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
 *   一个函数，用来测试从源 Observable 发送的每个条目。
 *
 * @return A function that returns an Observable that begins emitting items
 * emitted by the source Observable when the specified predicate becomes false.
 *
 * 一个返回 Observable 的函数，当指定的谓词变为 false 时，该 Observable 开始发送源 Observable 发出的那些条目。
 *
 */
export function skipWhile<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let taking = false;
    let index = 0;
    source.subscribe(
      createOperatorSubscriber(subscriber, (value) => (taking || (taking = !predicate(value, index++))) && subscriber.next(value))
    );
  });
}
