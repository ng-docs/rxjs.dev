import { createErrorClass } from './createErrorClass';

export interface ArgumentOutOfRangeError extends Error {}

export interface ArgumentOutOfRangeErrorCtor {
  /**
   * @deprecated Internal implementation detail. Do not construct error instances.
   * Cannot be tagged as internal: <https://github.com/ReactiveX/rxjs/issues/6269>
   *
   * 内部实现细节。不要构造错误实例。不能标记为内部： <https://github.com/ReactiveX/rxjs/issues/6269>
   *
   */
  new (): ArgumentOutOfRangeError;
}

/**
 * An error thrown when an element was queried at a certain index of an
 * Observable, but no such index or position exists in that sequence.
 *
 * 在 Observable 的某个索引处查询元素时抛出的错误，但该序列中不存在这样的索引或位置。
 *
 * @see {@link elementAt}
 * @see {@link take}
 * @see {@link takeLast}
 * @class ArgumentOutOfRangeError
 */
export const ArgumentOutOfRangeError: ArgumentOutOfRangeErrorCtor = createErrorClass(
  (_super) =>
    function ArgumentOutOfRangeErrorImpl(this: any) {
      _super(this);
      this.name = 'ArgumentOutOfRangeError';
      this.message = 'argument out of range';
    }
);
