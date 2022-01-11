import { OperatorSubscriber } from '../../operators/OperatorSubscriber';
import { Observable } from '../../Observable';
import { innerFrom } from '../../observable/innerFrom';
import { ObservableInput } from '../../types';

export function fromFetch<T>(
  input: string | Request,
  init: RequestInit & {
    selector: (response: Response) => ObservableInput<T>;
  }
): Observable<T>;

export function fromFetch(input: string | Request, init?: RequestInit): Observable<Response>;

/**
 * Uses [the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to
 * make an HTTP request.
 *
 * 使用[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)发出 HTTP 请求。
 *
 * **WARNING** Parts of the fetch API are still experimental. `AbortController` is
 * required for this implementation to work and use cancellation appropriately.
 *
 * **警告**fetch API 的部分内容仍处于试验阶段。此实现需要 `AbortController` 才能正常工作并适当地使用取消。
 *
 * Will automatically set up an internal [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
 * in order to teardown the internal `fetch` when the subscription tears down.
 *
 * 将自动设置一个内部[AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)以便在订阅拆除时拆除内部 `fetch`。
 *
 * If a `signal` is provided via the `init` argument, it will behave like it usually does with
 * `fetch`. If the provided `signal` aborts, the error that `fetch` normally rejects with
 * in that scenario will be emitted as an error from the observable.
 *
 * 如果一个 `signal` 是通过 `init` 参数提供的，它的行为就像它通常对 `fetch` 所做的那样。如果提供的 `signal` 中止，那么在这种情况下通常会拒绝 `fetch` 的错误将作为 observable 的错误发出。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Basic use
 *
 * 基本用途
 *
 * ```ts
 * import { fromFetch } from 'rxjs/fetch';
 * import { switchMap, of, catchError } from 'rxjs';
 *
 * const data$ = fromFetch('https://api.github.com/users?per_page=5').pipe(
 *   switchMap(response => {
 *     if (response.ok) {
 *       // OK return data
 *       return response.json();
 *     } else {
 *       // Server is returning a status requiring the client to try something else.
 *       return of({ error: true, message: `Error ${ response.status }` });
 *     }
 *   }),
 *   catchError(err => {
 *     // Network or other error, handle appropriately
 *     console.error(err);
 *     return of({ error: true, message: err.message })
 *   })
 * );
 *
 * data$.subscribe({
 *   next: result => console.log(result),
 *   complete: () => console.log('done')
 * });
 * ```
 *
 * ### Use with Chunked Transfer Encoding
 *
 * ### 与分块传输编码一起使用
 *
 * With HTTP responses that use [chunked transfer encoding](https://tools.ietf.org/html/rfc7230#section-3.3.1),
 * the promise returned by `fetch` will resolve as soon as the response's headers are
 * received.
 *
 * 对于使用[分块传输编码](https://tools.ietf.org/html/rfc7230#section-3.3.1)的 HTTP 响应，`fetch` 返回的承诺将在收到响应的标头后立即解析。
 *
 * That means the `fromFetch` observable will emit a `Response` - and will
 * then complete - before the body is received. When one of the methods on the
 * `Response` - like `text()` or `json()` - is called, the returned promise will not
 * resolve until the entire body has been received. Unsubscribing from any observable
 * that uses the promise as an observable input will not abort the request.
 *
 * 这意味着 `fromFetch` observable 将在接收到主体之前发出一个 `Response` - 然后完成。当调用 `Response` 上的其中一种方法（如 `text()` 或 `json()` 时，返回的 Promise 将在收到整个正文之前不会解析。取消订阅任何使用 Promise 作为可观察输入的可观察对象不会中止请求。
 *
 * To facilitate aborting the retrieval of responses that use chunked transfer encoding,
 * a `selector` can be specified via the `init` parameter:
 *
 * 为了便于中止检索使用分块传输编码的响应，可以通过 `init` 参数指定 `selector` ：
 *
 * ```ts
 * import { of } from 'rxjs';
 * import { fromFetch } from 'rxjs/fetch';
 *
 * const data$ = fromFetch('https://api.github.com/users?per_page=5', {
 *   selector: response => response.json()
 * });
 *
 * data$.subscribe({
 *   next: result => console.log(result),
 *   complete: () => console.log('done')
 * });
 * ```
 * @param input The resource you would like to fetch. Can be a url or a request object.
 *
 * 你要获取的资源。可以是 url 或请求对象。
 *
 * @param initWithSelector A configuration object for the fetch.
 * [See MDN for more details](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
 *
 * 获取的配置对象。[有关更多详细信息，请参阅 MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
 *
 * @returns An Observable, that when subscribed to, performs an HTTP request using the native `fetch`
 * function. The {@link Subscription} is tied to an `AbortController` for the fetch.
 *
 * 一个 Observable，当被订阅时，它使用本机 `fetch` 函数执行 HTTP 请求。{@link Subscription} 绑定到 `AbortController` 以进行获取。
 *
 */
export function fromFetch<T>(
  input: string | Request,
  initWithSelector: RequestInit & {
    selector?: (response: Response) => ObservableInput<T>;
  } = {}
): Observable<Response | T> {
  const { selector, ...init } = initWithSelector;
  return new Observable<Response | T>((subscriber) => {
    // Our controller for aborting this fetch.
    // Any externally provided AbortSignal will have to call
    // abort on this controller when signaled, because the
    // signal from this controller is what is being passed to `fetch`.
    const controller = new AbortController();
    const { signal } = controller;
    // This flag exists to make sure we don't `abort()` the fetch upon tearing down
    // this observable after emitting a Response. Aborting in such circumstances
    // would also abort subsequent methods - like `json()` - that could be called
    // on the Response. Consider: `fromFetch().pipe(take(1), mergeMap(res => res.json()))`
    let abortable = true;

    // If the user provided an init configuration object,
    // let's process it and chain our abort signals, if necessary.
    // If a signal is provided, just have it teardown. It's a cancellation token, basically.
    const { signal: outerSignal } = init;
    if (outerSignal) {
      if (outerSignal.aborted) {
        controller.abort();
      } else {
        // We got an AbortSignal from the arguments passed into `fromFetch`.
        // We need to wire up our AbortController to abort when this signal aborts.
        const outerSignalHandler = () => {
          if (!signal.aborted) {
            controller.abort();
          }
        };
        outerSignal.addEventListener('abort', outerSignalHandler);
        subscriber.add(() => outerSignal.removeEventListener('abort', outerSignalHandler));
      }
    }

    // The initialization object passed to `fetch` as the second
    // argument. This ferries in important information, including our
    // AbortSignal. Create a new init, so we don't accidentally mutate the
    // passed init, or reassign it. This is because the init passed in
    // is shared between each subscription to the result.
    const perSubscriberInit: RequestInit = { ...init, signal };

    const handleError = (err: any) => {
      abortable = false;
      subscriber.error(err);
    };

    fetch(input, perSubscriberInit)
      .then((response) => {
        if (selector) {
          // If we have a selector function, use it to project our response.
          // Note that any error that comes from our selector will be
          // sent to the promise `catch` below and handled.
          innerFrom(selector(response)).subscribe(
            new OperatorSubscriber(
              subscriber,
              // Values are passed through to the subscriber
              undefined,
              // The projected response is complete.
              () => {
                abortable = false;
                subscriber.complete();
              },
              handleError
            )
          );
        } else {
          abortable = false;
          subscriber.next(response);
          subscriber.complete();
        }
      })
      .catch(handleError);

    return () => {
      if (abortable) {
        controller.abort();
      }
    };
  });
}
