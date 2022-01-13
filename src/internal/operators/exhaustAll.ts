import { Subscription } from '../Subscription';
import { OperatorFunction, ObservableInput, ObservedValueOf } from '../types';
import { operate } from '../util/lift';
import { innerFrom } from '../observable/innerFrom';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Converts a higher-order Observable into a first-order Observable by dropping
 * inner Observables while the previous inner Observable has not yet completed.
 *
 * 在前一个内部 Observable 尚未完成时，通过丢弃其它内部 Observable 将高阶 Observable 转换为一阶 Observable。
 *
 * <span class="informal">Flattens an Observable-of-Observables by dropping the
 * next inner Observables while the current inner is still executing.</span>
 *
 * <span class="informal">通过在当前内部 Observable 仍在执行时丢弃其它内部 Observables 来展平某个发送 Observables 的 Observable。</span>
 *
 * ![](exhaust.png)
 *
 * `exhaustAll` subscribes to an Observable that emits Observables, also known as a
 * higher-order Observable. Each time it observes one of these emitted inner
 * Observables, the output Observable begins emitting the items emitted by that
 * inner Observable. So far, it behaves like {@link mergeAll}. However,
 * `exhaustAll` ignores every new inner Observable if the previous Observable has
 * not yet completed. Once that one completes, it will accept and flatten the
 * next inner Observable and repeat this process.
 *
 * `exhaustAll` 订阅了一个发送 Observables 的 Observable，也称为高阶 Observable。每次它观察到发出的这些内部 Observable 之一时，输出 Observable 就会开始发送由该内部 Observable 发送的条目。到目前为止，它的行为类似于 {@link mergeAll}。但是，如果前一个 Observable 尚未完成，则 `exhaustAll` 会忽略每个新的内部 Observable。一旦完成，它将接受并展平下一个内部 Observable 并重复此过程。
 *
 * ## Example
 *
 * ## 例子
 *
 * Run a finite timer for each click, only if there is no currently active timer
 *
 * 仅当目前没有活动计时器时，才会为每次点击运行一个有限计时器
 *
 * ```ts
 * import { fromEvent, map, interval, take, exhaustAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const higherOrder = clicks.pipe(
 *   map(() => interval(1000).pipe(take(5)))
 * );
 * const result = higherOrder.pipe(exhaustAll());
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link combineLatestAll}
 * @see {@link concatAll}
 * @see {@link switchAll}
 * @see {@link switchMap}
 * @see {@link mergeAll}
 * @see {@link exhaustMap}
 * @see {@link zipAll}
 * @return A function that returns an Observable that takes a source of
 * Observables and propagates the first Observable exclusively until it
 * completes before subscribing to the next.
 *
 * 一个返回 Observable 的函数，该函数接受 Observable 的源并以独占方式转发第一个 Observable 中的值，直到它完成，才订阅下一个。
 *
 */
export function exhaustAll<O extends ObservableInput<any>>(): OperatorFunction<O, ObservedValueOf<O>> {
  return operate((source, subscriber) => {
    let isComplete = false;
    let innerSub: Subscription | null = null;
    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (inner) => {
          if (!innerSub) {
            innerSub = innerFrom(inner).subscribe(
              new OperatorSubscriber(subscriber, undefined, () => {
                innerSub = null;
                isComplete && subscriber.complete();
              })
            );
          }
        },
        () => {
          isComplete = true;
          !innerSub && subscriber.complete();
        }
      )
    );
  });
}
