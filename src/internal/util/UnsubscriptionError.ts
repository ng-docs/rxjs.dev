import { createErrorClass } from './createErrorClass';

export interface UnsubscriptionError extends Error {
  readonly errors: any[];
}

export interface UnsubscriptionErrorCtor {
  /**
   * @deprecated Internal implementation detail. Do not construct error instances.
   * Cannot be tagged as internal: <https://github.com/ReactiveX/rxjs/issues/6269>
   *
   * 内部实现细节。不要构造错误实例。不能标记为内部： [https](https://github.com/ReactiveX/rxjs/issues/6269) ://github.com/ReactiveX/rxjs/issues/6269
   *
   */
  new (errors: any[]): UnsubscriptionError;
}

/**
 * An error thrown when one or more errors have occurred during the
 * `unsubscribe` of a {@link Subscription}.
 *
 * 在 `unsubscribe` {@link Subscription} 期间发生一个或多个错误时引发的错误。
 *
 */
export const UnsubscriptionError: UnsubscriptionErrorCtor = createErrorClass(
  (_super) =>
    function UnsubscriptionErrorImpl(this: any, errors: (Error | string)[]) {
      _super(this);
      this.message = errors
        ? `${errors.length} errors occurred during unsubscription:
${errors.map((err, i) => `${i + 1}) ${err.toString()}`).join('\n  ')}`
        : '';
      this.name = 'UnsubscriptionError';
      this.errors = errors;
    }
);
