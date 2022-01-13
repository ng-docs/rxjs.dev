import { createErrorClass } from './createErrorClass';

export interface EmptyError extends Error {}

export interface EmptyErrorCtor {
  /**
   * @deprecated Internal implementation detail. Do not construct error instances.
   * Cannot be tagged as internal: <https://github.com/ReactiveX/rxjs/issues/6269>
   *
   * 内部实现细节。不要构造错误实例。不能标记为内部： <https://github.com/ReactiveX/rxjs/issues/6269>
   *
   */
  new (): EmptyError;
}

/**
 * An error thrown when an Observable or a sequence was queried but has no
 * elements.
 *
 * 查询 Observable 或序列但没有元素时抛出的错误。
 *
 * @see {@link first}
 * @see {@link last}
 * @see {@link single}
 * @see {@link firstValueFrom}
 * @see {@link lastValueFrom}
 * @class EmptyError
 */
export const EmptyError: EmptyErrorCtor = createErrorClass((_super) => function EmptyErrorImpl(this: any) {
  _super(this);
  this.name = 'EmptyError';
  this.message = 'no elements in sequence';
});
