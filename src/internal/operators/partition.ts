import { not } from '../util/not';
import { filter } from './filter';
import { Observable } from '../Observable';
import { UnaryFunction } from '../types';

/**
 * Splits the source Observable into two, one with values that satisfy a
 * predicate, and another with values that don't satisfy the predicate.
 *
 * 将源 Observable 拆分为两个，一个具有满足谓词的值，另一个具有不满足谓词的值。
 *
 * <span class="informal">It's like {@link filter}, but returns two Observables:
 * one like the output of {@link filter}, and the other with values that did not
 * pass the condition.</span>
 *
 * 它类似于 {@link filter}，但返回两个 Observable：一个类似于 {@link filter} 的输出，另一个具有未通过条件的值。
 *
 * ![](partition.png)
 *
 * `partition` outputs an array with two Observables that partition the values
 * from the source Observable through the given `predicate` function. The first
 * Observable in that array emits source values for which the predicate argument
 * returns true. The second Observable emits source values for which the
 * predicate returns false. The first behaves like {@link filter} and the second
 * behaves like {@link filter} with the predicate negated.
 *
 * `partition` 输出一个包含两个 Observable 的数组，它们通过给定的 `predicate` 函数对源 Observable 中的值进行分区。该数组中的第一个 Observable 发出谓词参数返回 true 的源值。第二个 Observable 发出谓词返回 false 的源值。第一个行为类似于 {@link filter}，第二个行为类似于 {@link filter}，谓词被否定。
 *
 * ## Example
 *
 * ## 例子
 *
 * Partition click events into those on DIV elements and those elsewhere
 *
 * 将点击事件划分为 DIV 元素上的事件和其他地方的事件
 *
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { partition } from 'rxjs/operators';
 *
 * const div = document.createElement('div');
 * div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
 * document.body.appendChild(div);
 *
 * const clicks = fromEvent(document, 'click');
 * const [clicksOnDivs, clicksElsewhere] = clicks.pipe(partition(ev => (<HTMLElement>ev.target).tagName === 'DIV'));
 *
 * clicksOnDivs.subscribe(x => console.log('DIV clicked: ', x));
 * clicksElsewhere.subscribe(x => console.log('Other clicked: ', x));
 * ```
 * @see {@link filter}
 * @param {function(value: T, index: number): boolean} predicate A function that
 * evaluates each value emitted by the source Observable. If it returns `true`,
 * the value is emitted on the first Observable in the returned array, if
 * `false` the value is emitted on the second Observable in the array. The
 * `index` parameter is the number `i` for the i-th source emission that has
 * happened since the subscription, starting from the number `0`.
 *
 * 评估源 Observable 发出的每个值的函数。如果返回 `true` ，则在返回数组中的第一个 Observable 上发出该值，如果为 `false` ，则在数组中的第二个 Observable 上发出该值。 `index` 参数是自订阅以来发生的第 i 个源排放的数字 `i` ，从数字 `0` 开始。
 *
 * @param {any} [thisArg] An optional argument to determine the value of `this`
 * in the `predicate` function.
 * @return A function that returns an array with two Observables: one with
 * values that passed the predicate, and another with values that did not pass
 * the predicate.
 *
 * 一个函数，它返回一个包含两个 Observable 的数组：一个带有通过谓词的值，另一个带有未通过谓词的值。
 *
 * @deprecated Replaced with the `partition` static creation function. Will be removed in v8.
 *
 * 替换为 `partition` 静态创建功能。将在 v8 中删除。
 *
 */
export function partition<T>(
  predicate: (value: T, index: number) => boolean,
  thisArg?: any
): UnaryFunction<Observable<T>, [Observable<T>, Observable<T>]> {
  return (source: Observable<T>) =>
    [filter(predicate, thisArg)(source), filter(not(predicate, thisArg))(source)] as [Observable<T>, Observable<T>];
}
