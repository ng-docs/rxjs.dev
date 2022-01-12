/* @prettier */
import { Observable } from '../Observable';
import { SchedulerLike } from '../types';
import { bindCallbackInternals } from './bindCallbackInternals';

export function bindNodeCallback(
  callbackFunc: (...args: any[]) => void,
  resultSelector: (...args: any[]) => any,
  scheduler?: SchedulerLike
): (...args: any[]) => Observable<any>;

// args is the arguments array and we push the callback on the rest tuple since the rest parameter must be last (only item) in a parameter list
export function bindNodeCallback<A extends readonly unknown[], R extends readonly unknown[]>(
  callbackFunc: (...args: [...A, (err: any, ...res: R) => void]) => void,
  schedulerLike?: SchedulerLike
): (...arg: A) => Observable<R extends [] ? void : R extends [any] ? R[0] : R>;

/**
 * Converts a Node.js-style callback API to a function that returns an
 * Observable.
 *
 * 将 Node.js 样式的回调 API 转换为返回 Observable 的函数。
 *
 * <span class="informal">It's just like {@link bindCallback}, but the
 * callback is expected to be of type `callback(error, result)`.</span>
 *
 * <span class="informal">就像 {@link bindCallback} 一样，但是回调的类型应该是 `callback(error, result)` 。</span>
 *
 * `bindNodeCallback` is not an operator because its input and output are not
 * Observables. The input is a function `func` with some parameters, but the
 * last parameter must be a callback function that `func` calls when it is
 * done. The callback function is expected to follow Node.js conventions,
 * where the first argument to the callback is an error object, signaling
 * whether call was successful. If that object is passed to callback, it means
 * something went wrong.
 *
 * `bindNodeCallback` 不是运算符，因为它的输入和输出不是 Observables。输入是一个带有一些参数的函数 `func` ，但最后一个参数必须是 `func` 完成时调用的回调函数。回调函数应遵循 Node.js 约定，其中回调的第一个参数是一个错误对象，表示调用是否成功。如果该对象被传递给回调，则意味着出现问题。
 *
 * The output of `bindNodeCallback` is a function that takes the same
 * parameters as `func`, except the last one (the callback). When the output
 * function is called with arguments, it will return an Observable.
 * If `func` calls its callback with error parameter present, Observable will
 * error with that value as well. If error parameter is not passed, Observable will emit
 * second parameter. If there are more parameters (third and so on),
 * Observable will emit an array with all arguments, except first error argument.
 *
 * `bindNodeCallback` 的输出是一个函数，它采用与 `func` 相同的参数，除了最后一个（回调）。当使用参数调用输出函数时，它将返回一个 Observable。如果 `func` 在存在错误参数的情况下调用其回调，则 Observable 也会使用该值出错。如果没有传递错误参数，Observable 将发出第二个参数。如果有更多参数（第三个等等），Observable 将发出一个包含所有参数的数组，除了第一个错误参数。
 *
 * Note that `func` will not be called at the same time output function is,
 * but rather whenever resulting Observable is subscribed. By default call to
 * `func` will happen synchronously after subscription, but that can be changed
 * with proper `scheduler` provided as optional third parameter. {@link SchedulerLike}
 * can also control when values from callback will be emitted by Observable.
 * To find out more, check out documentation for {@link bindCallback}, where
 * {@link SchedulerLike} works exactly the same.
 *
 * 请注意， `func` 不会在输出函数被调用的同时被调用，而是在订阅结果 Observable 时被调用。默认情况下，对 `func` 的调用将在订阅后同步发生，但可以通过作为可选第三个参数提供的适当 `scheduler` 来更改。 {@link SchedulerLike} 还可以控制 Observable 何时发出回调中的值。要了解更多信息，请查看 {@link bindCallback} 的文档，其中 {@link SchedulerLike} 的工作方式完全相同。
 *
 * As in {@link bindCallback}, context (`this` property) of input function will be set to context
 * of returned function, when it is called.
 *
 * 如在 {@link bindCallback} 中，输入函数的上下文（ `this` 属性）将在调用时设置为返回函数的上下文。
 *
 * After Observable emits value, it will complete immediately. This means
 * even if `func` calls callback again, values from second and consecutive
 * calls will never appear on the stream. If you need to handle functions
 * that call callbacks multiple times, check out {@link fromEvent} or
 * {@link fromEventPattern} instead.
 *
 * Observable 发出值后，会立即完成。这意味着即使 `func` 再次调用回调，来自第二次和连续调用的值也永远不会出现在流中。如果你需要处理多次调用回调的函数，请改用 {@link fromEvent} 或 {@link fromEventPattern}。
 *
 * Note that `bindNodeCallback` can be used in non-Node.js environments as well.
 * "Node.js-style" callbacks are just a convention, so if you write for
 * browsers or any other environment and API you use implements that callback style,
 * `bindNodeCallback` can be safely used on that API functions as well.
 *
 * 请注意， `bindNodeCallback` 也可以在非 Node.js 环境中使用。 “Node.js 样式”回调只是一种约定，因此如果你为浏览器或任何其他环境编写，并且你使用的 API 实现了该回调样式， `bindNodeCallback` 也可以安全地用于该 API 函数。
 *
 * Remember that Error object passed to callback does not have to be an instance
 * of JavaScript built-in `Error` object. In fact, it does not even have to an object.
 * Error parameter of callback function is interpreted as "present", when value
 * of that parameter is truthy. It could be, for example, non-zero number, non-empty
 * string or boolean `true`. In all of these cases resulting Observable would error
 * with that value. This means usually regular style callbacks will fail very often when
 * `bindNodeCallback` is used. If your Observable errors much more often then you
 * would expect, check if callback really is called in Node.js-style and, if not,
 * switch to {@link bindCallback} instead.
 *
 * 请记住，传递给回调的 Error 对象不必是 JavaScript 内置 `Error` 对象的实例。事实上，它甚至不需要一个对象。当该参数的值为真时，回调函数的错误参数被解释为“存在”。例如，它可以是非零数字、非空字符串或布尔值 `true` 。在所有这些情况下，结果 Observable 都会与该值出错。这意味着当使用 `bindNodeCallback` 时，通常常规样式的回调会经常失败。如果你的 Observable 错误比你预期的要频繁得多，请检查是否真的以 Node.js 样式调用了回调，如果没有，请切换到 {@link bindCallback}。
 *
 * Note that even if error parameter is technically present in callback, but its value
 * is falsy, it still won't appear in array emitted by Observable.
 *
 * 请注意，即使错误参数在技术上存在于回调中，但它的值是虚假的，它仍然不会出现在 Observable 发出的数组中。
 *
 * ## Examples
 *
 * ## 例子
 *
 * ### Read a file from the filesystem and get the data as an Observable
 *
 * ### 从文件系统读取文件并将数据作为 Observable 获取
 *
 * ```ts
 * import * as fs from 'fs';
 * const readFileAsObservable = bindNodeCallback(fs.readFile);
 * const result = readFileAsObservable('./roadNames.txt', 'utf8');
 * result.subscribe(x => console.log(x), e => console.error(e));
 * ```
 *
 * ### Use on function calling callback with multiple arguments
 *
 * ### 用于具有多个参数的函数调用回调
 *
 * ```ts
 * someFunction((err, a, b) => {
 *   console.log(err); // null
 *   console.log(a); // 5
 *   console.log(b); // "some string"
 * });
 * const boundSomeFunction = bindNodeCallback(someFunction);
 * boundSomeFunction()
 * .subscribe(value => {
 *   console.log(value); // [5, "some string"]
 * });
 * ```
 *
 * ### Use on function calling callback in regular style
 *
 * ### 以常规样式用于函数调用回调
 *
 * ```ts
 * someFunction(a => {
 *   console.log(a); // 5
 * });
 * const boundSomeFunction = bindNodeCallback(someFunction);
 * boundSomeFunction()
 * .subscribe(
 *   value => {}             // never gets called
 *   err => console.log(err) // 5
 * );
 * ```
 * @see {@link bindCallback}
 * @see {@link from}
 * @param {function} func Function with a Node.js-style callback as the last parameter.
 *
 * 以 Node.js 风格的回调作为最后一个参数的函数。
 *
 * @param {SchedulerLike} [scheduler] The scheduler on which to schedule the
 * callbacks.
 * @return {function(...params: *): Observable} A function which returns the
 * Observable that delivers the same values the Node.js callback would
 * deliver.
 *
 * 一个返回 Observable 的函数，它提供与 Node.js 回调将提供的值相同的值。
 *
 */
export function bindNodeCallback(
  callbackFunc: (...args: [...any[], (err: any, ...res: any) => void]) => void,
  resultSelector?: ((...args: any[]) => any) | SchedulerLike,
  scheduler?: SchedulerLike
): (...args: any[]) => Observable<any> {
  return bindCallbackInternals(true, callbackFunc, resultSelector, scheduler);
}
