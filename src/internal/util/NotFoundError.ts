import { createErrorClass } from './createErrorClass';

export interface NotFoundError extends Error {}

export interface NotFoundErrorCtor {
  /**
   * @deprecated Internal implementation detail. Do not construct error instances.
   * Cannot be tagged as internal: <https://github.com/ReactiveX/rxjs/issues/6269>
   *
   * 内部实现细节。不要构造错误实例。不能标记为内部： <https://github.com/ReactiveX/rxjs/issues/6269>
   *
   */
  new (message: string): NotFoundError;
}

/**
 * An error thrown when a value or values are missing from an
 * observable sequence.
 *
 * 当可观察序列中缺少一个或多个值时引发的错误。
 *
 * @see {@link operators/single}
 * @class NotFoundError
 */
export const NotFoundError: NotFoundErrorCtor = createErrorClass(
  (_super) =>
    function NotFoundErrorImpl(this: any, message: string) {
      _super(this);
      this.name = 'NotFoundError';
      this.message = message;
    }
);
