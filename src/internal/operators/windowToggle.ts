import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { Subscription } from '../Subscription';
import { ObservableInput, OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { innerFrom } from '../observable/innerFrom';
import { OperatorSubscriber } from './OperatorSubscriber';
import { noop } from '../util/noop';
import { arrRemove } from '../util/arrRemove';

/**
 * Branch out the source Observable values as a nested Observable starting from
 * an emission from `openings` and ending when the output of `closingSelector`
 * emits.
 *
 * 将源 Observable 值分支为嵌套的 Observable，从 `openings` 的发射开始，到 `closingSelector` 的输出发射时结束。
 *
 * <span class="informal">It's like {@link bufferToggle}, but emits a nested
 * Observable instead of an array.</span>
 *
 * <span class="informal">它类似于 {@link bufferToggle}，但发出一个嵌套的 Observable 而不是一个数组。</span>
 *
 * ![](windowToggle.png)
 *
 * Returns an Observable that emits windows of items it collects from the source
 * Observable. The output Observable emits windows that contain those items
 * emitted by the source Observable between the time when the `openings`
 * Observable emits an item and when the Observable returned by
 * `closingSelector` emits an item.
 *
 * 返回一个 Observable，它发出从源 Observable 收集的项目的窗口。输出 Observable 发出窗口，其中包含源 Observable 在从 `openings` Observable 发出一个项目到 `closingSelector` 返回的 Observable 发出一个项目之间发出的那些项目。
 *
 * ## Example
 *
 * ## 例子
 *
 * Every other second, emit the click events from the next 500ms
 *
 * 每隔一秒，从接下来的 500 毫秒发出点击事件
 *
 * ```ts
 * import { fromEvent, interval, windowToggle, EMPTY, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const openings = interval(1000);
 * const result = clicks.pipe(
 *   windowToggle(openings, i => i % 2 ? interval(500) : EMPTY),
 *   mergeAll()
 * );
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link window}
 * @see {@link windowCount}
 * @see {@link windowTime}
 * @see {@link windowWhen}
 * @see {@link bufferToggle}
 * @param {Observable<O>} openings An observable of notifications to start new
 * windows.
 *
 * 可观察到的用于启动新窗口的通知。
 *
 * @param {function(value: O): Observable} closingSelector A function that takes
 * the value emitted by the `openings` observable and returns an Observable,
 * which, when it emits a next notification, signals that the
 * associated window should complete.
 *
 * 一个函数，它接受由可观察的 `openings` 发出的值并返回一个可观察的，当它发出下一个通知时，表示关联的窗口应该完成。
 *
 * @return A function that returns an Observable of windows, which in turn are
 * Observables.
 *
 * 一个返回窗口的 Observable 的函数，这些窗口又是 Observables。
 *
 */
export function windowToggle<T, O>(
  openings: ObservableInput<O>,
  closingSelector: (openValue: O) => ObservableInput<any>
): OperatorFunction<T, Observable<T>> {
  return operate((source, subscriber) => {
    const windows: Subject<T>[] = [];

    const handleError = (err: any) => {
      while (0 < windows.length) {
        windows.shift()!.error(err);
      }
      subscriber.error(err);
    };

    innerFrom(openings).subscribe(
      new OperatorSubscriber(
        subscriber,
        (openValue) => {
          const window = new Subject<T>();
          windows.push(window);
          const closingSubscription = new Subscription();
          const closeWindow = () => {
            arrRemove(windows, window);
            window.complete();
            closingSubscription.unsubscribe();
          };

          let closingNotifier: Observable<any>;
          try {
            closingNotifier = innerFrom(closingSelector(openValue));
          } catch (err) {
            handleError(err);
            return;
          }

          subscriber.next(window.asObservable());

          closingSubscription.add(closingNotifier.subscribe(new OperatorSubscriber(subscriber, closeWindow, noop, handleError)));
        },
        noop
      )
    );

    // Subcribe to the source to get things started.
    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value: T) => {
          // Copy the windows array before we emit to
          // make sure we don't have issues with reentrant code.
          const windowsCopy = windows.slice();
          for (const window of windowsCopy) {
            window.next(value);
          }
        },
        () => {
          // Complete all of our windows before we complete.
          while (0 < windows.length) {
            windows.shift()!.complete();
          }
          subscriber.complete();
        },
        handleError,
        () => {
          // Add this teardown so that all window subjects are
          // disposed of. This way, if a user tries to subscribe
          // to a window *after* the outer subscription has been unsubscribed,
          // they will get an error, instead of waiting forever to
          // see if a value arrives.
          while (0 < windows.length) {
            windows.shift()!.unsubscribe();
          }
        }
      )
    );
  });
}
