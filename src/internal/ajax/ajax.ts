import { map } from '../operators/map';
import { Observable } from '../Observable';
import { AjaxConfig, AjaxRequest, AjaxDirection, ProgressEventType } from './types';
import { AjaxResponse } from './AjaxResponse';
import { AjaxTimeoutError, AjaxError } from './errors';

export interface AjaxCreationMethod {
  /**
   * Creates an observable that will perform an AJAX request using the
   * [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) in
   * global scope by default.
   *
   * 创建一个 observable，默认情况下将在全局范围内使用[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)执行 AJAX 请求。
   *
   * This is the most configurable option, and the basis for all other AJAX calls in the library.
   *
   * 这是最可配置的选项，也是库中所有其他 AJAX 调用的基础。
   *
   * ## Example
   *
   * ## 例子
   *
   * ```ts
   * import { ajax } from 'rxjs/ajax';
   * import { map, catchError, of } from 'rxjs';
   *
   * const obs$ = ajax({
   *   method: 'GET',
   *   url: 'https://api.github.com/users?per_page=5',
   *   responseType: 'json'
   * }).pipe(
   *   map(userResponse => console.log('users: ', userResponse)),
   *   catchError(error => {
   *     console.log('error: ', error);
   *     return of(error);
   *   })
   * );
   * ```
   */
  <T>(config: AjaxConfig): Observable<AjaxResponse<T>>;

  /**
   * Perform an HTTP GET using the
   * [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) in
   * global scope. Defaults to a `responseType` of `"json"`.
   *
   * 在全局范围内使用[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)执行 HTTP GET。默认为 `"json"` 的 `responseType`。
   *
   * ## Example
   *
   * ## 例子
   *
   * ```ts
   * import { ajax } from 'rxjs/ajax';
   * import { map, catchError, of } from 'rxjs';
   *
   * const obs$ = ajax('https://api.github.com/users?per_page=5').pipe(
   *   map(userResponse => console.log('users: ', userResponse)),
   *   catchError(error => {
   *     console.log('error: ', error);
   *     return of(error);
   *   })
   * );
   * ```
   */
  <T>(url: string): Observable<AjaxResponse<T>>;

  /**
   * Performs an HTTP GET using the
   * [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) in
   * global scope by default, and a `responseType` of `"json"`.
   *
   * 默认情况下，在全局范围内使用[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)执行 HTTP GET，`responseType` 为 `"json"`。
   *
   * @param url The URL to get the resource from
   *
   * 获取资源的 URL
   *
   * @param headers Optional headers. Case-Insensitive.
   *
   * 可选标题。不区分大小写。
   *
   */
  get<T>(url: string, headers?: Record<string, string>): Observable<AjaxResponse<T>>;

  /**
   * Performs an HTTP POST using the
   * [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) in
   * global scope by default, and a `responseType` of `"json"`.
   *
   * 默认情况下，使用全局范围内的[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)执行 HTTP POST，`responseType` 为 `"json"`。
   *
   * Before sending the value passed to the `body` argument, it is automatically serialized
   * based on the specified `responseType`. By default, a JavaScript object will be serialized
   * to JSON. A `responseType` of `application/x-www-form-urlencoded` will flatten any provided
   * dictionary object to a url-encoded string.
   *
   * 在发送传递给 `body` 参数的值之前，它会根据指定的 `responseType` 自动序列化。默认情况下，JavaScript 对象将被序列化为 JSON。`application/x-www-form-urlencoded` 的 `responseType` 会将任何提供的字典对象展平为 url 编码的字符串。
   *
   * @param url The URL to get the resource from
   *
   * 获取资源的 URL
   *
   * @param body The content to send. The body is automatically serialized.
   *
   * 要发送的内容。正文是自动序列化的。
   *
   * @param headers Optional headers. Case-Insensitive.
   *
   * 可选标题。不区分大小写。
   *
   */
  post<T>(url: string, body?: any, headers?: Record<string, string>): Observable<AjaxResponse<T>>;

  /**
   * Performs an HTTP PUT using the
   * [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) in
   * global scope by default, and a `responseType` of `"json"`.
   *
   * 默认情况下，使用全局范围内的[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)执行 HTTP PUT，`responseType` 为 `"json"`。
   *
   * Before sending the value passed to the `body` argument, it is automatically serialized
   * based on the specified `responseType`. By default, a JavaScript object will be serialized
   * to JSON. A `responseType` of `application/x-www-form-urlencoded` will flatten any provided
   * dictionary object to a url-encoded string.
   *
   * 在发送传递给 `body` 参数的值之前，它会根据指定的 `responseType` 自动序列化。默认情况下，JavaScript 对象将被序列化为 JSON。`application/x-www-form-urlencoded` 的 `responseType` 会将任何提供的字典对象展平为 url 编码的字符串。
   *
   * @param url The URL to get the resource from
   *
   * 获取资源的 URL
   *
   * @param body The content to send. The body is automatically serialized.
   *
   * 要发送的内容。正文是自动序列化的。
   *
   * @param headers Optional headers. Case-Insensitive.
   *
   * 可选标题。不区分大小写。
   *
   */
  put<T>(url: string, body?: any, headers?: Record<string, string>): Observable<AjaxResponse<T>>;

  /**
   * Performs an HTTP PATCH using the
   * [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) in
   * global scope by default, and a `responseType` of `"json"`.
   *
   * 默认情况下，使用全局范围内的[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)执行 HTTP PATCH，`responseType` 为 `"json"`。
   *
   * Before sending the value passed to the `body` argument, it is automatically serialized
   * based on the specified `responseType`. By default, a JavaScript object will be serialized
   * to JSON. A `responseType` of `application/x-www-form-urlencoded` will flatten any provided
   * dictionary object to a url-encoded string.
   *
   * 在发送传递给 `body` 参数的值之前，它会根据指定的 `responseType` 自动序列化。默认情况下，JavaScript 对象将被序列化为 JSON。`application/x-www-form-urlencoded` 的 `responseType` 会将任何提供的字典对象展平为 url 编码的字符串。
   *
   * @param url The URL to get the resource from
   *
   * 获取资源的 URL
   *
   * @param body The content to send. The body is automatically serialized.
   *
   * 要发送的内容。正文是自动序列化的。
   *
   * @param headers Optional headers. Case-Insensitive.
   *
   * 可选标题。不区分大小写。
   *
   */
  patch<T>(url: string, body?: any, headers?: Record<string, string>): Observable<AjaxResponse<T>>;

  /**
   * Performs an HTTP DELETE using the
   * [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) in
   * global scope by default, and a `responseType` of `"json"`.
   *
   * 默认情况下，使用全局范围内的[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)执行 HTTP DELETE，`responseType` 为 `"json"`。
   *
   * @param url The URL to get the resource from
   *
   * 获取资源的 URL
   *
   * @param headers Optional headers. Case-Insensitive.
   *
   * 可选标题。不区分大小写。
   *
   */
  delete<T>(url: string, headers?: Record<string, string>): Observable<AjaxResponse<T>>;

  /**
   * Performs an HTTP GET using the
   * [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) in
   * global scope by default, and returns the hydrated JavaScript object from the
   * response.
   *
   * 默认情况下使用全局范围内的[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)执行 HTTP GET，并从响应中返回水合 JavaScript 对象。
   *
   * @param url The URL to get the resource from
   *
   * 获取资源的 URL
   *
   * @param headers Optional headers. Case-Insensitive.
   *
   * 可选标题。不区分大小写。
   *
   */
  getJSON<T>(url: string, headers?: Record<string, string>): Observable<T>;
}

function ajaxGet<T>(url: string, headers?: Record<string, string>): Observable<AjaxResponse<T>> {
  return ajax({ method: 'GET', url, headers });
}

function ajaxPost<T>(url: string, body?: any, headers?: Record<string, string>): Observable<AjaxResponse<T>> {
  return ajax({ method: 'POST', url, body, headers });
}

function ajaxDelete<T>(url: string, headers?: Record<string, string>): Observable<AjaxResponse<T>> {
  return ajax({ method: 'DELETE', url, headers });
}

function ajaxPut<T>(url: string, body?: any, headers?: Record<string, string>): Observable<AjaxResponse<T>> {
  return ajax({ method: 'PUT', url, body, headers });
}

function ajaxPatch<T>(url: string, body?: any, headers?: Record<string, string>): Observable<AjaxResponse<T>> {
  return ajax({ method: 'PATCH', url, body, headers });
}

const mapResponse = map((x: AjaxResponse<any>) => x.response);

function ajaxGetJSON<T>(url: string, headers?: Record<string, string>): Observable<T> {
  return mapResponse(
    ajax<T>({
      method: 'GET',
      url,
      headers,
    })
  );
}

/**
 * There is an ajax operator on the Rx object.
 *
 * Rx 对象上有一个 ajax 运算符。
 *
 * It creates an observable for an Ajax request with either a request object with
 * url, headers, etc or a string for a URL.
 *
 * 它为 Ajax 请求创建一个 observable，其中包含带有 url、标头等的请求对象或 URL 的字符串。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Using `ajax()` to fetch the response object that is being returned from API
 *
 * 使用 `ajax()` 获取从 API 返回的响应对象
 *
 * ```ts
 * import { ajax } from 'rxjs/ajax';
 * import { map, catchError, of } from 'rxjs';
 *
 * const obs$ = ajax('https://api.github.com/users?per_page=5').pipe(
 *   map(userResponse => console.log('users: ', userResponse)),
 *   catchError(error => {
 *     console.log('error: ', error);
 *     return of(error);
 *   })
 * );
 *
 * obs$.subscribe({
 *   next: value => console.log(value),
 *   error: err => console.log(err)
 * });
 * ```
 *
 * Using `ajax.getJSON()` to fetch data from API
 *
 * 使用 `ajax.getJSON()` 从 API 获取数据
 *
 * ```ts
 * import { ajax } from 'rxjs/ajax';
 * import { map, catchError, of } from 'rxjs';
 *
 * const obs$ = ajax.getJSON('https://api.github.com/users?per_page=5').pipe(
 *   map(userResponse => console.log('users: ', userResponse)),
 *   catchError(error => {
 *     console.log('error: ', error);
 *     return of(error);
 *   })
 * );
 *
 * obs$.subscribe({
 *   next: value => console.log(value),
 *   error: err => console.log(err)
 * });
 * ```
 *
 * Using `ajax()` with object as argument and method POST with a two seconds delay
 *
 * 使用 `ajax()` 对象作为参数和方法 POST 有两秒的延迟
 *
 * ```ts
 * import { ajax } from 'rxjs/ajax';
 * import { map, catchError, of } from 'rxjs';
 *
 * const users = ajax({
 *   url: 'https://httpbin.org/delay/2',
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'rxjs-custom-header': 'Rxjs'
 *   },
 *   body: {
 *     rxjs: 'Hello World!'
 *   }
 * }).pipe(
 *   map(response => console.log('response: ', response)),
 *   catchError(error => {
 *     console.log('error: ', error);
 *     return of(error);
 *   })
 * );
 *
 * users.subscribe({
 *   next: value => console.log(value),
 *   error: err => console.log(err)
 * });
 * ```
 *
 * Using `ajax()` to fetch. An error object that is being returned from the request
 *
 * 使用 `ajax()` 来获取。从请求返回的错误对象
 *
 * ```ts
 * import { ajax } from 'rxjs/ajax';
 * import { map, catchError, of } from 'rxjs';
 *
 * const obs$ = ajax('https://api.github.com/404').pipe(
 *   map(userResponse => console.log('users: ', userResponse)),
 *   catchError(error => {
 *     console.log('error: ', error);
 *     return of(error);
 *   })
 * );
 *
 * obs$.subscribe({
 *   next: value => console.log(value),
 *   error: err => console.log(err)
 * });
 * ```
 */
export const ajax: AjaxCreationMethod = (() => {
  const create = <T>(urlOrConfig: string | AjaxConfig) => {
    const config: AjaxConfig =
      typeof urlOrConfig === 'string'
        ? {
            url: urlOrConfig,
          }
        : urlOrConfig;
    return fromAjax<T>(config);
  };

  create.get = ajaxGet;
  create.post = ajaxPost;
  create.delete = ajaxDelete;
  create.put = ajaxPut;
  create.patch = ajaxPatch;
  create.getJSON = ajaxGetJSON;

  return create;
})();

const UPLOAD = 'upload';
const DOWNLOAD = 'download';
const LOADSTART = 'loadstart';
const PROGRESS = 'progress';
const LOAD = 'load';

export function fromAjax<T>(init: AjaxConfig): Observable<AjaxResponse<T>> {
  return new Observable((destination) => {
    const config = {
      // Defaults
      async: true,
      crossDomain: false,
      withCredentials: false,
      method: 'GET',
      timeout: 0,
      responseType: 'json' as XMLHttpRequestResponseType,

      ...init,
    };

    const { queryParams, body: configuredBody, headers: configuredHeaders } = config;

    let url = config.url;
    if (!url) {
      throw new TypeError('url is required');
    }

    if (queryParams) {
      let searchParams: URLSearchParams;
      if (url.includes('?')) {
        // If the user has passed a URL with a querystring already in it,
        // we need to combine them. So we're going to split it. There
        // should only be one `?` in a valid URL.
        const parts = url.split('?');
        if (2 < parts.length) {
          throw new TypeError('invalid url');
        }
        // Add the passed queryParams to the params already in the url provided.
        searchParams = new URLSearchParams(parts[1]);
        // queryParams is converted to any because the runtime is *much* more permissive than
        // the types are.
        new URLSearchParams(queryParams as any).forEach((value, key) => searchParams.set(key, value));
        // We have to do string concatenation here, because `new URL(url)` does
        // not like relative URLs like `/this` without a base url, which we can't
        // specify, nor can we assume `location` will exist, because of node.
        url = parts[0] + '?' + searchParams;
      } else {
        // There is no pre-existing querystring, so we can just use URLSearchParams
        // to convert the passed queryParams into the proper format and encodings.
        // queryParams is converted to any because the runtime is *much* more permissive than
        // the types are.
        searchParams = new URLSearchParams(queryParams as any);
        url = url + '?' + searchParams;
      }
    }

    // Normalize the headers. We're going to make them all lowercase, since
    // Headers are case insensitive by design. This makes it easier to verify
    // that we aren't setting or sending duplicates.
    const headers: Record<string, any> = {};
    if (configuredHeaders) {
      for (const key in configuredHeaders) {
        if (configuredHeaders.hasOwnProperty(key)) {
          headers[key.toLowerCase()] = configuredHeaders[key];
        }
      }
    }

    const crossDomain = config.crossDomain;

    // Set the x-requested-with header. This is a non-standard header that has
    // come to be a de facto standard for HTTP requests sent by libraries and frameworks
    // using XHR. However, we DO NOT want to set this if it is a CORS request. This is
    // because sometimes this header can cause issues with CORS. To be clear,
    // None of this is necessary, it's only being set because it's "the thing libraries do"
    // Starting back as far as JQuery, and continuing with other libraries such as Angular 1,
    // Axios, et al.
    if (!crossDomain && !('x-requested-with' in headers)) {
      headers['x-requested-with'] = 'XMLHttpRequest';
    }

    // Allow users to provide their XSRF cookie name and the name of a custom header to use to
    // send the cookie.
    const { withCredentials, xsrfCookieName, xsrfHeaderName } = config;
    if ((withCredentials || !crossDomain) && xsrfCookieName && xsrfHeaderName) {
      const xsrfCookie = document?.cookie.match(new RegExp(`(^|;\\s*)(${xsrfCookieName})=([^;]*)`))?.pop() ?? '';
      if (xsrfCookie) {
        headers[xsrfHeaderName] = xsrfCookie;
      }
    }

    // Examine the body and determine whether or not to serialize it
    // and set the content-type in `headers`, if we're able.
    const body = extractContentTypeAndMaybeSerializeBody(configuredBody, headers);

    // The final request settings.
    const _request: Readonly<AjaxRequest> = {
      ...config,

      // Set values we ensured above
      url,
      headers,
      body,
    };

    let xhr: XMLHttpRequest;

    // Create our XHR so we can get started.
    xhr = init.createXHR ? init.createXHR() : new XMLHttpRequest();

    {
      ///////////////////////////////////////////////////
      // set up the events before open XHR
      // https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
      // You need to add the event listeners before calling open() on the request.
      // Otherwise the progress events will not fire.
      ///////////////////////////////////////////////////

      const { progressSubscriber, includeDownloadProgress = false, includeUploadProgress = false } = init;

      /**
       * Wires up an event handler that will emit an error when fired. Used
       * for timeout and abort events.
       *
       * 连接一个事件处理程序，该处理程序在触发时会发出错误。用于超时和中止事件。
       *
       * @param type The type of event we're treating as an error
       *
       * 我们视为错误的事件类型
       *
       * @param errorFactory A function that creates the type of error to emit.
       *
       * 创建要发出的错误类型的函数。
       *
       */
      const addErrorEvent = (type: string, errorFactory: () => any) => {
        xhr.addEventListener(type, () => {
          const error = errorFactory();
          progressSubscriber?.error?.(error);
          destination.error(error);
        });
      };

      // If the request times out, handle errors appropriately.
      addErrorEvent('timeout', () => new AjaxTimeoutError(xhr, _request));

      // If the request aborts (due to a network disconnection or the like), handle
      // it as an error.
      addErrorEvent('abort', () => new AjaxError('aborted', xhr, _request));

      /**
       * Creates a response object to emit to the consumer.
       *
       * 创建一个响应对象以发送给消费者。
       *
       * @param direction the direction related to the event. Prefixes the event `type` in the
       * `AjaxResponse` object with "upload_" for events related to uploading and "download_"
       * for events related to downloading.
       *
       * 与事件相关的方向。在 `AjaxResponse` 对象中为事件 `type` 添加前缀，“upload _”表示与上传相关的事件，“download_ ”表示与下载相关的事件。
       *
       * @param event the actual event object.
       *
       * 实际的事件对象。
       *
       */
      const createResponse = (direction: AjaxDirection, event: ProgressEvent) =>
        new AjaxResponse<T>(event, xhr, _request, `${direction}_${event.type as ProgressEventType}` as const);

      /**
       * Wires up an event handler that emits a Response object to the consumer, used for
       * all events that emit responses, loadstart, progress, and load.
       * Note that download load handling is a bit different below, because it has
       * more logic it needs to run.
       *
       * 连接一个事件处理程序，该处理程序向消费者发出一个 Response 对象，用于所有发出响应、loadstart、progress 和 load 的事件。请注意，下面的下载负载处理有点不同，因为它需要运行更多逻辑。
       *
       * @param target The target, either the XHR itself or the Upload object.
       *
       * 目标，可以是 XHR 本身，也可以是 Upload 对象。
       *
       * @param type The type of event to wire up
       *
       * 要连接的事件类型
       *
       * @param direction The "direction", used to prefix the response object that is
       * emitted to the consumer. (e.g. "upload_" or "download_")
       *
       * “方向”，用于为发送给消费者的响应对象添加前缀。（例如“上传 _”或“下载 _”）
       *
       */
      const addProgressEvent = (target: any, type: string, direction: AjaxDirection) => {
        target.addEventListener(type, (event: ProgressEvent) => {
          destination.next(createResponse(direction, event));
        });
      };

      if (includeUploadProgress) {
        [LOADSTART, PROGRESS, LOAD].forEach((type) => addProgressEvent(xhr.upload, type, UPLOAD));
      }

      if (progressSubscriber) {
        [LOADSTART, PROGRESS].forEach((type) => xhr.upload.addEventListener(type, (e: any) => progressSubscriber?.next?.(e)));
      }

      if (includeDownloadProgress) {
        [LOADSTART, PROGRESS].forEach((type) => addProgressEvent(xhr, type, DOWNLOAD));
      }

      const emitError = (status?: number) => {
        const msg = 'ajax error' + (status ? ' ' + status : '');
        destination.error(new AjaxError(msg, xhr, _request));
      };

      xhr.addEventListener('error', (e) => {
        progressSubscriber?.error?.(e);
        emitError();
      });

      xhr.addEventListener(LOAD, (event) => {
        const { status } = xhr;
        // 4xx and 5xx should error (https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html)
        if (status < 400) {
          progressSubscriber?.complete?.();

          let response: AjaxResponse<T>;
          try {
            // This can throw in IE, because we end up needing to do a JSON.parse
            // of the response in some cases to produce object we'd expect from
            // modern browsers.
            response = createResponse(DOWNLOAD, event);
          } catch (err) {
            destination.error(err);
            return;
          }

          destination.next(response);
          destination.complete();
        } else {
          progressSubscriber?.error?.(event);
          emitError(status);
        }
      });
    }

    const { user, method, async } = _request;
    // open XHR
    if (user) {
      xhr.open(method, url, async, user, _request.password);
    } else {
      xhr.open(method, url, async);
    }

    // timeout, responseType and withCredentials can be set once the XHR is open
    if (async) {
      xhr.timeout = _request.timeout;
      xhr.responseType = _request.responseType;
    }

    if ('withCredentials' in xhr) {
      xhr.withCredentials = _request.withCredentials;
    }

    // set headers
    for (const key in headers) {
      if (headers.hasOwnProperty(key)) {
        xhr.setRequestHeader(key, headers[key]);
      }
    }

    // finally send the request
    if (body) {
      xhr.send(body);
    } else {
      xhr.send();
    }

    return () => {
      if (xhr && xhr.readyState !== 4 /*XHR done*/) {
        xhr.abort();
      }
    };
  });
}

/**
 * Examines the body to determine if we need to serialize it for them or not.
 * If the body is a type that XHR handles natively, we just allow it through,
 * otherwise, if the body is something that *we* can serialize for the user,
 * we will serialize it, and attempt to set the `content-type` header, if it's
 * not already set.
 *
 * 检查主体以确定我们是否需要为它们序列化它。如果 body 是 XHR 原生处理的类型，我们只允许它通过，否则，如果 body 是*我们*可以为用户序列化的东西，我们将序列化它，并尝试设置 `content-type` 标头，如果不是已经设置好了。
 *
 * @param body The body passed in by the user
 *
 * 用户传入的 body
 *
 * @param headers The normalized headers
 *
 * 标准化的标头
 *
 */
function extractContentTypeAndMaybeSerializeBody(body: any, headers: Record<string, string>) {
  if (
    !body ||
    typeof body === 'string' ||
    isFormData(body) ||
    isURLSearchParams(body) ||
    isArrayBuffer(body) ||
    isFile(body) ||
    isBlob(body) ||
    isReadableStream(body)
  ) {
    // The XHR instance itself can handle serializing these, and set the content-type for us
    // so we don't need to do that. https://xhr.spec.whatwg.org/#the-send()-method
    return body;
  }

  if (isArrayBufferView(body)) {
    // This is a typed array (e.g. Float32Array or Uint8Array), or a DataView.
    // XHR can handle this one too: https://fetch.spec.whatwg.org/#concept-bodyinit-extract
    return body.buffer;
  }

  if (typeof body === 'object') {
    // If we have made it here, this is an object, probably a POJO, and we'll try
    // to serialize it for them. If this doesn't work, it will throw, obviously, which
    // is okay. The workaround for users would be to manually set the body to their own
    // serialized string (accounting for circular references or whatever), then set
    // the content-type manually as well.
    headers['content-type'] = headers['content-type'] ?? 'application/json;charset=utf-8';
    return JSON.stringify(body);
  }

  // If we've gotten past everything above, this is something we don't quite know how to
  // handle. Throw an error. This will be caught and emitted from the observable.
  throw new TypeError('Unknown body type');
}

const _toString = Object.prototype.toString;

function toStringCheck(obj: any, name: string): boolean {
  return _toString.call(obj) === `[object ${name}]`;
}

function isArrayBuffer(body: any): body is ArrayBuffer {
  return toStringCheck(body, 'ArrayBuffer');
}

function isFile(body: any): body is File {
  return toStringCheck(body, 'File');
}

function isBlob(body: any): body is Blob {
  return toStringCheck(body, 'Blob');
}

function isArrayBufferView(body: any): body is ArrayBufferView {
  return typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(body);
}

function isFormData(body: any): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function isURLSearchParams(body: any): body is URLSearchParams {
  return typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams;
}

function isReadableStream(body: any): body is ReadableStream {
  return typeof ReadableStream !== 'undefined' && body instanceof ReadableStream;
}
