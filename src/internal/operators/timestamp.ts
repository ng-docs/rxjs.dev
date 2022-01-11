import { OperatorFunction, TimestampProvider, Timestamp } from '../types';
import { dateTimestampProvider } from '../scheduler/dateTimestampProvider';
import { map } from './map';

/**
 * Attaches a timestamp to each item emitted by an observable indicating when it was emitted
 *
 * 将时间戳附加到由可观察者发出的每个项目上，指示它何时发出
 *
 * The `timestamp` operator maps the *source* observable stream to an object of type
 * `{value: T, timestamp: R}`. The properties are generically typed. The `value` property contains the value
 * and type of the *source* observable. The `timestamp` is generated by the schedulers `now` function. By
 * default, it uses the `asyncScheduler` which simply returns `Date.now()` (milliseconds since 1970/01/01
 * 00:00:00:000) and therefore is of type `number`.
 *
 * `timestamp` 操作符将*源*可观察流映射到 `{value: T, timestamp: R}` 类型的对象。属性是一般类型的。`value` 属性包含*源*observable 的值和类型。`timestamp` 由调度程序 `now` 功能生成。默认情况下，它使用 `asyncScheduler`，它只返回 `Date.now()`（自 1970/01/01 00:00:00:000 以来的毫秒数），因此是 `number` 类型。
 *
 * ![](timestamp.png)
 *
 * ## Example
 *
 * ## 例子
 *
 * In this example there is a timestamp attached to the document's click events
 *
 * 在此示例中，文档的点击事件附加了一个时间戳
 *
 * ```ts
 * import { fromEvent, timestamp } from 'rxjs';
 *
 * const clickWithTimestamp = fromEvent(document, 'click').pipe(
 *   timestamp()
 * );
 *
 * // Emits data of type { value: PointerEvent, timestamp: number }
 * clickWithTimestamp.subscribe(data => {
 *   console.log(data);
 * });
 * ```
 * @param timestampProvider An object with a `now()` method used to get the current timestamp.
 *
 * 具有 `now()` 方法的对象，用于获取当前时间戳。
 *
 * @return A function that returns an Observable that attaches a timestamp to
 * each item emitted by the source Observable indicating when it was emitted.
 *
 * 一个返回 Observable 的函数，该函数将时间戳附加到源 Observable 发出的每个项目上，指示它何时发出。
 *
 */
export function timestamp<T>(timestampProvider: TimestampProvider = dateTimestampProvider): OperatorFunction<T, Timestamp<T>> {
  return map((value: T) => ({ value, timestamp: timestampProvider.now() }));
}
