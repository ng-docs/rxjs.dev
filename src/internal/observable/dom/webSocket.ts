import { WebSocketSubject, WebSocketSubjectConfig } from './WebSocketSubject';

/**
 * Wrapper around the w3c-compatible WebSocket object provided by the browser.
 *
 * 围绕浏览器提供的与 w3c 兼容的 WebSocket 对象进行包装。
 *
 * <span class="informal">{@link Subject} that communicates with a server via WebSocket</span>
*
 * <span class="informal">{@link Subject} 通过 WebSocket 与服务器通信</span>
 *
 * `webSocket` is a factory function that produces a `WebSocketSubject`,
 * which can be used to make WebSocket connection with an arbitrary endpoint.
 * `webSocket` accepts as an argument either a string with url of WebSocket endpoint, or an
 * {@link WebSocketSubjectConfig} object for providing additional configuration, as
 * well as Observers for tracking lifecycle of WebSocket connection.
 *
 * `webSocket` 是一个生成 `WebSocketSubject` 的工厂函数，可用于与任意端点建立 WebSocket 连接。`webSocket` 接受带有 WebSocket 端点 url 的字符串或 {@link WebSocketSubjectConfig} 对象作为参数，用于提供额外的配置，以及用于跟踪 WebSocket 连接生命周期的观察者。
 *
 * When `WebSocketSubject` is subscribed, it attempts to make a socket connection,
 * unless there is one made already. This means that many subscribers will always listen
 * on the same socket, thus saving resources. If however, two instances are made of `WebSocketSubject`,
 * even if these two were provided with the same url, they will attempt to make separate
 * connections. When consumer of a `WebSocketSubject` unsubscribes, socket connection is closed,
 * only if there are no more subscribers still listening. If after some time a consumer starts
 * subscribing again, connection is reestablished.
 *
 * 当 `WebSocketSubject` 被订阅时，它会尝试建立一个套接字连接，除非已经建立了一个。这意味着许多订阅者将始终在同一个套接字上侦听，从而节省资源。但是，如果两个实例由 `WebSocketSubject` 组成，即使这两个实例提供了相同的 url，它们也会尝试建立单独的连接。当 `WebSocketSubject` 的消费者取消订阅时，只有在没有更多订阅者仍在监听的情况下，才会关闭套接字连接。如果一段时间后消费者再次开始订阅，则重新建立连接。
 *
 * Once connection is made, whenever a new message comes from the server, `WebSocketSubject` will emit that
 * message as a value in the stream. By default, a message from the socket is parsed via `JSON.parse`. If you
 * want to customize how deserialization is handled (if at all), you can provide custom `resultSelector`
 * function in {@link WebSocketSubject}. When connection closes, stream will complete, provided it happened without
 * any errors. If at any point (starting, maintaining or closing a connection) there is an error,
 * stream will also error with whatever WebSocket API has thrown.
 *
 * 一旦建立连接，每当有新消息来自服务器时，`WebSocketSubject` 都会将该消息作为流中的值发出。默认情况下，来自套接字的消息通过 `JSON.parse` 解析。如果你想自定义如何处理反序列化（如果有的话），你可以在 {@link WebSocketSubject} 中提供自定义 `resultSelector` 函数。当连接关闭时，流将完成，前提是它没有任何错误发生。如果在任何时候（启动、维护或关闭连接）出现错误，无论 WebSocket API 抛出什么，流都会出错。
 *
 * By virtue of being a {@link Subject}, `WebSocketSubject` allows for receiving and sending messages from the server. In order
 * to communicate with a connected endpoint, use `next`, `error` and `complete` methods. `next` sends a value to the server, so bear in mind
 * that this value will not be serialized beforehand. Because of This, `JSON.stringify` will have to be called on a value by hand,
 * before calling `next` with a result. Note also that if at the moment of nexting value
 * there is no socket connection (for example no one is subscribing), those values will be buffered, and sent when connection
 * is finally established. `complete` method closes socket connection. `error` does the same,
 * as well as notifying the server that something went wrong via status code and string with details of what happened.
 * Since status code is required in WebSocket API, `WebSocketSubject` does not allow, like regular `Subject`,
 * arbitrary values being passed to the `error` method. It needs to be called with an object that has `code`
 * property with status code number and optional `reason` property with string describing details
 * of an error.
 *
 * 由于是 {@link Subject}，`WebSocketSubject` 允许从服务器接收和发送消息。为了与连接的端点通信，请使用 `next`、`error` 和 `complete` 方法。`next` 向服务器发送一个值，因此请记住，该值不会事先序列化。因此，在使用结果调用 `next` 之前，必须手动调用 `JSON.stringify` 值。另请注意，如果在下一个值的时刻没有套接字连接（例如没有人订阅），则这些值将被缓冲，并在最终建立连接时发送。`complete` 方法关闭套接字连接。`error` 也是如此，并通过状态代码和字符串通知服务器出现问题，并提供详细信息。由于 WebSocket API 中需要状态码，因此 `WebSocketSubject` 不允许像常规 `Subject` 一样，将任意值传递给 `error` 方法。需要使用具有带有状态代码编号的 `code` 属性和带有描述错误详细信息的字符串的可选 `reason` 属性的对象来调用它。
 *
 * Calling `next` does not affect subscribers of `WebSocketSubject` - they have no
 * information that something was sent to the server (unless of course the server
 * responds somehow to a message). On the other hand, since calling `complete` triggers
 * an attempt to close socket connection. If that connection is closed without any errors, stream will
 * complete, thus notifying all subscribers. And since calling `error` closes
 * socket connection as well, just with a different status code for the server, if closing itself proceeds
 * without errors, subscribed Observable will not error, as one might expect, but complete as usual. In both cases
 * (calling `complete` or `error`), if process of closing socket connection results in some errors, *then* stream
 * will error.
 *
 * 调用 `next` 不会影响 `WebSocketSubject` 的订阅者 - 他们没有任何信息表明某些内容已发送到服务器（当然，除非服务器以某种方式响应消息）。另一方面，由于调用 `complete` 会触发关闭套接字连接的尝试。如果该连接在没有任何错误的情况下关闭，则流将完成，从而通知所有订阅者。而且由于调用 `error` 也会关闭套接字连接，只是服务器的状态码不同，如果关闭本身没有错误，订阅的 Observable 将不会出错，正如人们所期望的那样，但会像往常一样完成。在这两种情况下（调用 `complete` 或 `error`），如果关闭套接字连接的过程导致一些错误，*则*流将出错。
 *
 * **Multiplexing**
 *
 * **多路复用**
 *
 * `WebSocketSubject` has an additional operator, not found in other Subjects. It is called `multiplex` and it is
 * used to simulate opening several socket connections, while in reality maintaining only one.
 * For example, an application has both chat panel and real-time notifications about sport news. Since these are two distinct functions,
 * it would make sense to have two separate connections for each. Perhaps there could even be two separate services with WebSocket
 * endpoints, running on separate machines with only GUI combining them together. Having a socket connection
 * for each functionality could become too resource expensive. It is a common pattern to have single
 * WebSocket endpoint that acts as a gateway for the other services (in this case chat and sport news services).
 * Even though there is a single connection in a client app, having the ability to manipulate streams as if it
 * were two separate sockets is desirable. This eliminates manually registering and unregistering in a gateway for
 * given service and filter out messages of interest. This is exactly what `multiplex` method is for.
 *
 * `WebSocketSubject` 有一个额外的操作符，在其他 Subjects 中没有。它被称为 `multiplex`，它用于模拟打开多个套接字连接，而实际上只维护一个。例如，一个应用程序既有聊天面板，也有关于体育新闻的实时通知。由于这是两个不同的功能，因此为每个功能设置两个单独的连接是有意义的。也许甚至可以有两个带有 WebSocket 端点的单独服务，在单独的机器上运行，只有 GUI 将它们组合在一起。每个功能都有一个套接字连接可能会变得过于昂贵。将单个 WebSocket 端点用作其他服务（在本例中为聊天和体育新闻服务）的网关是一种常见模式。即使客户端应用程序中只有一个连接，也希望能够像处理两个单独的套接字一样操作流。这消除了在网关中手动注册和注销给定服务并过滤掉感兴趣的消息。这正是 `multiplex` 方法的用途。
 *
 * Method accepts three parameters. First two are functions returning subscription and unsubscription messages
 * respectively. These are messages that will be sent to the server, whenever consumer of resulting Observable
 * subscribes and unsubscribes. Server can use them to verify that some kind of messages should start or stop
 * being forwarded to the client. In case of the above example application, after getting subscription message with proper identifier,
 * gateway server can decide that it should connect to real sport news service and start forwarding messages from it.
 * Note that both messages will be sent as returned by the functions, they are by default serialized using JSON.stringify, just
 * as messages pushed via `next`. Also bear in mind that these messages will be sent on *every* subscription and
 * unsubscription. This is potentially dangerous, because one consumer of an Observable may unsubscribe and the server
 * might stop sending messages, since it got unsubscription message. This needs to be handled
 * on the server or using {@link publish} on a Observable returned from 'multiplex'.
 *
 * 方法接受三个参数。前两个是分别返回订阅和取消订阅消息的函数。每当结果 Observable 的消费者订阅和取消订阅时，这些消息都会发送到服务器。服务器可以使用它们来验证某种消息应该开始还是停止转发给客户端。在上面的示例应用程序中，在获得具有适当标识符的订阅消息后，网关服务器可以决定它应该连接到真实的体育新闻服务并开始从中转发消息。请注意，这两条消息都将作为函数返回的内容发送，默认情况下，它们使用 JSON.stringify 序列化，就像通过 `next` 推送的消息一样。另请记住，这些消息将在*每次*订阅和取消订阅时发送。这是潜在的危险，因为 Observable 的一个消费者可能会取消订阅，并且服务器可能会停止发送消息，因为它收到了取消订阅消息。这需要在服务器上处理，或者在从“multiplex”返回的 Observable 上使用 {@link publish}。
 *
 * Last argument to `multiplex` is a `messageFilter` function which should return a boolean. It is used to filter out messages
 * sent by the server to only those that belong to simulated WebSocket stream. For example, server might mark these
 * messages with some kind of string identifier on a message object and `messageFilter` would return `true`
 * if there is such identifier on an object emitted by the socket. Messages which returns `false` in `messageFilter` are simply skipped,
 * and are not passed down the stream.
 *
 * `multiplex` 的最后一个参数是一个 `messageFilter` 函数，它应该返回一个布尔值。它用于过滤服务器发送的消息，只发送给那些属于模拟 WebSocket 流的消息。例如，服务器可能会在消息对象上用某种字符串标识符标记这些消息，如果套接字发出的对象上有这样的标识符，则 `messageFilter` 将返回 `true`。在 `messageFilter` 中返回 `false` 的消息将被简单地跳过，并且不会沿流向下传递。
 *
 * Return value of `multiplex` is an Observable with messages incoming from emulated socket connection. Note that this
 * is not a `WebSocketSubject`, so calling `next` or `multiplex` again will fail. For pushing values to the
 * server, use root `WebSocketSubject`.
 *
 * `multiplex` 的返回值是一个 Observable，其中包含从模拟套接字连接传入的消息。请注意，这不是 `WebSocketSubject`，因此再次调用 `next` 或 `multiplex` 将失败。要将值推送到服务器，请使用 root `WebSocketSubject`。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Listening for messages from the server
 *
 * 监听来自服务器的消息
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const subject = webSocket('ws://localhost:8081');
 *
 * subject.subscribe({
 *   next: msg => console.log('message received: ' + msg), // Called whenever there is a message from the server.
 *   error: err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
 *   complete: () => console.log('complete') // Called when connection is closed (for whatever reason).
 *  });
 * ```
 *
 * Pushing messages to the server
 *
 * 向服务器推送消息
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const subject = webSocket('ws://localhost:8081');
 *
 * subject.subscribe();
 * // Note that at least one consumer has to subscribe to the created subject - otherwise "nexted" values will be just buffered and not sent,
 * // since no connection was established!
 *
 * subject.next({ message: 'some message' });
 * // This will send a message to the server once a connection is made. Remember value is serialized with JSON.stringify by default!
 *
 * subject.complete(); // Closes the connection.
 *
 * subject.error({ code: 4000, reason: 'I think our app just broke!' });
 * // Also closes the connection, but let's the server know that this closing is caused by some error.
 * ```
 *
 * Multiplexing WebSocket
 *
 * 多路复用 WebSocket
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const subject = webSocket('ws://localhost:8081');
 *
 * const observableA = subject.multiplex(
 *   () => ({ subscribe: 'A' }), // When server gets this message, it will start sending messages for 'A'...
 *   () => ({ unsubscribe: 'A' }), // ...and when gets this one, it will stop.
 *   message => message.type === 'A' // If the function returns `true` message is passed down the stream. Skipped if the function returns false.
 * );
 *
 * const observableB = subject.multiplex( // And the same goes for 'B'.
 *   () => ({ subscribe: 'B' }),
 *   () => ({ unsubscribe: 'B' }),
 *   message => message.type === 'B'
 * );
 *
 * const subA = observableA.subscribe(messageForA => console.log(messageForA));
 * // At this moment WebSocket connection is established. Server gets '{"subscribe": "A"}' message and starts sending messages for 'A',
 * // which we log here.
 *
 * const subB = observableB.subscribe(messageForB => console.log(messageForB));
 * // Since we already have a connection, we just send '{"subscribe": "B"}' message to the server. It starts sending messages for 'B',
 * // which we log here.
 *
 * subB.unsubscribe();
 * // Message '{"unsubscribe": "B"}' is sent to the server, which stops sending 'B' messages.
 *
 * subA.unsubscribe();
 * // Message '{"unsubscribe": "A"}' makes the server stop sending messages for 'A'. Since there is no more subscribers to root Subject,
 * // socket connection closes.
 * ```
 * @param {string|WebSocketSubjectConfig} urlConfigOrSource The WebSocket endpoint as an url or an object with
 * configuration and additional Observers.
 *
 * WebSocket 端点作为 url 或具有配置和其他观察者的对象。
 *
 * @return {WebSocketSubject} Subject which allows to both send and receive messages via WebSocket connection.
 *
 * 允许通过 WebSocket 连接发送和接收消息的主体。
 *
 */
export function webSocket<T>(urlConfigOrSource: string | WebSocketSubjectConfig<T>): WebSocketSubject<T> {
  return new WebSocketSubject<T>(urlConfigOrSource);
}
