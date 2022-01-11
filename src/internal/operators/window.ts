import { Observable } from '../Observable';
import { OperatorFunction } from '../types';
import { Subject } from '../Subject';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { noop } from '../util/noop';

/**
 * Branch out the source Observable values as a nested Observable whenever
 * `windowBoundaries` emits.
 *
 * 每当 `windowBoundaries` 发出时，将源 Observable 值分支为嵌套的 Observable。
 *
 * <span class="informal">It's like {@link buffer}, but emits a nested Observable
 * instead of an array.</span>
 *
 * 它类似于 {@link buffer}，但发出一个嵌套的 Observable 而不是一个数组。
 *
 * ![](window.png)
 *
 * Returns an Observable that emits windows of items it collects from the source
 * Observable. The output Observable emits connected, non-overlapping
 * windows. It emits the current window and opens a new one whenever the
 * Observable `windowBoundaries` emits an item. Because each window is an
 * Observable, the output is a higher-order Observable.
 *
 * 返回一个 Observable，它发出从源 Observable 收集的项目的窗口。输出 Observable 发出连接的、不重叠的窗口。只要 Observable `windowBoundaries` 发出一个项目，它就会发出当前窗口并打开一个新窗口。因为每个窗口都是一个 Observable，所以输出是一个高阶 Observable。
 *
 * ## Example
 *
 * ## 例子
 *
 * In every window of 1 second each, emit at most 2 click events
 *
 * 在每个 1 秒的窗口中，最多发出 2 个点击事件
 *
 * ```ts
 * import { fromEvent, interval, window, map, take, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const sec = interval(1000);
 * const result = clicks.pipe(
 *   window(sec),
 *   map(win => win.pipe(take(2))), // take at most 2 emissions from each window
 *   mergeAll()                     // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link windowCount}
 * @see {@link windowTime}
 * @see {@link windowToggle}
 * @see {@link windowWhen}
 * @see {@link buffer}
 * @param {Observable<any>} windowBoundaries An Observable that completes the
 * previous window and starts a new window.
 *
 * 一个完成前一个窗口并启动一个新窗口的 Observable。
 *
 * @return A function that returns an Observable of windows, which are
 * Observables emitting values of the source Observable.
 *
 * 一个返回窗口的 Observable 的函数，这些窗口是 Observable 发出源 Observable 的值。
 *
 */
export function window<T>(windowBoundaries: Observable<any>): OperatorFunction<T, Observable<T>> {
  return operate((source, subscriber) => {
    let windowSubject: Subject<T> = new Subject<T>();

    subscriber.next(windowSubject.asObservable());

    const errorHandler = (err: any) => {
      windowSubject.error(err);
      subscriber.error(err);
    };

    // Subscribe to our source
    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value) => windowSubject?.next(value),
        () => {
          windowSubject.complete();
          subscriber.complete();
        },
        errorHandler
      )
    );

    // Subscribe to the window boundaries.
    windowBoundaries.subscribe(
      new OperatorSubscriber(
        subscriber,
        () => {
          windowSubject.complete();
          subscriber.next((windowSubject = new Subject()));
        },
        noop,
        errorHandler
      )
    );

    return () => {
      // Unsubscribing the subject ensures that anyone who has captured
      // a reference to this window that tries to use it after it can
      // no longer get values from the source will get an ObjectUnsubscribedError.
      windowSubject?.unsubscribe();
      windowSubject = null!;
    };
  });
}
