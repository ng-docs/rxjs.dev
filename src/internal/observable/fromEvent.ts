import { innerFrom } from '../observable/innerFrom';
import { Observable } from '../Observable';
import { mergeMap } from '../operators/mergeMap';
import { isArrayLike } from '../util/isArrayLike';
import { isFunction } from '../util/isFunction';
import { mapOneOrManyArgs } from '../util/mapOneOrManyArgs';

// These constants are used to create handler registry functions using array mapping below.
const nodeEventEmitterMethods = ['addListener', 'removeListener'] as const;
const eventTargetMethods = ['addEventListener', 'removeEventListener'] as const;
const jqueryMethods = ['on', 'off'] as const;

export interface NodeStyleEventEmitter {
  addListener(eventName: string | symbol, handler: NodeEventHandler): this;
  removeListener(eventName: string | symbol, handler: NodeEventHandler): this;
}

export type NodeEventHandler = (...args: any[]) => void;

// For APIs that implement `addListener` and `removeListener` methods that may
// not use the same arguments or return EventEmitter values
// such as React Native
export interface NodeCompatibleEventEmitter {
  addListener(eventName: string, handler: NodeEventHandler): void | {};
  removeListener(eventName: string, handler: NodeEventHandler): void | {};
}

// Use handler types like those in @types/jquery. See:
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/847731ba1d7fa6db6b911c0e43aa0afe596e7723/types/jquery/misc.d.ts#L6395
export interface JQueryStyleEventEmitter<TContext, T> {
  on(eventName: string, handler: (this: TContext, t: T, ...args: any[]) => any): void;
  off(eventName: string, handler: (this: TContext, t: T, ...args: any[]) => any): void;
}

export interface EventListenerObject<E> {
  handleEvent(evt: E): void;
}

export interface HasEventTargetAddRemove<E> {
  addEventListener(
    type: string,
    listener: ((evt: E) => void) | EventListenerObject<E> | null,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: ((evt: E) => void) | EventListenerObject<E> | null,
    options?: EventListenerOptions | boolean
  ): void;
}

export interface EventListenerOptions {
  capture?: boolean;
  passive?: boolean;
  once?: boolean;
}

export interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean;
  passive?: boolean;
}

export function fromEvent<T>(target: HasEventTargetAddRemove<T> | ArrayLike<HasEventTargetAddRemove<T>>, eventName: string): Observable<T>;
export function fromEvent<T, R>(
  target: HasEventTargetAddRemove<T> | ArrayLike<HasEventTargetAddRemove<T>>,
  eventName: string,
  resultSelector: (event: T) => R
): Observable<R>;
export function fromEvent<T>(
  target: HasEventTargetAddRemove<T> | ArrayLike<HasEventTargetAddRemove<T>>,
  eventName: string,
  options: EventListenerOptions
): Observable<T>;
export function fromEvent<T, R>(
  target: HasEventTargetAddRemove<T> | ArrayLike<HasEventTargetAddRemove<T>>,
  eventName: string,
  options: EventListenerOptions,
  resultSelector: (event: T) => R
): Observable<R>;

export function fromEvent(target: NodeStyleEventEmitter | ArrayLike<NodeStyleEventEmitter>, eventName: string): Observable<unknown>;
/**
 * @deprecated Do not specify explicit type parameters. Signatures with type parameters that cannot be inferred will be removed in v8.
 *
 * 不要指定显式类型参数。那些带有无法推断的类型参数的签名将在 v8 中删除。
 *
 */
export function fromEvent<T>(target: NodeStyleEventEmitter | ArrayLike<NodeStyleEventEmitter>, eventName: string): Observable<T>;
export function fromEvent<R>(
  target: NodeStyleEventEmitter | ArrayLike<NodeStyleEventEmitter>,
  eventName: string,
  resultSelector: (...args: any[]) => R
): Observable<R>;

export function fromEvent(
  target: NodeCompatibleEventEmitter | ArrayLike<NodeCompatibleEventEmitter>,
  eventName: string
): Observable<unknown>;
/**
 * @deprecated Do not specify explicit type parameters. Signatures with type parameters that cannot be inferred will be removed in v8.
 *
 * 不要指定显式类型参数。那些带有无法推断的类型参数的签名将在 v8 中删除。
 *
 */
export function fromEvent<T>(target: NodeCompatibleEventEmitter | ArrayLike<NodeCompatibleEventEmitter>, eventName: string): Observable<T>;
export function fromEvent<R>(
  target: NodeCompatibleEventEmitter | ArrayLike<NodeCompatibleEventEmitter>,
  eventName: string,
  resultSelector: (...args: any[]) => R
): Observable<R>;

export function fromEvent<T>(
  target: JQueryStyleEventEmitter<any, T> | ArrayLike<JQueryStyleEventEmitter<any, T>>,
  eventName: string
): Observable<T>;
export function fromEvent<T, R>(
  target: JQueryStyleEventEmitter<any, T> | ArrayLike<JQueryStyleEventEmitter<any, T>>,
  eventName: string,
  resultSelector: (value: T, ...args: any[]) => R
): Observable<R>;

/**
 * Creates an Observable that emits events of a specific type coming from the
 * given event target.
 *
 * 创建一个 Observable，它会发出来自给定事件目标的特定类型的事件。
 *
 * <span class="informal">Creates an Observable from DOM events, or Node.js
 * EventEmitter events or others.</span>
 *
 * <span class="informal">从 DOM 事件或 Node.js EventEmitter 事件或其它事件创建一个 Observable。</span>
 *
 * ![](fromEvent.png)
 *
 * `fromEvent` accepts as a first argument event target, which is an object with methods
 * for registering event handler functions. As a second argument it takes string that indicates
 * type of event we want to listen for. `fromEvent` supports selected types of event targets,
 * which are described in detail below. If your event target does not match any of the ones listed,
 * you should use {@link fromEventPattern}, which can be used on arbitrary APIs.
 * When it comes to APIs supported by `fromEvent`, their methods for adding and removing event
 * handler functions have different names, but they all accept a string describing event type
 * and function itself, which will be called whenever said event happens.
 *
 * `fromEvent` 的第一个参数是要从中接收事件的目标，它是一个对象，具有一个能用来注册事件处理器的方法。第二个参数是一个字符串，用来指出我们要监听的事件类型。`fromEvent` 支持一些选定类型的事件目标，稍后将详细介绍。如果你的事件目标与下面列出的任何目标都不匹配，则应该使用可用于任意 API 的 {@link fromEventPattern}。对于 `fromEvent` 支持的 API，它们用于添加和删除事件处理函数的方法有不同的名称，但它们都能接受用于描述事件类型的字符串和一个函数，每当这类事件发生时都会调用该函数。
 *
 * Every time resulting Observable is subscribed, event handler function will be registered
 * to event target on given event type. When that event fires, value
 * passed as a first argument to registered function will be emitted by output Observable.
 * When Observable is unsubscribed, function will be unregistered from event target.
 *
 * 每当订阅所生成的 Observable 时，事件处理函数都会注册到给定事件类型的事件目标。当该事件触发时，作为第一个参数传给注册函数的那个值将由输出 Observable 发出。当 Observable 被退订时，该函数将从事件目标中取消注册。
 *
 * Note that if event target calls registered function with more than one argument, second
 * and following arguments will not appear in resulting stream. In order to get access to them,
 * you can pass to `fromEvent` optional project function, which will be called with all arguments
 * passed to event handler. Output Observable will then emit value returned by project function,
 * instead of the usual value.
 *
 * 请注意，如果事件目标调用的是具有多个参数的已注册函数，则第二个和后续参数将不会出现在结果流中。为了访问它们，你可以给 `fromEvent` 传一个可选的投影函数，该函数将使用传给事件处理器的所有参数进行调用。然后，输出 Observable 将发出此投影函数返回的值，而不是通常的值。
 *
 * Remember that event targets listed below are checked via duck typing. It means that
 * no matter what kind of object you have and no matter what environment you work in,
 * you can safely use `fromEvent` on that object if it exposes described methods (provided
 * of course they behave as was described above). So for example if Node.js library exposes
 * event target which has the same method names as DOM EventTarget, `fromEvent` is still
 * a good choice.
 *
 * 请记住，下面列出的事件目标都是通过鸭子类型进行检查的。这意味着无论你拥有什么样的对象，也无论你在什么环境中工作，只要它公开了如前所述的方法（当然前提是它们的行为也如前所述），你都可以安全地在该对象上使用 `fromEvent`。因此，如果 Node.js 库公开了与 DOM EventTarget 具有相同方法名称的事件目标，`fromEvent` 仍然是一个不错的选择。
 *
 * If the API you use is more callback then event handler oriented (subscribed
 * callback function fires only once and thus there is no need to manually
 * unregister it), you should use {@link bindCallback} or {@link bindNodeCallback}
 * instead.
 *
 * 如果你使用的 API 更像回调，而非事件处理器（已订阅的回调函数只会触发一次，因此无需手动取消注册它），你应该改用 {@link bindCallback} 或 {@link bindNodeCallback}。
 *
 * `fromEvent` supports following types of event targets:
 *
 * `fromEvent` 支持以下类型的事件目标：
 *
 * **DOM EventTarget**
 *
 * This is an object with `addEventListener` and `removeEventListener` methods.
 *
 * 这是一个带有 `addEventListener` 和 `removeEventListener` 方法的对象。
 *
 * In the browser, `addEventListener` accepts - apart from event type string and event
 * handler function arguments - optional third parameter, which is either an object or boolean,
 * both used for additional configuration how and when passed function will be called. When
 * `fromEvent` is used with event target of that type, you can provide this values
 * as third parameter as well.
 *
 * 在浏览器中，`addEventListener` 接受除了事件类型字符串和事件处理函数参数之外的第三个可选参数，它是一个对象或布尔值，都用于额外配置如何以及何时调用传入的函数。当 `fromEvent` 与该类型的事件目标一起使用时，你也可以将此值作为第三个参数来提供。
 *
 * **Node.js EventEmitter**
 *
 * An object with `addListener` and `removeListener` methods.
 *
 * 具有 `addListener` 和 `removeListener` 方法的对象。
 *
 * **JQuery-style event target**
 *
 * **jQuery 风格的事件目标**
 *
 * An object with `on` and `off` methods
 *
 * 具有 `on` 和 `off` 方法的对象
 *
 * **DOM NodeList**
 *
 * List of DOM Nodes, returned for example by `document.querySelectorAll` or `Node.childNodes`.
 *
 * DOM 节点的列表，例如由 `document.querySelectorAll` 或 `Node.childNodes`。
 *
 * Although this collection is not event target in itself, `fromEvent` will iterate over all Nodes
 * it contains and install event handler function in every of them. When returned Observable
 * is unsubscribed, function will be removed from all Nodes.
 *
 * 虽然这个集合本身不是事件目标，但 `fromEvent` 将遍历它包含的所有节点并在每个节点中安装事件处理函数。当返回的 Observable 被退订时，函数将从所有节点中移除。
 *
 * **DOM HtmlCollection**
 *
 * Just as in case of NodeList it is a collection of DOM nodes. Here as well event handler function is
 * installed and removed in each of elements.
 *
 * 就像 NodeList 一样，它是 DOM 节点的集合。在这里，事件处理函数也会在每个元素中安装和删除。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Emit clicks happening on the DOM document
 *
 * 发出在 DOM 文档上发生的点击
 *
 * ```ts
 * import { fromEvent } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * clicks.subscribe(x => console.log(x));
 *
 * // Results in:
 * // MouseEvent object logged to console every time a click
 * // occurs on the document.
 * ```
 *
 * Use `addEventListener` with capture option
 *
 * 使用带有捕获选项的 `addEventListener`
 *
 * ```ts
 * import { fromEvent } from 'rxjs';
 *
 * const clicksInDocument = fromEvent(document, 'click', true); // note optional configuration parameter
 *                                                              // which will be passed to addEventListener
 * const clicksInDiv = fromEvent(someDivInDocument, 'click');
 *
 * clicksInDocument.subscribe(() => console.log('document'));
 * clicksInDiv.subscribe(() => console.log('div'));
 *
 * // By default events bubble UP in DOM tree, so normally
 * // when we would click on div in document
 * // "div" would be logged first and then "document".
 * // Since we specified optional `capture` option, document
 * // will catch event when it goes DOWN DOM tree, so console
 * // will log "document" and then "div".
 * ```
 * @see {@link bindCallback}
 * @see {@link bindNodeCallback}
 * @see {@link fromEventPattern}
 * @param {FromEventTarget<T>} target The DOM EventTarget, Node.js
 * EventEmitter, JQuery-like event target, NodeList or HTMLCollection to attach the event handler to.
 *
 * 要附加事件处理器的 DOM EventTarget、Node.js EventEmitter、类似 JQuery 的事件目标、NodeList 或 HTMLCollection。
 *
 * @param {string} eventName The event name of interest, being emitted by the
 * `target`.
 *
 * 由 `target` 发出的感兴趣的事件名称。
 *
 * @param {EventListenerOptions} [options] Options to pass through to addEventListener
 *
 * 要传给 addEventListener 的选项
 *
 * @return {Observable<T>}
 */
export function fromEvent<T>(
  target: any,
  eventName: string,
  options?: EventListenerOptions | ((...args: any[]) => T),
  resultSelector?: (...args: any[]) => T
): Observable<T> {
  if (isFunction(options)) {
    resultSelector = options;
    options = undefined;
  }
  if (resultSelector) {
    return fromEvent<T>(target, eventName, options as EventListenerOptions).pipe(mapOneOrManyArgs(resultSelector));
  }

  // Figure out our add and remove methods. In order to do this,
  // we are going to analyze the target in a preferred order, if
  // the target matches a given signature, we take the two "add" and "remove"
  // method names and apply them to a map to create opposite versions of the
  // same function. This is because they all operate in duplicate pairs,
  // `addListener(name, handler)`, `removeListener(name, handler)`, for example.
  // The call only differs by method name, as to whether or not you're adding or removing.
  const [add, remove] =
    // If it is an EventTarget, we need to use a slightly different method than the other two patterns.
    isEventTarget(target)
      ? eventTargetMethods.map((methodName) => (handler: any) => target[methodName](eventName, handler, options as EventListenerOptions))
      : // In all other cases, the call pattern is identical with the exception of the method names.
      isNodeStyleEventEmitter(target)
      ? nodeEventEmitterMethods.map(toCommonHandlerRegistry(target, eventName))
      : isJQueryStyleEventEmitter(target)
      ? jqueryMethods.map(toCommonHandlerRegistry(target, eventName))
      : [];

  // If add is falsy, it's because we didn't match a pattern above.
  // Check to see if it is an ArrayLike, because if it is, we want to
  // try to apply fromEvent to all of it's items. We do this check last,
  // because there are may be some types that are both ArrayLike *and* implement
  // event registry points, and we'd rather delegate to that when possible.
  if (!add) {
    if (isArrayLike(target)) {
      return mergeMap((subTarget: any) => fromEvent(subTarget, eventName, options as EventListenerOptions))(
        innerFrom(target)
      ) as Observable<T>;
    }
  }

  // If add is falsy and we made it here, it's because we didn't
  // match any valid target objects above.
  if (!add) {
    throw new TypeError('Invalid event target');
  }

  return new Observable<T>((subscriber) => {
    // The handler we are going to register. Forwards the event object, by itself, or
    // an array of arguments to the event handler, if there is more than one argument,
    // to the consumer.
    const handler = (...args: any[]) => subscriber.next(1 < args.length ? args : args[0]);
    // Do the work of adding the handler to the target.
    add(handler);
    // When we finalize, we want to remove the handler and free up memory.
    return () => remove!(handler);
  });
}

/**
 * Used to create `add` and `remove` functions to register and unregister event handlers
 * from a target in the most common handler pattern, where there are only two arguments.
 * (e.g.  `on(name, fn)`, `off(name, fn)`, `addListener(name, fn)`, or `removeListener(name, fn)`)
 *
 * 用于创建 `add` 和 `remove` 函数，以便在最常见的处理器模式中向目标注册和取消注册事件处理器，它只有两个参数。（例如 `on(name, fn)`、`off(name, fn)`、`addListener(name, fn)` 或 `removeListener(name, fn)`）
 *
 * @param target The target we're calling methods on
 *
 * 我们要调用这些方法的目标
 *
 * @param eventName The event name for the event we're creating register or unregister functions for
 *
 * 我们要为其创建注册或取消注册函数的事件的名称
 *
 */
function toCommonHandlerRegistry(target: any, eventName: string) {
  return (methodName: string) => (handler: any) => target[methodName](eventName, handler);
}

/**
 * Checks to see if the target implements the required node-style EventEmitter methods
 * for adding and removing event handlers.
 *
 * 检查目标是否实现了添加和删除事件处理器所需的 Node 风格的 EventEmitter 方法。
 *
 * @param target the object to check
 *
 * 要检查的对象
 *
 */
function isNodeStyleEventEmitter(target: any): target is NodeStyleEventEmitter {
  return isFunction(target.addListener) && isFunction(target.removeListener);
}

/**
 * Checks to see if the target implements the required jQuery-style EventEmitter methods
 * for adding and removing event handlers.
 *
 * 检查目标是否实现了添加和删除事件处理器所需的 jQuery 风格的 EventEmitter 方法。
 *
 * @param target the object to check
 *
 * 要检查的对象
 *
 */
function isJQueryStyleEventEmitter(target: any): target is JQueryStyleEventEmitter<any, any> {
  return isFunction(target.on) && isFunction(target.off);
}

/**
 * Checks to see if the target implements the required EventTarget methods
 * for adding and removing event handlers.
 *
 * 检查目标是否实现了添加和删除事件处理器所需的 EventTarget 方法。
 *
 * @param target the object to check
 *
 * 要检查的对象
 *
 */
function isEventTarget(target: any): target is HasEventTargetAddRemove<any> {
  return isFunction(target.addEventListener) && isFunction(target.removeEventListener);
}
