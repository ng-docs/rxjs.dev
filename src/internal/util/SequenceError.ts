import { createErrorClass } from './createErrorClass';

export interface SequenceError extends Error {}

export interface SequenceErrorCtor {
  /**
   * @deprecated Internal implementation detail. Do not construct error instances.
   * Cannot be tagged as internal: <https://github.com/ReactiveX/rxjs/issues/6269>
   *
   * 内部实现细节。不要构造错误实例。不能标记为内部： [https](https://github.com/ReactiveX/rxjs/issues/6269) ://github.com/ReactiveX/rxjs/issues/6269
   *
   */
  new (message: string): SequenceError;
}

/**
 * An error thrown when something is wrong with the sequence of
 * values arriving on the observable.
 *
 * 当到达可观察对象的值序列出现问题时引发错误。
 *
 * @see {@link operators/single}
 * @class SequenceError
 */
export const SequenceError: SequenceErrorCtor = createErrorClass(
  (_super) =>
    function SequenceErrorImpl(this: any, message: string) {
      _super(this);
      this.name = 'SequenceError';
      this.message = message;
    }
);
