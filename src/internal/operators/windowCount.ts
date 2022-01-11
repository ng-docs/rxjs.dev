import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Branch out the source Observable values as a nested Observable with each
 * nested Observable emitting at most `windowSize` values.
 *
 * 将源 Observable 值分支为嵌套的 Observable，每个嵌套的 Observable 最多发射 `windowSize` 值。
 *
 * <span class="informal">It's like {@link bufferCount}, but emits a nested
 * Observable instead of an array.</span>
 *
 * <span class="informal">它类似于 {@link bufferCount}，但发出一个嵌套的 Observable 而不是一个数组。</span>
 *
 * ![](windowCount.png)
 *
 * Returns an Observable that emits windows of items it collects from the source
 * Observable. The output Observable emits windows every `startWindowEvery`
 * items, each containing no more than `windowSize` items. When the source
 * Observable completes or encounters an error, the output Observable emits
 * the current window and propagates the notification from the source
 * Observable. If `startWindowEvery` is not provided, then new windows are
 * started immediately at the start of the source and when each window completes
 * with size `windowSize`.
 *
 * 返回一个 Observable，它发出从源 Observable 收集的项目的窗口。输出 Observable 会在每个 `startWindowEvery` 项目中发出窗口，每个项目包含不超过 `windowSize` 个项目。当源 Observable 完成或遇到错误时，输出 Observable 会发出当前窗口并传播来自源 Observable 的通知。如果没有提供 `startWindowEvery`，那么新窗口会在源文件的开始处以及每个窗口以 `windowSize` 大小完成时立即启动。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Ignore every 3rd click event, starting from the first one
 *
 * 忽略每第三次点击事件，从第一次开始
 *
 * ```ts
 * import { fromEvent, windowCount, map, skip, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowCount(3),
 *   map(win => win.pipe(skip(1))), // skip first of every 3 clicks
 *   mergeAll()                     // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * Ignore every 3rd click event, starting from the third one
 *
 * 忽略每第三次点击事件，从第三次开始
 *
 * ```ts
 * import { fromEvent, windowCount, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowCount(2, 3),
 *   mergeAll() // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 * @see {@link window}
 * @see {@link windowTime}
 * @see {@link windowToggle}
 * @see {@link windowWhen}
 * @see {@link bufferCount}
 * @param {number} windowSize The maximum number of values emitted by each
 * window.
 *
 * 每个窗口发出的最大值数。
 *
 * @param {number} [startWindowEvery] Interval at which to start a new window.
 * For example if `startWindowEvery` is `2`, then a new window will be started
 * on every other value from the source. A new window is started at the
 * beginning of the source by default.
 * @return A function that returns an Observable of windows, which in turn are
 * Observable of values.
 *
 * 一个返回窗口的 Observable 的函数，而这些窗口又是值的 Observable。
 *
 */
export function windowCount<T>(windowSize: number, startWindowEvery: number = 0): OperatorFunction<T, Observable<T>> {
  const startEvery = startWindowEvery > 0 ? startWindowEvery : windowSize;

  return operate((source, subscriber) => {
    let windows = [new Subject<T>()];
    let starts: number[] = [];
    let count = 0;

    // Open the first window.
    subscriber.next(windows[0].asObservable());

    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value: T) => {
          // Emit the value through all current windows.
          // We don't need to create a new window yet, we
          // do that as soon as we close one.
          for (const window of windows) {
            window.next(value);
          }
          // Here we're using the size of the window array to figure
          // out if the oldest window has emitted enough values. We can do this
          // because the size of the window array is a function of the values
          // seen by the subscription. If it's time to close it, we complete
          // it and remove it.
          const c = count - windowSize + 1;
          if (c >= 0 && c % startEvery === 0) {
            windows.shift()!.complete();
          }

          // Look to see if the next count tells us it's time to open a new window.
          // TODO: We need to figure out if this really makes sense. We're technically
          // emitting windows *before* we have a value to emit them for. It's probably
          // more expected that we should be emitting the window when the start
          // count is reached -- not before.
          if (++count % startEvery === 0) {
            const window = new Subject<T>();
            windows.push(window);
            subscriber.next(window.asObservable());
          }
        },
        () => {
          while (windows.length > 0) {
            windows.shift()!.complete();
          }
          subscriber.complete();
        },
        (err) => {
          while (windows.length > 0) {
            windows.shift()!.error(err);
          }
          subscriber.error(err);
        },
        () => {
          starts = null!;
          windows = null!;
        }
      )
    );
  });
}
