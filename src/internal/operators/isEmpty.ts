import { OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Emits `false` if the input Observable emits any values, or emits `true` if the
 * input Observable completes without emitting any values.
 *
 * 如果输入 Observable 发出任何值，则发出 `false` ，或者如果输入 Observable 完成但没有发出任何值，则发出 `true` 。
 *
 * <span class="informal">Tells whether any values are emitted by an Observable.</span>
*
 * <span class="informal">判断 Observable 是否发出任何值。</span>
 *
 * ![](isEmpty.png)
 *
 * `isEmpty` transforms an Observable that emits values into an Observable that
 * emits a single boolean value representing whether or not any values were
 * emitted by the source Observable. As soon as the source Observable emits a
 * value, `isEmpty` will emit a `false` and complete.  If the source Observable
 * completes having not emitted anything, `isEmpty` will emit a `true` and
 * complete.
 *
 * `isEmpty` 将发出值的 Observable 转换为发出单个布尔值的 Observable，该布尔值表示源 Observable 是否发出任何值。一旦源 Observable 发出一个值， `isEmpty` 就会发出一个 `false` 并完成。如果源 Observable 完成并没有发出任何东西， `isEmpty` 将发出一个 `true` 且完整的。
 *
 * A similar effect could be achieved with {@link count}, but `isEmpty` can emit
 * a `false` value sooner.
 *
 * 使用 {@link count} 可以实现类似的效果，但 `isEmpty` 可以更快地发出 `false` 值。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Emit `false` for a non-empty Observable
 *
 * 为非空 Observable 发出 `false`
 *
 * ```ts
 * import { Subject, isEmpty } from 'rxjs';
 *
 * const source = new Subject<string>();
 * const result = source.pipe(isEmpty());
 *
 * source.subscribe(x => console.log(x));
 * result.subscribe(x => console.log(x));
 *
 * source.next('a');
 * source.next('b');
 * source.next('c');
 * source.complete();
 *
 * // Outputs
 * // 'a'
 * // false
 * // 'b'
 * // 'c'
 * ```
 *
 * Emit `true` for an empty Observable
 *
 * 为空的 Observable 发出 `true`
 *
 * ```ts
 * import { EMPTY, isEmpty } from 'rxjs';
 *
 * const result = EMPTY.pipe(isEmpty());
 * result.subscribe(x => console.log(x));
 *
 * // Outputs
 * // true
 * ```
 * @see {@link count}
 * @see {@link EMPTY}
 * @return A function that returns an Observable that emits boolean value
 * indicating whether the source Observable was empty or not.
 *
 * 一个返回 Observable 的函数，该函数发出布尔值，指示源 Observable 是否为空。
 *
 */
export function isEmpty<T>(): OperatorFunction<T, boolean> {
  return operate((source, subscriber) => {
    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        () => {
          subscriber.next(false);
          subscriber.complete();
        },
        () => {
          subscriber.next(true);
          subscriber.complete();
        }
      )
    );
  });
}
