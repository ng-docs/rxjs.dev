import { Connectable, ObservableInput, SubjectLike } from '../types';
import { Subject } from '../Subject';
import { Subscription } from '../Subscription';
import { Observable } from '../Observable';
import { defer } from './defer';

export interface ConnectableConfig<T> {
  /**
   * A factory function used to create the Subject through which the source
   * is multicast. By default this creates a {@link Subject}.
   *
   * 一个工厂函数，用于创建通过其源进行多播的主题。默认情况下，这会创建一个 {@link Subject}。
   *
   */
  connector: () => SubjectLike<T>;
  /**
   * If true, the resulting observable will reset internal state upon disconnetion
   * and return to a "cold" state. This allows the resulting observable to be
   * reconnected.
   * If false, upon disconnection, the connecting subject will remain the
   * connecting subject, meaning the resulting observable will not go "cold" again,
   * and subsequent repeats or resubscriptions will resubscribe to that same subject.
   *
   * 如果为真，则结果 observable 将在断开连接时重置内部状态并返回“冷”状态。这允许重新连接生成的 observable。如果为 false，则在断开连接时，连接主体将保持连接主体，这意味着生成的 observable 不会再次“冷”，随后的重复或重新订阅将重新订阅同一主题。
   *
   */
  resetOnDisconnect?: boolean;
}

/**
 * The default configuration for `connectable`.
 *
 * `connectable` 的默认配置。
 *
 */
const DEFAULT_CONFIG: ConnectableConfig<unknown> = {
  connector: () => new Subject<unknown>(),
  resetOnDisconnect: true,
};

/**
 * Creates an observable that multicasts once `connect()` is called on it.
 *
 * 创建一个在其上调用 `connect()` 后进行多播的 observable。
 *
 * @param source The observable source to make connectable.
 *
 * 使可连接的可观察源。
 *
 * @param config The configuration object for `connectable`.
 *
 * `connectable` 的配置对象。
 *
 * @returns A "connectable" observable, that has a `connect()` method, that you must call to
 * connect the source to all consumers through the subject provided as the connector.
 *
 * 具有 `connect()` 方法的“可连接”可观察者，你必须调用该方法以通过作为连接器提供的主题将源连接到所有消费者。
 *
 */
export function connectable<T>(source: ObservableInput<T>, config: ConnectableConfig<T> = DEFAULT_CONFIG): Connectable<T> {
  // The subscription representing the connection.
  let connection: Subscription | null = null;
  const { connector, resetOnDisconnect = true } = config;
  let subject = connector();

  const result: any = new Observable<T>((subscriber) => {
    return subject.subscribe(subscriber);
  });

  // Define the `connect` function. This is what users must call
  // in order to "connect" the source to the subject that is
  // multicasting it.
  result.connect = () => {
    if (!connection || connection.closed) {
      connection = defer(() => source).subscribe(subject);
      if (resetOnDisconnect) {
        connection.add(() => (subject = connector()));
      }
    }
    return connection;
  };

  return result;
}
