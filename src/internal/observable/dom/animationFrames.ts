import { Observable } from '../../Observable';
import { Subscription } from '../../Subscription';
import { TimestampProvider } from '../../types';
import { performanceTimestampProvider } from '../../scheduler/performanceTimestampProvider';
import { animationFrameProvider } from '../../scheduler/animationFrameProvider';

/**
 * An observable of animation frames
 *
 * 可观察者动画帧
 *
 * Emits the amount of time elapsed since subscription and the timestamp on each animation frame.
 * Defaults to milliseconds provided to the requestAnimationFrame's callback. Does not end on its own.
 *
 * 发出自订阅以来经过的时间量和每个动画帧上的时间戳。默认为提供给 requestAnimationFrame 回调的毫秒数。不会自行结束。
 *
 * Every subscription will start a separate animation loop. Since animation frames are always scheduled
 * by the browser to occur directly before a repaint, scheduling more than one animation frame synchronously
 * should not be much different or have more overhead than looping over an array of events during
 * a single animation frame. However, if for some reason the developer would like to ensure the
 * execution of animation-related handlers are all executed during the same task by the engine,
 * the `share` operator can be used.
 *
 * 每个订阅都会启动一个单独的动画循环。由于动画帧总是由浏览器调度在重绘之前直接发生，因此同步调度多个动画帧与在单个动画帧期间循环遍历一系列事件应该没有太大区别或开销更大。但是，如果出于某种原因，开发人员希望确保动画相关处理程序的执行都由引擎在同一任务期间执行，则可以使用 `share` 操作符。
 *
 * This is useful for setting up animations with RxJS.
 *
 * 这对于使用 RxJS 设置动画很有用。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Tweening a div to move it on the screen
 *
 * 补间 div 以在屏幕上移动它
 *
 * ```ts
 * import { animationFrames, map, takeWhile, endWith } from 'rxjs';
 *
 * function tween(start: number, end: number, duration: number) {
 *   const diff = end - start;
 *   return animationFrames().pipe(
 *     // Figure out what percentage of time has passed
 *     map(({ elapsed }) => elapsed / duration),
 *     // Take the vector while less than 100%
 *     takeWhile(v => v < 1),
 *     // Finish with 100%
 *     endWith(1),
 *     // Calculate the distance traveled between start and end
 *     map(v => v * diff + start)
 *   );
 * }
 *
 * // Setup a div for us to move around
 * const div = document.createElement('div');
 * document.body.appendChild(div);
 * div.style.position = 'absolute';
 * div.style.width = '40px';
 * div.style.height = '40px';
 * div.style.backgroundColor = 'lime';
 * div.style.transform = 'translate3d(10px, 0, 0)';
 *
 * tween(10, 200, 4000).subscribe(x => {
 *   div.style.transform = `translate3d(${ x }px, 0, 0)`;
 * });
 * ```
 *
 * Providing a custom timestamp provider
 *
 * 提供自定义时间戳提供程序
 *
 * ```ts
 * import { animationFrames, TimestampProvider } from 'rxjs';
 *
 * // A custom timestamp provider
 * let now = 0;
 * const customTSProvider: TimestampProvider = {
 *   now() { return now++; }
 * };
 *
 * const source$ = animationFrames(customTSProvider);
 *
 * // Log increasing numbers 0...1...2... on every animation frame.
 * source$.subscribe(({ elapsed }) => console.log(elapsed));
 * ```
 * @param timestampProvider An object with a `now` method that provides a numeric timestamp
 *
 * 具有提供数字时间戳的 `now` 方法的对象
 *
 */
export function animationFrames(timestampProvider?: TimestampProvider) {
  return timestampProvider ? animationFramesFactory(timestampProvider) : DEFAULT_ANIMATION_FRAMES;
}

/**
 * Does the work of creating the observable for `animationFrames`.
 *
 * 为 `animationFrames` 创建 observable 的工作。
 *
 * @param timestampProvider The timestamp provider to use to create the observable
 *
 * 用于创建 observable 的时间戳提供程序
 *
 */
function animationFramesFactory(timestampProvider?: TimestampProvider) {
  const { schedule } = animationFrameProvider;
  return new Observable<{ timestamp: number; elapsed: number }>((subscriber) => {
    const subscription = new Subscription();
    // If no timestamp provider is specified, use performance.now() - as it
    // will return timestamps 'compatible' with those passed to the run
    // callback and won't be affected by NTP adjustments, etc.
    const provider = timestampProvider || performanceTimestampProvider;
    // Capture the start time upon subscription, as the run callback can remain
    // queued for a considerable period of time and the elapsed time should
    // represent the time elapsed since subscription - not the time since the
    // first rendered animation frame.
    const start = provider.now();
    const run = (timestamp: DOMHighResTimeStamp | number) => {
      // Use the provider's timestamp to calculate the elapsed time. Note that
      // this means - if the caller hasn't passed a provider - that
      // performance.now() will be used instead of the timestamp that was
      // passed to the run callback. The reason for this is that the timestamp
      // passed to the callback can be earlier than the start time, as it
      // represents the time at which the browser decided it would render any
      // queued frames - and that time can be earlier the captured start time.
      const now = provider.now();
      subscriber.next({
        timestamp: timestampProvider ? now : timestamp,
        elapsed: now - start,
      });
      if (!subscriber.closed) {
        subscription.add(schedule(run));
      }
    };
    subscription.add(schedule(run));
    return subscription;
  });
}

/**
 * In the common case, where the timestamp provided by the rAF API is used,
 * we use this shared observable to reduce overhead.
 *
 * 在使用 rAF API 提供的时间戳的常见情况下，我们使用这个共享的 observable 来减少开销。
 *
 */
const DEFAULT_ANIMATION_FRAMES = animationFramesFactory();
