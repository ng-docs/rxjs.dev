import { Operator } from './Operator';
import { Observable } from './Observable';
import { Subscriber } from './Subscriber';
import { Subscription, EMPTY_SUBSCRIPTION } from './Subscription';
import { Observer, SubscriptionLike, TeardownLogic } from './types';
import { ObjectUnsubscribedError } from './util/ObjectUnsubscribedError';
import { arrRemove } from './util/arrRemove';
import { errorContext } from './util/errorContext';

/**
 * A Subject is a special type of Observable that allows values to be
 * multicasted to many Observers. Subjects are like EventEmitters.
 *
 * Subject 是一种特殊类型的 Observable，它允许将值多播到多个 Observer。主题就像 EventEmitters。
 *
 * Every Subject is an Observable and an Observer. You can subscribe to a
 * Subject, and you can call next to feed values as well as error and complete.
 *
 * 每个 Subject 都是 Observable 和 Observer。你可以订阅一个主题，并且你可以调用 next 提要值以及错误和完成。
 *
 */
export class Subject<T> extends Observable<T> implements SubscriptionLike {
  closed = false;
  /**
   * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
   *
   * 内部实现细节，请勿直接使用。将在 v8 中内部化。
   *
   */
  observers: Observer<T>[] = [];
  /**
   * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
   *
   * 内部实现细节，请勿直接使用。将在 v8 中内部化。
   *
   */
  isStopped = false;
  /**
   * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
   *
   * 内部实现细节，请勿直接使用。将在 v8 中内部化。
   *
   */
  hasError = false;
  /**
   * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
   *
   * 内部实现细节，请勿直接使用。将在 v8 中内部化。
   *
   */
  thrownError: any = null;

  /**
   * Creates a "subject" by basically gluing an observer to an observable.
   *
   * 通过基本上将观察者粘合到可观察者来创建“主题”。
   *
   * @nocollapse
   * @deprecated Recommended you do not use. Will be removed at some point in the future. Plans for replacement still under discussion.
   *
   * 建议你不要使用。将在将来的某个时候被删除。更换计划仍在讨论中。
   *
   */
  static create: (...args: any[]) => any = <T>(destination: Observer<T>, source: Observable<T>): AnonymousSubject<T> => {
    return new AnonymousSubject<T>(destination, source);
  };

  constructor() {
    // NOTE: This must be here to obscure Observable's constructor.
    super();
  }

  /**
   * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
   *
   * 内部实现细节，请勿直接使用。将在 v8 中内部化。
   *
   */
  lift<R>(operator: Operator<T, R>): Observable<R> {
    const subject = new AnonymousSubject(this, this);
    subject.operator = operator as any;
    return subject as any;
  }

  /** @internal */
  protected _throwIfClosed() {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
  }

  next(value: T) {
    errorContext(() => {
      this._throwIfClosed();
      if (!this.isStopped) {
        const copy = this.observers.slice();
        for (const observer of copy) {
          observer.next(value);
        }
      }
    });
  }

  error(err: any) {
    errorContext(() => {
      this._throwIfClosed();
      if (!this.isStopped) {
        this.hasError = this.isStopped = true;
        this.thrownError = err;
        const { observers } = this;
        while (observers.length) {
          observers.shift()!.error(err);
        }
      }
    });
  }

  complete() {
    errorContext(() => {
      this._throwIfClosed();
      if (!this.isStopped) {
        this.isStopped = true;
        const { observers } = this;
        while (observers.length) {
          observers.shift()!.complete();
        }
      }
    });
  }

  unsubscribe() {
    this.isStopped = this.closed = true;
    this.observers = null!;
  }

  get observed() {
    return this.observers?.length > 0;
  }

  /** @internal */
  protected _trySubscribe(subscriber: Subscriber<T>): TeardownLogic {
    this._throwIfClosed();
    return super._trySubscribe(subscriber);
  }

  /** @internal */
  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    this._throwIfClosed();
    this._checkFinalizedStatuses(subscriber);
    return this._innerSubscribe(subscriber);
  }

  /** @internal */
  protected _innerSubscribe(subscriber: Subscriber<any>) {
    const { hasError, isStopped, observers } = this;
    return hasError || isStopped
      ? EMPTY_SUBSCRIPTION
      : (observers.push(subscriber), new Subscription(() => arrRemove(observers, subscriber)));
  }

  /** @internal */
  protected _checkFinalizedStatuses(subscriber: Subscriber<any>) {
    const { hasError, thrownError, isStopped } = this;
    if (hasError) {
      subscriber.error(thrownError);
    } else if (isStopped) {
      subscriber.complete();
    }
  }

  /**
   * Creates a new Observable with this Subject as the source. You can do this
   * to create customize Observer-side logic of the Subject and conceal it from
   * code that uses the Observable.
   *
   * 创建一个以此 Subject 为源的新 Observable。你可以这样做来创建 Subject 的自定义 Observer 端逻辑，并将其隐藏在使用 Observable 的代码中。
   *
   * @return {Observable} Observable that the Subject casts to
   *
   * 主体投射到的 Observable
   *
   */
  asObservable(): Observable<T> {
    const observable: any = new Observable<T>();
    observable.source = this;
    return observable;
  }
}

/**
 * @class AnonymousSubject<T>
 */
export class AnonymousSubject<T> extends Subject<T> {
  constructor(
    /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
    public destination?: Observer<T>,
    source?: Observable<T>
  ) {
    super();
    this.source = source;
  }

  next(value: T) {
    this.destination?.next?.(value);
  }

  error(err: any) {
    this.destination?.error?.(err);
  }

  complete() {
    this.destination?.complete?.();
  }

  /** @internal */
  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    return this.source?.subscribe(subscriber) ?? EMPTY_SUBSCRIPTION;
  }
}
