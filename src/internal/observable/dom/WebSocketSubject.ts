import { Subject, AnonymousSubject } from '../../Subject';
import { Subscriber } from '../../Subscriber';
import { Observable } from '../../Observable';
import { Subscription } from '../../Subscription';
import { Operator } from '../../Operator';
import { ReplaySubject } from '../../ReplaySubject';
import { Observer, NextObserver } from '../../types';

/**
 * WebSocketSubjectConfig is a plain Object that allows us to make our
 * webSocket configurable.
 *
 * WebSocketSubjectConfig 是一个普通的对象，它允许我们使我们的 webSocket 可配置。
 *
 * <span class="informal">Provides flexibility to {@link webSocket}</span>
*
 * <span class="informal">为 {@link webSocket} 提供灵活性</span>
 *
 * It defines a set of properties to provide custom behavior in specific
 * moments of the socket's lifecycle. When the connection opens we can
 * use `openObserver`, when the connection is closed `closeObserver`, if we
 * are interested in listening for data coming from server: `deserializer`,
 * which allows us to customize the deserialization strategy of data before passing it
 * to the socket client. By default, `deserializer` is going to apply `JSON.parse` to each message coming
 * from the Server.
 *
 * 它定义了一组属性以在套接字生命周期的特定时刻提供自定义行为。当连接打开时我们可以使用 `openObserver` ，当连接关闭时 `closeObserver` ，如果我们有兴趣监听来自服务器的数据： `deserializer` ，它允许我们在将数据传递给套接字客户端之前自定义数据的反序列化策略。默认情况下， `deserializer` 化器 `JSON.parse` 应用于来自服务器的每条消息。
 *
 * ## Examples
 *
 * ## 例子
 *
 * **deserializer**, the default for this property is `JSON.parse` but since there are just two options
 * for incoming data, either be text or binarydata. We can apply a custom deserialization strategy
 * or just simply skip the default behaviour.
 *
 * **deserializer** ，此属性的默认值为 `JSON.parse` 但由于传入数据只有两个选项，文本或二进制数据。我们可以应用自定义反序列化策略，或者只是跳过默认行为。
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   //Apply any transformation of your choice.
 *   deserializer: ({ data }) => data
 * });
 *
 * wsSubject.subscribe(console.log);
 *
 * // Let's suppose we have this on the Server: ws.send('This is a msg from the server')
 * //output
 * //
 * // This is a msg from the server
 * ```
 *
 * **serializer** allows us to apply custom serialization strategy but for the outgoing messages.
 *
 * **序列化**程序允许我们应用自定义序列化策略，但用于传出消息。
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   // Apply any transformation of your choice.
 *   serializer: msg => JSON.stringify({ channel: 'webDevelopment', msg: msg })
 * });
 *
 * wsSubject.subscribe(() => subject.next('msg to the server'));
 *
 * // Let's suppose we have this on the Server:
 * //   ws.on('message', msg => console.log);
 * //   ws.send('This is a msg from the server');
 * // output at server side:
 * //
 * // {"channel":"webDevelopment","msg":"msg to the server"}
 * ```
 *
 * **closeObserver** allows us to set a custom error when an error raises up.
 *
 * **closeObserver**允许我们在出现错误时设置自定义错误。
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   closeObserver: {
 *     next() {
 *       const customError = { code: 6666, reason: 'Custom evil reason' }
 *       console.log(`code: ${ customError.code }, reason: ${ customError.reason }`);
 *     }
 *   }
 * });
 *
 * // output
 * // code: 6666, reason: Custom evil reason
 * ```
 *
 * **openObserver**, Let's say we need to make some kind of init task before sending/receiving msgs to the
 * webSocket or sending notification that the connection was successful, this is when
 * openObserver is useful for.
 *
 * **openObserver** ，假设我们需要在向 webSocket 发送/接收 msgs 或发送连接成功的通知之前进行某种初始化任务，这就是 openObserver 有用的时候。
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   openObserver: {
 *     next: () => {
 *       console.log('Connection ok');
 *     }
 *   }
 * });
 *
 * // output
 * // Connection ok
 * ```
 */
export interface WebSocketSubjectConfig<T> {
  /**
   * The url of the socket server to connect to
   *
   * 要连接的套接字服务器的 url
   *
   */
  url: string;
  /**
   * The protocol to use to connect
   *
   * 用于连接的协议
   *
   */
  protocol?: string | Array<string>;
  /**
   * @deprecated Will be removed in v8. Use {@link deserializer} instead.
   *
   * 将在 v8 中删除。请改用 {@link 反序列化器}。
   *
   */
  resultSelector?: (e: MessageEvent) => T;
  /**
   * A serializer used to create messages from passed values before the
   * messages are sent to the server. Defaults to JSON.stringify.
   *
   * 用于在将消息发送到服务器之前从传递的值创建消息的序列化程序。默认为 JSON.stringify。
   *
   */
  serializer?: (value: T) => WebSocketMessage;
  /**
   * A deserializer used for messages arriving on the socket from the
   * server. Defaults to JSON.parse.
   *
   * 用于从服务器到达套接字的消息的反序列化器。默认为 JSON.parse。
   *
   */
  deserializer?: (e: MessageEvent) => T;
  /**
   * An Observer that watches when open events occur on the underlying web socket.
   *
   * 一个观察者，当打开事件发生在底层网络套接字上时进行观察。
   *
   */
  openObserver?: NextObserver<Event>;
  /**
   * An Observer that watches when close events occur on the underlying web socket
   *
   * 一个观察者在关闭事件发生在底层网络套接字上时进行观察
   *
   */
  closeObserver?: NextObserver<CloseEvent>;
  /**
   * An Observer that watches when a close is about to occur due to
   * unsubscription.
   *
   * 一个观察者，当由于取消订阅而即将发生关闭时进行观察。
   *
   */
  closingObserver?: NextObserver<void>;
  /**
   * A WebSocket constructor to use. This is useful for situations like using a
   * WebSocket impl in Node (WebSocket is a DOM API), or for mocking a WebSocket
   * for testing purposes
   *
   * 要使用的 WebSocket 构造函数。这对于在 Node 中使用 WebSocket 实现（WebSocket 是一种 DOM API）或模拟 WebSocket 以进行测试等情况很有用
   *
   */
  WebSocketCtor?: { new (url: string, protocols?: string | string[]): WebSocket };
  /**
   * Sets the `binaryType` property of the underlying WebSocket.
   *
   * 设置底层 WebSocket 的 `binaryType` 属性。
   *
   */
  binaryType?: 'blob' | 'arraybuffer';
}

const DEFAULT_WEBSOCKET_CONFIG: WebSocketSubjectConfig<any> = {
  url: '',
  deserializer: (e: MessageEvent) => JSON.parse(e.data),
  serializer: (value: any) => JSON.stringify(value),
};

const WEBSOCKETSUBJECT_INVALID_ERROR_OBJECT =
  'WebSocketSubject.error must be called with an object with an error code, and an optional reason: { code: number, reason: string }';

export type WebSocketMessage = string | ArrayBuffer | Blob | ArrayBufferView;

export class WebSocketSubject<T> extends AnonymousSubject<T> {
  // @ts-ignore: Property has no initializer and is not definitely assigned
  private _config: WebSocketSubjectConfig<T>;

  /** @internal */
  // @ts-ignore: Property has no initializer and is not definitely assigned
  _output: Subject<T>;

  private _socket: WebSocket | null = null;

  constructor(urlConfigOrSource: string | WebSocketSubjectConfig<T> | Observable<T>, destination?: Observer<T>) {
    super();
    if (urlConfigOrSource instanceof Observable) {
      this.destination = destination;
      this.source = urlConfigOrSource as Observable<T>;
    } else {
      const config = (this._config = { ...DEFAULT_WEBSOCKET_CONFIG });
      this._output = new Subject<T>();
      if (typeof urlConfigOrSource === 'string') {
        config.url = urlConfigOrSource;
      } else {
        for (const key in urlConfigOrSource) {
          if (urlConfigOrSource.hasOwnProperty(key)) {
            (config as any)[key] = (urlConfigOrSource as any)[key];
          }
        }
      }

      if (!config.WebSocketCtor && WebSocket) {
        config.WebSocketCtor = WebSocket;
      } else if (!config.WebSocketCtor) {
        throw new Error('no WebSocket constructor can be found');
      }
      this.destination = new ReplaySubject();
    }
  }

  /**
   * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
   *
   * 内部实现细节，请勿直接使用。将在 v8 中内部化。
   *
   */
  lift<R>(operator: Operator<T, R>): WebSocketSubject<R> {
    const sock = new WebSocketSubject<R>(this._config as WebSocketSubjectConfig<any>, this.destination as any);
    sock.operator = operator;
    sock.source = this;
    return sock;
  }

  private _resetState() {
    this._socket = null;
    if (!this.source) {
      this.destination = new ReplaySubject();
    }
    this._output = new Subject<T>();
  }

  /**
   * Creates an {@link Observable}, that when subscribed to, sends a message,
   * defined by the `subMsg` function, to the server over the socket to begin a
   * subscription to data over that socket. Once data arrives, the
   * `messageFilter` argument will be used to select the appropriate data for
   * the resulting Observable. When teardown occurs, either due to
   * unsubscription, completion, or error, a message defined by the `unsubMsg`
   * argument will be sent to the server over the WebSocketSubject.
   *
   * 创建一个 {@link Observable}，当订阅它时，通过套接字向服务器发送一条由 `subMsg` 函数定义的消息，以开始通过该套接字订阅数据。一旦数据到达， `messageFilter` 参数将用于为生成的 Observable 选择适当的数据。当由于取消订阅、完成或错误而发生拆卸时，由 `unsubMsg` 参数定义的消息将通过 WebSocketSubject 发送到服务器。
   *
   * @param subMsg A function to generate the subscription message to be sent to
   * the server. This will still be processed by the serializer in the
   * WebSocketSubject's config. (Which defaults to JSON serialization)
   *
   * 生成要发送到服务器的订阅消息的函数。这仍将由 WebSocketSubject 配置中的序列化程序处理。 （默认为 JSON 序列化）
   *
   * @param unsubMsg A function to generate the unsubscription message to be
   * sent to the server at teardown. This will still be processed by the
   * serializer in the WebSocketSubject's config.
   *
   * 生成取消订阅消息以在拆卸时发送到服务器的函数。这仍将由 WebSocketSubject 配置中的序列化程序处理。
   *
   * @param messageFilter A predicate for selecting the appropriate messages
   * from the server for the output stream.
   *
   * 用于从服务器为输出流选择适当消息的谓词。
   *
   */
  multiplex(subMsg: () => any, unsubMsg: () => any, messageFilter: (value: T) => boolean) {
    const self = this;
    return new Observable((observer: Observer<T>) => {
      try {
        self.next(subMsg());
      } catch (err) {
        observer.error(err);
      }

      const subscription = self.subscribe(
        (x) => {
          try {
            if (messageFilter(x)) {
              observer.next(x);
            }
          } catch (err) {
            observer.error(err);
          }
        },
        (err) => observer.error(err),
        () => observer.complete()
      );

      return () => {
        try {
          self.next(unsubMsg());
        } catch (err) {
          observer.error(err);
        }
        subscription.unsubscribe();
      };
    });
  }

  private _connectSocket() {
    const { WebSocketCtor, protocol, url, binaryType } = this._config;
    const observer = this._output;

    let socket: WebSocket | null = null;
    try {
      socket = protocol ? new WebSocketCtor!(url, protocol) : new WebSocketCtor!(url);
      this._socket = socket;
      if (binaryType) {
        this._socket.binaryType = binaryType;
      }
    } catch (e) {
      observer.error(e);
      return;
    }

    const subscription = new Subscription(() => {
      this._socket = null;
      if (socket && socket.readyState === 1) {
        socket.close();
      }
    });

    socket.onopen = (evt: Event) => {
      const { _socket } = this;
      if (!_socket) {
        socket!.close();
        this._resetState();
        return;
      }
      const { openObserver } = this._config;
      if (openObserver) {
        openObserver.next(evt);
      }

      const queue = this.destination;

      this.destination = Subscriber.create<T>(
        (x) => {
          if (socket!.readyState === 1) {
            try {
              const { serializer } = this._config;
              socket!.send(serializer!(x!));
            } catch (e) {
              this.destination!.error(e);
            }
          }
        },
        (err) => {
          const { closingObserver } = this._config;
          if (closingObserver) {
            closingObserver.next(undefined);
          }
          if (err && err.code) {
            socket!.close(err.code, err.reason);
          } else {
            observer.error(new TypeError(WEBSOCKETSUBJECT_INVALID_ERROR_OBJECT));
          }
          this._resetState();
        },
        () => {
          const { closingObserver } = this._config;
          if (closingObserver) {
            closingObserver.next(undefined);
          }
          socket!.close();
          this._resetState();
        }
      ) as Subscriber<any>;

      if (queue && queue instanceof ReplaySubject) {
        subscription.add((queue as ReplaySubject<T>).subscribe(this.destination));
      }
    };

    socket.onerror = (e: Event) => {
      this._resetState();
      observer.error(e);
    };

    socket.onclose = (e: CloseEvent) => {
      if (socket === this._socket) {
        this._resetState();
      }
      const { closeObserver } = this._config;
      if (closeObserver) {
        closeObserver.next(e);
      }
      if (e.wasClean) {
        observer.complete();
      } else {
        observer.error(e);
      }
    };

    socket.onmessage = (e: MessageEvent) => {
      try {
        const { deserializer } = this._config;
        observer.next(deserializer!(e));
      } catch (err) {
        observer.error(err);
      }
    };
  }

  /** @internal */
  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    const { source } = this;
    if (source) {
      return source.subscribe(subscriber);
    }
    if (!this._socket) {
      this._connectSocket();
    }
    this._output.subscribe(subscriber);
    subscriber.add(() => {
      const { _socket } = this;
      if (this._output.observers.length === 0) {
        if (_socket && (_socket.readyState === 1 || _socket.readyState === 0)) {
          _socket.close();
        }
        this._resetState();
      }
    });
    return subscriber;
  }

  unsubscribe() {
    const { _socket } = this;
    if (_socket && (_socket.readyState === 1 || _socket.readyState === 0)) {
      _socket.close();
    }
    this._resetState();
    super.unsubscribe();
  }
}
