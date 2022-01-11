import { createErrorClass } from './createErrorClass';

export interface ObjectUnsubscribedError extends Error {}

export interface ObjectUnsubscribedErrorCtor {
  /**
   * @deprecated Internal implementation detail. Do not construct error instances.
   * Cannot be tagged as internal: <https://github.com/ReactiveX/rxjs/issues/6269>
   *
   * 内部实现细节。不要构造错误实例。不能标记为内部： [https](https://github.com/ReactiveX/rxjs/issues/6269) ://github.com/ReactiveX/rxjs/issues/6269
   *
   */
  new (): ObjectUnsubscribedError;
}

/**
 * An error thrown when an action is invalid because the object has been
 * unsubscribed.
 *
 * 由于对象已取消订阅而导致操作无效时引发的错误。
 *
 * @see {@link Subject}
 * @see {@link BehaviorSubject}
 * @class ObjectUnsubscribedError
 */
export const ObjectUnsubscribedError: ObjectUnsubscribedErrorCtor = createErrorClass(
  (_super) =>
    function ObjectUnsubscribedErrorImpl(this: any) {
      _super(this);
      this.name = 'ObjectUnsubscribedError';
      this.message = 'object unsubscribed';
    }
);
