import { Subject } from '../Subject';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { refCount as higherOrderRefCount } from '../operators/refCount';
import { OperatorSubscriber } from '../operators/OperatorSubscriber';
import { hasLift } from '../util/lift';

/**
 * @class ConnectableObservable<T>
 * @deprecated Will be removed in v8. Use {@link connectable} to create a connectable observable.
 * If you are using the `refCount` method of `ConnectableObservable`, use the {@link share} operator
 * instead.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 将在 v8 中删除。使用 {@link connectable} 创建一个可连接的 observable。如果你使用的是 `ConnectableObservable` 的 `refCount` 方法，请改用 {@link share} 操作符。详细信息： <https://rxjs.dev/deprecations/multicasting>
 *
 */
export class ConnectableObservable<T> extends Observable<T> {
  protected _subject: Subject<T> | null = null;
  protected _refCount: number = 0;
  protected _connection: Subscription | null = null;

  /**
   * @param source The source observable
   *
   * 来源可观察者
   *
   * @param subjectFactory The factory that creates the subject used internally.
   *
   * 创建内部使用的主体的工厂。
   *
   * @deprecated Will be removed in v8. Use {@link connectable} to create a connectable observable.
   * `new ConnectableObservable(source, factory)` is equivalent to
   * `connectable(source, { connector: factory })`.
   * When the `refCount()` method is needed, the {@link share} operator should be used instead:
   * `new ConnectableObservable(source, factory).refCount()` is equivalent to
   * `source.pipe(share({ connector: factory }))`.
   * Details: <https://rxjs.dev/deprecations/multicasting>
   *
   * 将在 v8 中删除。使用 {@link connectable} 创建一个可连接的 observable。`new ConnectableObservable(source, factory)` 等价于 connectable(source `connectable(source, { connector: factory })`。当需要 `refCount()` 方法时，应使用 {@link share} 操作符： `new ConnectableObservable(source, factory).refCount()` 等效于 `source.pipe(share({ connector: factory }))`。详细信息： <https://rxjs.dev/deprecations/multicasting>
   *
   */
  constructor(public source: Observable<T>, protected subjectFactory: () => Subject<T>) {
    super();
    // If we have lift, monkey patch that here. This is done so custom observable
    // types will compose through multicast. Otherwise the resulting observable would
    // simply be an instance of `ConnectableObservable`.
    if (hasLift(source)) {
      this.lift = source.lift;
    }
  }

  /** @internal */
  protected _subscribe(subscriber: Subscriber<T>) {
    return this.getSubject().subscribe(subscriber);
  }

  protected getSubject(): Subject<T> {
    const subject = this._subject;
    if (!subject || subject.isStopped) {
      this._subject = this.subjectFactory();
    }
    return this._subject!;
  }

  protected _teardown() {
    this._refCount = 0;
    const { _connection } = this;
    this._subject = this._connection = null;
    _connection?.unsubscribe();
  }

  /**
   * @deprecated {@link ConnectableObservable} will be removed in v8. Use {@link connectable} instead.
   * Details: <https://rxjs.dev/deprecations/multicasting>
   *
   * 将在 v8 中删除。请改用 {@link connectable}。详细信息： <https://rxjs.dev/deprecations/multicasting>
   *
   */
  connect(): Subscription {
    let connection = this._connection;
    if (!connection) {
      connection = this._connection = new Subscription();
      const subject = this.getSubject();
      connection.add(
        this.source.subscribe(
          new OperatorSubscriber(
            subject as any,
            undefined,
            () => {
              this._teardown();
              subject.complete();
            },
            (err) => {
              this._teardown();
              subject.error(err);
            },
            () => this._teardown()
          )
        )
      );

      if (connection.closed) {
        this._connection = null;
        connection = Subscription.EMPTY;
      }
    }
    return connection;
  }

  /**
   * @deprecated {@link ConnectableObservable} will be removed in v8. Use the {@link share} operator instead.
   * Details: <https://rxjs.dev/deprecations/multicasting>
   *
   * 将在 v8 中删除。请改用 {@link share} 操作符。详细信息： <https://rxjs.dev/deprecations/multicasting>
   *
   */
  refCount(): Observable<T> {
    return higherOrderRefCount()(this) as Observable<T>;
  }
}
