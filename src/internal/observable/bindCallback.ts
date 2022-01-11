/* @prettier */
import { SchedulerLike } from '../types';
import { Observable } from '../Observable';
import { bindCallbackInternals } from './bindCallbackInternals';

export function bindCallback(
  callbackFunc: (...args: any[]) => void,
  resultSelector: (...args: any[]) => any,
  scheduler?: SchedulerLike
): (...args: any[]) => Observable<any>;

// args is the arguments array and we push the callback on the rest tuple since the rest parameter must be last (only item) in a parameter list
export function bindCallback<A extends readonly unknown[], R extends readonly unknown[]>(
  callbackFunc: (...args: [...A, (...res: R) => void]) => void,
  schedulerLike?: SchedulerLike
): (...arg: A) => Observable<R extends [] ? void : R extends [any] ? R[0] : R>;

/**
 * Converts a callback API to a function that returns an Observable.
 *
 * 将回调 API 转换为返回 Observable 的函数。
 *
 * <span class="informal">Give it a function `f` of type `f(x, callback)` and
 * it will return a function `g` that when called as `g(x)` will output an
 * Observable.</span>
 *
 * 给它一个 `f(x, callback)` 类型的函数 `f`，它会返回一个函数 `g`，当调用 `g(x)` 时会输出一个 Observable。
 *
 * `bindCallback` is not an operator because its input and output are not
 * Observables. The input is a function `func` with some parameters. The
 * last parameter must be a callback function that `func` calls when it is
 * done.
 *
 * `bindCallback` 不是运算符，因为它的输入和输出不是 Observable。输入是一个带有一些参数的函数 `func`。最后一个参数必须是 `func` 完成时调用的回调函数。
 *
 * The output of `bindCallback` is a function that takes the same parameters
 * as `func`, except the last one (the callback). When the output function
 * is called with arguments it will return an Observable. If function `func`
 * calls its callback with one argument, the Observable will emit that value.
 * If on the other hand the callback is called with multiple values the resulting
 * Observable will emit an array with said values as arguments.
 *
 * `bindCallback` 的输出是一个函数，它采用与 `func` 相同的参数，除了最后一个（回调）。当使用参数调用输出函数时，它将返回一个 Observable。如果函数 `func` 使用一个参数调用其回调，则 Observable 将发出该值。另一方面，如果使用多个值调用回调，则结果 Observable 将发出一个以所述值作为参数的数组。
 *
 * It is **very important** to remember that input function `func` is not called
 * when the output function is, but rather when the Observable returned by the output
 * function is subscribed. This means if `func` makes an AJAX request, that request
 * will be made every time someone subscribes to the resulting Observable, but not before.
 *
 * **非常重要**的是要记住，输入函数 `func` 不是在输出函数时调用，而是在订阅输出函数返回的 Observable 时调用。这意味着如果 `func` 发出 AJAX 请求，则每次有人订阅生成的 Observable 时都会发出该请求，但之前不会。
 *
 * The last optional parameter - `scheduler` - can be used to control when the call
 * to `func` happens after someone subscribes to Observable, as well as when results
 * passed to callback will be emitted. By default, the subscription to an Observable calls `func`
 * synchronously, but using {@link asyncScheduler} as the last parameter will defer the call to `func`,
 * just like wrapping the call in `setTimeout` with a timeout of `0` would. If you were to use the async Scheduler
 * and call `subscribe` on the output Observable, all function calls that are currently executing
 * will end before `func` is invoked.
 *
 * 最后一个可选参数 - `scheduler` - 可用于控制在有人订阅 Observable 后何时调用 `func`，以及何时发出传递给回调的结果。默认情况下，订阅 Observable 会同步调用 `func`，但使用 {@link asyncScheduler} 作为最后一个参数将推迟对 `func` 的调用，就像将调用包装在 `setTimeout` 中并设置超时时间为 `0` 一样。如果你要使用异步调度程序并在输出 Observable 上调用 `subscribe`，则当前正在执行的所有函数调用将在调用 `func` 之前结束。
 *
 * By default, results passed to the callback are emitted immediately after `func` invokes the callback.
 * In particular, if the callback is called synchronously, then the subscription of the resulting Observable
 * will call the `next` function synchronously as well.  If you want to defer that call,
 * you may use {@link asyncScheduler} just as before.  This means that by using `Scheduler.async` you can
 * ensure that `func` always calls its callback asynchronously, thus avoiding terrifying Zalgo.
 *
 * 默认情况下，传递给回调的结果会在 `func` 调用回调后立即发出。特别是，如果同步调用回调，则生成的 Observable 的订阅也将同步调用 `next` 函数。如果你想推迟那个调用，你可以像以前一样使用 {@link asyncScheduler}。这意味着通过使用 `Scheduler.async`，你可以确保 `func` 始终异步调用其回调，从而避免可怕的 Zalgo。
 *
 * Note that the Observable created by the output function will always emit a single value
 * and then complete immediately. If `func` calls the callback multiple times, values from subsequent
 * calls will not appear in the stream. If you need to listen for multiple calls,
 *  you probably want to use {@link fromEvent} or {@link fromEventPattern} instead.
 *
 * 请注意，由输出函数创建的 Observable 将始终发出单个值，然后立即完成。如果 `func` 多次调用回调，后续调用的值将不会出现在流中。如果你需要监听多个呼叫，你可能希望使用 {@link fromEvent} 或 {@link fromEventPattern} 代替。
 *
 * If `func` depends on some context (`this` property) and is not already bound, the context of `func`
 * will be the context that the output function has at call time. In particular, if `func`
 * is called as a method of some objec and if `func` is not already bound, in order to preserve the context
 * it is recommended that the context of the output function is set to that object as well.
 *
 * 如果 `func` 依赖于某个上下文（`this` 属性）并且尚未绑定，则 `func` 的上下文将是输出函数在调用时具有的上下文。特别是，如果 `func` 作为某个对象的方法被调用并且如果 `func` 尚未绑定，为了保留上下文，建议也将输出函数的上下文设置为该对象。
 *
 * If the input function calls its callback in the "node style" (i.e. first argument to callback is
 * optional error parameter signaling whether the call failed or not), {@link bindNodeCallback}
 * provides convenient error handling and probably is a better choice.
 * `bindCallback` will treat such functions the same as any other and error parameters
 * (whether passed or not) will always be interpreted as regular callback argument.
 *
 * 如果输入函数以“节点样式”调用其回调（即回调的第一个参数是可选的错误参数，指示调用是否失败），{@link bindNodeCallback} 提供方便的错误处理，可能是更好的选择。`bindCallback` 会将此类函数视为与任何其他函数相同，并且错误参数（无论是否传递）将始终被解释为常规回调参数。
 *
 * ## Examples
 *
 * ## 例子
 *
 * ### Convert jQuery's getJSON to an Observable API
 *
 * ### 将 jQuery 的 getJSON 转换为 Observable API
 *
 * ```ts
 * import { bindCallback } from 'rxjs';
 * import * as jQuery from 'jquery';
 *
 * // Suppose we have jQuery.getJSON('/my/url', callback)
 * const getJSONAsObservable = bindCallback(jQuery.getJSON);
 * const result = getJSONAsObservable('/my/url');
 * result.subscribe(x => console.log(x), e => console.error(e));
 * ```
 *
 * ### Receive an array of arguments passed to a callback
 *
 * ### 接收传递给回调的参数数组
 *
 * ```ts
 * import { bindCallback } from 'rxjs';
 *
 * const someFunction = (cb) => {
 *   cb(5, 'some string', {someProperty: 'someValue'})
 * };
 *
 * const boundSomeFunction = bindCallback(someFunction);
 * boundSomeFunction(12, 10).subscribe(values => {
 *   console.log(values); // [22, 2]
 * });
 * ```
 *
 * ### Compare behaviour with and without async Scheduler
 *
 * ### 比较使用和不使用异步调度程序的行为
 *
 * ```ts
 * import { bindCallback, asyncScheduler } from 'rxjs';
 *
 * function iCallMyCallbackSynchronously(cb) {
 *   cb();
 * }
 *
 * const boundSyncFn = bindCallback(iCallMyCallbackSynchronously);
 * const boundAsyncFn = bindCallback(iCallMyCallbackSynchronously, null, asyncScheduler);
 *
 * boundSyncFn().subscribe(() => console.log('I was sync!'));
 * boundAsyncFn().subscribe(() => console.log('I was async!'));
 * console.log('This happened...');
 *
 * // Logs:
 * // I was sync!
 * // This happened...
 * // I was async!
 * ```
 *
 * ### Use bindCallback on an object method
 *
 * ### 在对象方法上使用 bindCallback
 *
 * ```ts
 * import { bindCallback } from 'rxjs';
 *
 * const boundMethod = bindCallback(someObject.methodWithCallback);
 * boundMethod
 *   .call(someObject) // make sure methodWithCallback has access to someObject
 *   .subscribe(subscriber);
 * ```
 * @see {@link bindNodeCallback}
 * @see {@link from}
 * @param {function} func A function with a callback as the last parameter.
 *
 * 带有回调作为最后一个参数的函数。
 *
 * @param {SchedulerLike} [scheduler] The scheduler on which to schedule the
 * callbacks.
 * @return {function(...params: *): Observable} A function which returns the
 * Observable that delivers the same values the callback would deliver.
 *
 * 一个返回 Observable 的函数，该函数传递回调将传递的相同值。
 *
 */
export function bindCallback(
  callbackFunc: (...args: [...any[], (...res: any) => void]) => void,
  resultSelector?: ((...args: any[]) => any) | SchedulerLike,
  scheduler?: SchedulerLike
): (...args: any[]) => Observable<unknown> {
  return bindCallbackInternals(false, callbackFunc, resultSelector, scheduler);
}
