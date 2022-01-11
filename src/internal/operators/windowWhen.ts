import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { ObservableInput, OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/innerFrom';

/**
 * Branch out the source Observable values as a nested Observable using a
 * factory function of closing Observables to determine when to start a new
 * window.
 *
 * 使用关闭 Observable 的工厂函数将源 Observable 值分支为嵌套的 Observable 以确定何时启动新窗口。
 *
 * <span class="informal">It's like {@link bufferWhen}, but emits a nested
 * Observable instead of an array.</span>
 *
 * 它类似于 {@link bufferWhen}，但发出一个嵌套的 Observable 而不是一个数组。
 *
 * ![](windowWhen.png)
 *
 * Returns an Observable that emits windows of items it collects from the source
 * Observable. The output Observable emits connected, non-overlapping windows.
 * It emits the current window and opens a new one whenever the Observable
 * produced by the specified `closingSelector` function emits an item. The first
 * window is opened immediately when subscribing to the output Observable.
 *
 * 返回一个 Observable，它发出从源 Observable 收集的项目的窗口。输出 Observable 发出连接的、不重叠的窗口。每当指定的 `closingSelector` 函数生成的 Observable 发出一个项目时，它就会发出当前窗口并打开一个新窗口。第一个窗口在订阅输出 Observable 时立即打开。
 *
 * ## Example
 *
 * ## 例子
 *
 * Emit only the first two clicks events in every window of [1-5] random seconds
 *
 * 仅在[1-5][1-5]随机秒的每个窗口中发出前两次单击事件
 *
 * ```ts
 * import { fromEvent, windowWhen, interval, map, take, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowWhen(() => interval(1000 + Math.random() * 4000)),
 *   map(win => win.pipe(take(2))), // take at most 2 emissions from each window
 *   mergeAll()                     // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link window}
 * @see {@link windowCount}
 * @see {@link windowTime}
 * @see {@link windowToggle}
 * @see {@link bufferWhen}
 * @param {function(): Observable} closingSelector A function that takes no
 * arguments and returns an Observable that signals (on either `next` or
 * `complete`) when to close the previous window and start a new one.
 *
 * 一个不带参数并返回一个 Observable 的函数，该 Observable 发出信号（在 `next` 或 `complete` 上）何时关闭前一个窗口并开始一个新窗口。
 *
 * @return A function that returns an Observable of windows, which in turn are
 * Observables.
 *
 * 一个返回窗口的 Observable 的函数，这些窗口又是 Observables。
 *
 */
export function windowWhen<T>(closingSelector: () => ObservableInput<any>): OperatorFunction<T, Observable<T>> {
  return operate((source, subscriber) => {
    let window: Subject<T> | null;
    let closingSubscriber: Subscriber<any> | undefined;

    /**
     * When we get an error, we have to notify both the
     * destiation subscriber and the window.
     *
     * 当我们收到错误时，我们必须通知目标订阅者和窗口。
     *
     */
    const handleError = (err: any) => {
      window!.error(err);
      subscriber.error(err);
    };

    /**
     * Called every time we need to open a window.
     * Recursive, as it will start the closing notifier, which
     * inevitably *should* call openWindow -- but may not if
     * it is a "never" observable.
     *
     * 每次我们需要打开一个窗口时调用。递归的，因为它将启动关闭通知程序，这不可避免地*应该*调用 openWindow ——但如果它是“从不”可观察的，则可能不会。
     *
     */
    const openWindow = () => {
      // We need to clean up our closing subscription,
      // we only cared about the first next or complete notification.
      closingSubscriber?.unsubscribe();

      // Close our window before starting a new one.
      window?.complete();

      // Start the new window.
      window = new Subject<T>();
      subscriber.next(window.asObservable());

      // Get our closing notifier.
      let closingNotifier: Observable<any>;
      try {
        closingNotifier = innerFrom(closingSelector());
      } catch (err) {
        handleError(err);
        return;
      }

      // Subscribe to the closing notifier, be sure
      // to capture the subscriber (aka Subscription)
      // so we can clean it up when we close the window
      // and open a new one.
      closingNotifier.subscribe((closingSubscriber = new OperatorSubscriber(subscriber, openWindow, openWindow, handleError)));
    };

    // Start the first window.
    openWindow();

    // Subscribe to the source
    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value) => window!.next(value),
        () => {
          // The source completed, close the window and complete.
          window!.complete();
          subscriber.complete();
        },
        handleError,
        () => {
          // Be sure to clean up our closing subscription
          // when this tears down.
          closingSubscriber?.unsubscribe();
          window = null!;
        }
      )
    );
  });
}
