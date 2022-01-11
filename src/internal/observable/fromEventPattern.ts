import { Observable } from '../Observable';
import { isFunction } from '../util/isFunction';
import { NodeEventHandler } from './fromEvent';
import { mapOneOrManyArgs } from '../util/mapOneOrManyArgs';

/* tslint:disable:max-line-length */
export function fromEventPattern<T>(
  addHandler: (handler: NodeEventHandler) => any,
  removeHandler?: (handler: NodeEventHandler, signal?: any) => void
): Observable<T>;
export function fromEventPattern<T>(
  addHandler: (handler: NodeEventHandler) => any,
  removeHandler?: (handler: NodeEventHandler, signal?: any) => void,
  resultSelector?: (...args: any[]) => T
): Observable<T>;
/* tslint:enable:max-line-length */

/**
 * Creates an Observable from an arbitrary API for registering event handlers.
 *
 * 从任意 API 创建一个 Observable 用于注册事件处理程序。
 *
 * <span class="informal">When that method for adding event handler was something {@link fromEvent}
 * was not prepared for.</span>
 *
 * 当添加事件处理程序的方法是 {@link fromEvent} 没有准备好。
 *
 * ![](fromEventPattern.png)
 *
 * `fromEventPattern` allows you to convert into an Observable any API that supports registering handler functions
 * for events. It is similar to {@link fromEvent}, but far
 * more flexible. In fact, all use cases of {@link fromEvent} could be easily handled by
 * `fromEventPattern` (although in slightly more verbose way).
 *
 * `fromEventPattern` 允许你将任何支持注册事件处理函数的 API 转换为 Observable。它类似于 {@link fromEvent}，但更加灵活。事实上，{@link fromEvent} 的所有用例都可以通过 `fromEventPattern` 轻松处理（尽管方式稍微冗长一些）。
 *
 * This operator accepts as a first argument an `addHandler` function, which will be injected with
 * handler parameter. That handler is actually an event handler function that you now can pass
 * to API expecting it. `addHandler` will be called whenever Observable
 * returned by the operator is subscribed, so registering handler in API will not
 * necessarily happen when `fromEventPattern` is called.
 *
 * 该运算符接受 `addHandler` 函数作为第一个参数，该函数将被注入处理程序参数。该处理程序实际上是一个事件处理程序函数，你现在可以将其传递给期望它的 API。`addHandler` 会在操作者返回的 Observable 被订阅时被调用，因此在调用 `fromEventPattern` 时不一定会在 API 中注册处理程序。
 *
 * After registration, every time an event that we listen to happens,
 * Observable returned by `fromEventPattern` will emit value that event handler
 * function was called with. Note that if event handler was called with more
 * than one argument, second and following arguments will not appear in the Observable.
 *
 * 注册后，每次我们监听的事件发生时，`fromEventPattern` 返回的 Observable 都会发出调用事件处理函数的值。请注意，如果使用多个参数调用事件处理程序，则第二个和后续参数将不会出现在 Observable 中。
 *
 * If API you are using allows to unregister event handlers as well, you can pass to `fromEventPattern`
 * another function - `removeHandler` - as a second parameter. It will be injected
 * with the same handler function as before, which now you can use to unregister
 * it from the API. `removeHandler` will be called when consumer of resulting Observable
 * unsubscribes from it.
 *
 * 如果你使用的 API 也允许取消注册事件处理程序，你可以将另一个函数 - `removeHandler` - 作为第二个参数传递给 `fromEventPattern`。它将注入与以前相同的处理函数，现在你可以使用它从 API 中注销它。当结果 Observable 的消费者取消订阅时，将调用 `removeHandler`。
 *
 * In some APIs unregistering is actually handled differently. Method registering an event handler
 * returns some kind of token, which is later used to identify which function should
 * be unregistered or it itself has method that unregisters event handler.
 * If that is the case with your API, make sure token returned
 * by registering method is returned by `addHandler`. Then it will be passed
 * as a second argument to `removeHandler`, where you will be able to use it.
 *
 * 在某些 API 中，取消注册的处理方式实际上有所不同。注册事件处理程序的方法返回某种标记，该标记稍后用于识别应该取消注册的函数，或者它本身具有取消注册事件处理程序的方法。如果你的 API 是这种情况，请确保注册方法返回的令牌由 `addHandler` 返回。然后它将作为第二个参数传递给 `removeHandler`，你可以在其中使用它。
 *
 * If you need access to all event handler parameters (not only the first one),
 * or you need to transform them in any way, you can call `fromEventPattern` with optional
 * third parameter - project function which will accept all arguments passed to
 * event handler when it is called. Whatever is returned from project function will appear on
 * resulting stream instead of usual event handlers first argument. This means
 * that default project can be thought of as function that takes its first parameter
 * and ignores the rest.
 *
 * 如果你需要访问所有事件处理程序参数（不仅是第一个），或者你需要以任何方式转换它们，你可以使用可选的第三个参数调用 `fromEventPattern` - 项目函数，它将接受传递给事件处理程序的所有参数叫。从项目函数返回的任何内容都将出现在结果流上，而不是通常的事件处理程序的第一个参数。这意味着可以将默认项目视为接受其第一个参数并忽略其余参数的函数。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Emits clicks happening on the DOM document
 *
 * 发出在 DOM 文档上发生的点击
 *
 * ```ts
 * import { fromEventPattern } from 'rxjs';
 *
 * function addClickHandler(handler) {
 *   document.addEventListener('click', handler);
 * }
 *
 * function removeClickHandler(handler) {
 *   document.removeEventListener('click', handler);
 * }
 *
 * const clicks = fromEventPattern(
 *   addClickHandler,
 *   removeClickHandler
 * );
 * clicks.subscribe(x => console.log(x));
 *
 * // Whenever you click anywhere in the browser, DOM MouseEvent
 * // object will be logged.
 * ```
 *
 * Use with API that returns cancellation token
 *
 * 与返回取消令牌的 API 一起使用
 *
 * ```ts
 * import { fromEventPattern } from 'rxjs';
 *
 * const token = someAPI.registerEventHandler(function() {});
 * someAPI.unregisterEventHandler(token); // this APIs cancellation method accepts
 *                                        // not handler itself, but special token.
 *
 * const someAPIObservable = fromEventPattern(
 *   function(handler) { return someAPI.registerEventHandler(handler); }, // Note that we return the token here...
 *   function(handler, token) { someAPI.unregisterEventHandler(token); }  // ...to then use it here.
 * );
 * ```
 *
 * Use with project function
 *
 * 与项目功能一起使用
 *
 * ```ts
 * import { fromEventPattern } from 'rxjs';
 *
 * someAPI.registerEventHandler((eventType, eventMessage) => {
 *   console.log(eventType, eventMessage); // Logs 'EVENT_TYPE' 'EVENT_MESSAGE' to console.
 * });
 *
 * const someAPIObservable = fromEventPattern(
 *   handler => someAPI.registerEventHandler(handler),
 *   handler => someAPI.unregisterEventHandler(handler)
 *   (eventType, eventMessage) => eventType + ' --- ' + eventMessage // without that function only 'EVENT_TYPE'
 * );                                                                // would be emitted by the Observable
 *
 * someAPIObservable.subscribe(value => console.log(value));
 *
 * // Logs:
 * // 'EVENT_TYPE --- EVENT_MESSAGE'
 * ```
 * @see {@link fromEvent}
 * @see {@link bindCallback}
 * @see {@link bindNodeCallback}
 * @param {function(handler: Function): any} addHandler A function that takes
 * a `handler` function as argument and attaches it somehow to the actual
 * source of events.
 *
 * 将 `handler` 函数作为参数并以某种方式将其附加到实际事件源的函数。
 *
 * @param {function(handler: Function, token?: any): void} [removeHandler] A function that
 * takes a `handler` function as an argument and removes it from the event source. If `addHandler`
 * returns some kind of token, `removeHandler` function will have it as a second parameter.
 * @param {function(...args: any): T} [project] A function to
 * transform results. It takes the arguments from the event handler and
 * should return a single value.
 * @return {Observable<T>} Observable which, when an event happens, emits first parameter
 * passed to registered event handler. Alternatively it emits whatever project function returns
 * at that moment.
 *
 * Observable，当事件发生时，它会发出第一个参数传递给注册的事件处理程序。或者，它会发出当时返回的任何项目函数。
 *
 */
export function fromEventPattern<T>(
  addHandler: (handler: NodeEventHandler) => any,
  removeHandler?: (handler: NodeEventHandler, signal?: any) => void,
  resultSelector?: (...args: any[]) => T
): Observable<T | T[]> {
  if (resultSelector) {
    return fromEventPattern<T>(addHandler, removeHandler).pipe(mapOneOrManyArgs(resultSelector));
  }

  return new Observable<T | T[]>((subscriber) => {
    const handler = (...e: T[]) => subscriber.next(e.length === 1 ? e[0] : e);
    const retValue = addHandler(handler);
    return isFunction(removeHandler) ? () => removeHandler(handler, retValue) : undefined;
  });
}
