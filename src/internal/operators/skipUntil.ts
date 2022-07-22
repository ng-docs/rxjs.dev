import { Observable } from '../Observable';
import { MonoTypeOperatorFunction } from '../types';
import { operate } from '../util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/innerFrom';
import { noop } from '../util/noop';

/**
 * Returns an Observable that skips items emitted by the source Observable until a second Observable emits an item.
 *
 * 返回一个 Observable，它会跳过源 Observable 发送的条目，直到第二个 Observable 发出一个条目为止。
 *
 * The `skipUntil` operator causes the observable stream to skip the emission of values until the passed in observable emits the first value.
 * This can be particularly useful in combination with user interactions, responses of http requests or waiting for specific times to pass by.
 *
 * `skipUntil` 操作符会使 observable 流跳过发送的值，直到传入的 observable 发出了第一个值为止。这在需要组合用户交互、http 请求响应或等待特定时间过去时特别有用。
 *
 * ![](skipUntil.png)
 *
 * Internally the `skipUntil` operator subscribes to the passed in observable (in the following called *notifier*) in order to recognize the emission
 * of its first value. When this happens, the operator unsubscribes from the *notifier* and starts emitting the values of the *source*
 * observable. It will never let the *source* observable emit any values if the *notifier* completes or throws an error without emitting
 * a value before.
 *
 * 在内部，`skipUntil` 操作符会订阅传入的 observable（在下面称为*通知器（notifier）*），以便监听它何时发出第一个值。发生这种情况时，操作符会退订*通知器*并开始发送*源* observable 的值。如果*通知器*完成或抛出错误而之前没有发送值，则它永远不会让*源* observable 发送任何值。
 *
 * ## Example
 *
 * ## 例子
 *
 * In the following example, all emitted values of the interval observable are skipped until the user clicks anywhere within the page
 *
 * 在下面的示例中，所有发送的区间 observable 值都将被跳过，直到用户单击页面中的任意位置
 *
 * ```ts
 * import { interval, fromEvent, skipUntil } from 'rxjs';
 *
 * const intervalObservable = interval(1000);
 * const click = fromEvent(document, 'click');
 *
 * const emitAfterClick = intervalObservable.pipe(
 *   skipUntil(click)
 * );
 * // clicked at 4.6s. output: 5...6...7...8........ or
 * // clicked at 7.3s. output: 8...9...10..11.......
 * emitAfterClick.subscribe(value => console.log(value));
 * ```
 * @see {@link last}
 * @see {@link skip}
 * @see {@link skipWhile}
 * @see {@link skipLast}
 * @param {Observable} notifier - The second Observable that has to emit an item before the source Observable's elements begin to
 *   be mirrored by the resulting Observable.
 *
 *   第二个 Observable，它必须发送一个条目，结果 Observable 才会开始镜像源 Observable 中的元素。
 *
 * @return A function that returns an Observable that skips items from the
 * source Observable until the second Observable emits an item, then emits the
 * remaining items.
 *
 * 返回一个 Observable 的函数，该 Observable 会跳过源 Observable 中的条目，直到第二个 Observable 发出一个条目时，该 Observable 才会发出剩下的条目。
 *
 */
export function skipUntil<T>(notifier: Observable<any>): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let taking = false;

    const skipSubscriber = createOperatorSubscriber(
      subscriber,
      () => {
        skipSubscriber?.unsubscribe();
        taking = true;
      },
      noop
    );

    innerFrom(notifier).subscribe(skipSubscriber);

    source.subscribe(createOperatorSubscriber(subscriber, (value) => taking && subscriber.next(value)));
  });
}
