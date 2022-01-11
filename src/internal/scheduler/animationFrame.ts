import { AnimationFrameAction } from './AnimationFrameAction';
import { AnimationFrameScheduler } from './AnimationFrameScheduler';

/**
 * Animation Frame Scheduler
 *
 * 动画帧调度器
 *
 * <span class="informal">Perform task when `window.requestAnimationFrame` would fire</span>
 *
 * 在 `window.requestAnimationFrame` 触发时执行任务
 *
 * When `animationFrame` scheduler is used with delay, it will fall back to {@link asyncScheduler} scheduler
 * behaviour.
 *
 * 当 `animationFrame` 调度器与延迟一起使用时，它将回退到 {@link asyncScheduler} 调度器行为。
 *
 * Without delay, `animationFrame` scheduler can be used to create smooth browser animations.
 * It makes sure scheduled task will happen just before next browser content repaint,
 * thus performing animations as efficiently as possible.
 *
 * 无需延迟， `animationFrame` 调度程序可用于创建流畅的浏览器动画。它确保计划任务将在下一次浏览器内容重绘之前发生，从而尽可能高效地执行动画。
 *
 * ## Example
 *
 * ## 例子
 *
 * Schedule div height animation
 *
 * 安排 div 高度动画
 *
 * ```ts
 * // html: <div style="background: #0ff;"></div>
 * import { animationFrameScheduler } from 'rxjs';
 *
 * const div = document.querySelector('div');
 *
 * animationFrameScheduler.schedule(function(height) {
 *   div.style.height = height + "px";
 *
 *   this.schedule(height + 1);  // `this` references currently executing Action,
 *                               // which we reschedule with new state
 * }, 0, 0);
 *
 * // You will see a div element growing in height
 * ```
 */

export const animationFrameScheduler = new AnimationFrameScheduler(AnimationFrameAction);

/**
 * @deprecated Renamed to {@link animationFrameScheduler}. Will be removed in v8.
 *
 * 重命名为 {@link animationFrameScheduler}。将在 v8 中删除。
 *
 */
export const animationFrame = animationFrameScheduler;
