import { PartialObserver } from '../types';

/**
 * Valid Ajax direction types. Prefixes the event `type` in the
 * {@link AjaxResponse} object with "upload_" for events related
 * to uploading and "download_" for events related to downloading.
 *
 * 有效的 Ajax 方向类型。在 {@link `type` } 对象中为与上传 _ 相关的事件添加“upload”前缀，为与下载相关的事件添加“download_ ”前缀。
 *
 */
export type AjaxDirection = 'upload' | 'download';

export type ProgressEventType = 'loadstart' | 'progress' | 'load';

export type AjaxResponseType = `${AjaxDirection}_${ProgressEventType}`;

/**
 * The object containing values RxJS used to make the HTTP request.
 *
 * 包含 RxJS 用于发出 HTTP 请求的值的对象。
 *
 * This is provided in {@link AjaxError} instances as the `request`
 * object.
 *
 * 这是在 {@link AjaxError} 实例中作为 `request` 对象提供的。
 *
 */
export interface AjaxRequest {
  /**
   * The URL requested.
   *
   * 请求的 URL。
   *
   */
  url: string;

  /**
   * The body to send over the HTTP request.
   *
   * 通过 HTTP 请求发送的正文。
   *
   */
  body?: any;

  /**
   * The HTTP method used to make the HTTP request.
   *
   * 用于发出 HTTP 请求的 HTTP 方法。
   *
   */
  method: string;

  /**
   * Whether or not the request was made asynchronously.
   *
   * 请求是否是异步发出的。
   *
   */
  async: boolean;

  /**
   * The headers sent over the HTTP request.
   *
   * 通过 HTTP 请求发送的标头。
   *
   */
  headers: Readonly<Record<string, any>>;

  /**
   * The timeout value used for the HTTP request.
   * Note: this is only honored if the request is asynchronous (`async` is `true`).
   *
   * 用于 HTTP 请求的超时值。注意：仅当请求是异步的（ `async` 为 `true` ）时才会这样做。
   *
   */
  timeout: number;

  /**
   * The user credentials user name sent with the HTTP request.
   *
   * 与 HTTP 请求一起发送的用户凭据用户名。
   *
   */
  user?: string;

  /**
   * The user credentials password sent with the HTTP request.
   *
   * 随 HTTP 请求发送的用户凭据密码。
   *
   */
  password?: string;

  /**
   * Whether or not the request was a CORS request.
   *
   * 请求是否是 CORS 请求。
   *
   */
  crossDomain: boolean;

  /**
   * Whether or not a CORS request was sent with credentials.
   * If `false`, will also ignore cookies in the CORS response.
   *
   * 是否使用凭据发送了 CORS 请求。如果为 `false` ，也会忽略 CORS 响应中的 cookie。
   *
   */
  withCredentials: boolean;

  /**
   * The [`responseType`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType) set before sending the request.
   *
   * 在发送请求之前设置的[`responseType`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType) 。
   *
   */
  responseType: XMLHttpRequestResponseType;
}

/**
 * Configuration for the {@link ajax} creation function.
 *
 * {@link ajax} 创建函数的配置。
 *
 */
export interface AjaxConfig {
  /**
   * The address of the resource to request via HTTP.
   *
   * 通过 HTTP 请求的资源的地址。
   *
   */
  url: string;

  /**
   * The body of the HTTP request to send.
   *
   * 要发送的 HTTP 请求的正文。
   *
   * This is serialized, by default, based off of the value of the `"content-type"` header.
   * For example, if the `"content-type"` is `"application/json"`, the body will be serialized
   * as JSON. If the `"content-type"` is `"application/x-www-form-urlencoded"`, whatever object passed
   * to the body will be serialized as URL, using key-value pairs based off of the keys and values of the object.
   * In all other cases, the body will be passed directly.
   *
   * 默认情况下，这是基于 `"content-type"` 标头的值进行序列化的。例如，如果 `"content-type"` 是 `"application/json"` ，则正文将被序列化为 JSON。如果 `"content-type"` 是 `"application/x-www-form-urlencoded"` ，则传递给正文的任何对象都将被序列化为 URL，使用基于对象的键和值的键值对。在所有其他情况下，正文将直接传递。
   *
   */
  body?: any;

  /**
   * Whether or not to send the request asynchronously. Defaults to `true`.
   * If set to `false`, this will block the thread until the AJAX request responds.
   *
   * 是否异步发送请求。默认为 `true` 。如果设置为 `false` ，这将阻塞线程，直到 AJAX 请求响应。
   *
   */
  async?: boolean;

  /**
   * The HTTP Method to use for the request. Defaults to "GET".
   *
   * 用于请求的 HTTP 方法。默认为“获取”。
   *
   */
  method?: string;

  /**
   * The HTTP headers to apply.
   *
   * 要应用的 HTTP 标头。
   *
   * Note that, by default, RxJS will add the following headers under certain conditions:
   *
   * 请注意，默认情况下，RxJS 在某些条件下会添加以下标头：
   *
   * 1. If the `"content-type"` header is **NOT** set, and the `body` is [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData),
   *    a `"content-type"` of `"application/x-www-form-urlencoded; charset=UTF-8"` will be set automatically.
   *
   *    如果**未**设置 `"content-type"` 标头，并且 `body` 是[`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) ，则会自动设置 `"application/x-www-form-urlencoded; charset=UTF-8"` 的 `"content-type"` 。
   *
   * 2. If the `"x-requested-with"` header is **NOT** set, and the `crossDomain` configuration property is **NOT** explicitly set to `true`,
   *    (meaning it is not a CORS request), a `"x-requested-with"` header with a value of `"XMLHttpRequest"` will be set automatically.
   *    This header is generally meaningless, and is set by libraries and frameworks using `XMLHttpRequest` to make HTTP requests.
   *
   *    如果 `"x-requested-with"` 标头**未**设置，并且 `crossDomain` 配置属性**未**显式设置为 `true` （意味着它不是 CORS 请求），则 `"x-requested-with"` 标头的值为 `"XMLHttpRequest"` 将自动设置。此标头通常没有意义，由库和框架设置，使用 `XMLHttpRequest` 发出 HTTP 请求。
   *
   */
  headers?: Readonly<Record<string, any>>;

  /**
   * The time to wait before causing the underlying XMLHttpRequest to timeout. This is only honored if the
   * `async` configuration setting is unset or set to `true`. Defaults to `0`, which is idiomatic for "never timeout".
   *
   * 导致底层 XMLHttpRequest 超时之前的等待时间。这仅在 `async` 配置设置未设置或设置为 `true` 时才生效。默认为 `0` ，这是“永不超时”的惯用语。
   *
   */
  timeout?: number;

  /**
   * The user credentials user name to send with the HTTP request
   *
   * 与 HTTP 请求一起发送的用户凭据用户名
   *
   */
  user?: string;

  /**
   * The user credentials password to send with the HTTP request
   *
   * 与 HTTP 请求一起发送的用户凭据密码
   *
   */
  password?: string;

  /**
   * Whether or not to send the HTTP request as a CORS request.
   * Defaults to `false`.
   *
   * 是否将 HTTP 请求作为 CORS 请求发送。默认为 `false` 。
   *
   * @deprecated Will be removed in version 8. Cross domain requests and what creates a cross
   * domain request, are dictated by the browser, and a boolean that forces it to be cross domain
   * does not make sense. If you need to force cross domain, make sure you're making a secure request,
   * then add a custom header to the request or use `withCredentials`. For more information on what
   * triggers a cross domain request, see the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Requests_with_credentials).
   * In particular, the section on [Simple Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests) is useful
   * for understanding when CORS will not be used.
   *
   * 将在版本 8 中删除。跨域请求和创建跨域请求的内容由浏览器决定，强制它为跨域的布尔值没有意义。如果你需要强制跨域，请确保你发出安全请求，然后向请求添加自定义标头或使用 `withCredentials` 。有关触发跨域请求的更多信息，请参阅[MDN 文档](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Requests_with_credentials)。特别是，[简单请求](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests)部分有助于理解何时不使用 CORS。
   *
   */
  crossDomain?: boolean;

  /**
   * To send user credentials in a CORS request, set to `true`. To exclude user credentials from
   * a CORS request, _OR_ when cookies are to be ignored by the CORS response, set to `false`.
   *
   * 要在 CORS 请求中发送用户凭据，请设置为 `true` 。要从 CORS 请求中排除用户凭据，_ 或者 _ 当 CORS 响应忽略 cookie 时，请设置为 `false` 。
   *
   * Defaults to `false`.
   *
   * 默认为 `false` 。
   *
   */
  withCredentials?: boolean;

  /**
   * The name of your site's XSRF cookie.
   *
   * 你网站的 XSRF cookie 的名称。
   *
   */
  xsrfCookieName?: string;

  /**
   * The name of a custom header that you can use to send your XSRF cookie.
   *
   * 可用于发送 XSRF cookie 的自定义标头的名称。
   *
   */
  xsrfHeaderName?: string;

  /**
   * Can be set to change the response type.
   * Valid values are `"arraybuffer"`, `"blob"`, `"document"`, `"json"`, and `"text"`.
   * Note that the type of `"document"` (such as an XML document) is ignored if the global context is
   * not `Window`.
   *
   * 可以设置更改响应类型。有效值为 `"arraybuffer"` 、 `"blob"` 、 `"document"` 、 `"json"` 和 `"text"` 。请注意，如果全局上下文不是 `Window` ，则忽略 `"document"` 的类型（例如 XML 文档）。
   *
   * Defaults to `"json"`.
   *
   * 默认为 `"json"` 。
   *
   */
  responseType?: XMLHttpRequestResponseType;

  /**
   * An optional factory used to create the XMLHttpRequest object used to make the AJAX request.
   * This is useful in environments that lack `XMLHttpRequest`, or in situations where you
   * wish to override the default `XMLHttpRequest` for some reason.
   *
   * 用于创建用于发出 AJAX 请求的 XMLHttpRequest 对象的可选工厂。这在缺少 `XMLHttpRequest` 的环境中或在出于某种原因希望覆盖默认 `XMLHttpRequest` 的情况下很有用。
   *
   * If not provided, the `XMLHttpRequest` in global scope will be used.
   *
   * 如果未提供，将使用全局范围内的 `XMLHttpRequest` 。
   *
   * NOTE: This AJAX implementation relies on the built-in serialization and setting
   * of Content-Type headers that is provided by standards-compliant XMLHttpRequest implementations,
   * be sure any implementation you use meets that standard.
   *
   * 注意：此 AJAX 实现依赖于标准兼容 XMLHttpRequest 实现提供的内置序列化和 Content-Type 标头设置，请确保你使用的任何实现都符合该标准。
   *
   */
  createXHR?: () => XMLHttpRequest;

  /**
   * An observer for watching the upload progress of an HTTP request. Will
   * emit progress events, and completes on the final upload load event, will error for
   * any XHR error or timeout.
   *
   * 用于观察 HTTP 请求的上传进度的观察者。将发出进度事件，并在最终上传加载事件时完成，任何 XHR 错误或超时都会出错。
   *
   * This will **not** error for errored status codes. Rather, it will always _complete_ when
   * the HTTP response comes back.
   *
   * 对于错误的状态代码，这**不会**出错。相反，它总是在 HTTP 响应返回时 _ 完成 _。
   *
   * @deprecated If you're looking for progress events, use {@link includeDownloadProgress} and
   * {@link includeUploadProgress} instead. Will be removed in v8.
   *
   * 如果你要查找进度事件，请改用 {@link includeDownloadProgress} 和 {@link includeUploadProgress}。将在 v8 中删除。
   *
   */
  progressSubscriber?: PartialObserver<ProgressEvent>;

  /**
   * If `true`, will emit all download progress and load complete events as {@link AjaxResponse}
   * from the observable. The final download event will also be emitted as a {@link AjaxResponse}.
   *
   * 如果为 `true` ，将发出所有下载进度并从 observable 以 {@link AjaxResponse} 的形式加载完成事件。最终的下载事件也将作为 {@link AjaxResponse} 发出。
   *
   * If both this and {@link includeUploadProgress} are `false`, then only the {@link AjaxResponse} will
   * be emitted from the resulting observable.
   *
   * 如果 this 和 {@link includeUploadProgress} 都是 `false` ，那么只有 {@link AjaxResponse} 将从结果 observable 中发出。
   *
   */
  includeDownloadProgress?: boolean;

  /**
   * If `true`, will emit all upload progress and load complete events as {@link AjaxResponse}
   * from the observable. The final download event will also be emitted as a {@link AjaxResponse}.
   *
   * 如果为 `true` ，将发出所有上传进度并从 observable 以 {@link AjaxResponse} 的形式加载完成事件。最终的下载事件也将作为 {@link AjaxResponse} 发出。
   *
   * If both this and {@link includeDownloadProgress} are `false`, then only the {@link AjaxResponse} will
   * be emitted from the resulting observable.
   *
   * 如果 this 和 {@link includeDownloadProgress} 都是 `false` ，那么只有 {@link AjaxResponse} 将从结果 observable 中发出。
   *
   */
  includeUploadProgress?: boolean;

  /**
   * Query string parameters to add to the URL in the request.
   * <em>This will require a polyfill for `URL` and `URLSearchParams` in Internet Explorer!</em>
   *
   * 查询字符串参数添加到请求中的 URL。*这将需要 Internet Explorer 中 `URL` 和 `URLSearchParams` 的 polyfill！*
   *
   * Accepts either a query string, a `URLSearchParams` object, a dictionary of key/value pairs, or an
   * array of key/value entry tuples. (Essentially, it takes anything that `new URLSearchParams` would normally take).
   *
   * 接受查询字符串、 `URLSearchParams` 对象、键/值对字典或键/值条目元组数组。 （本质上，它需要 `new URLSearchParams` 通常需要的任何东西）。
   *
   * If, for some reason you have a query string in the `url` argument, this will append to the query string in the url,
   * but it will also overwrite the value of any keys that are an exact match. In other words, a url of `/test?a=1&b=2`,
   * with queryParams of `{ b: 5, c: 6 }` will result in a url of roughly `/test?a=1&b=5&c=6`.
   *
   * 如果由于某种原因在 `url` 参数中有一个查询字符串，这将附加到 url 中的查询字符串，但它也会覆盖任何完全匹配的键的值。换句话说， `/test?a=1&b=2` 的 url 和 `{ b: 5, c: 6 }` 的 queryParams 将导致大致 `/test?a=1&b=5&c=6` 的 url。
   *
   */
  queryParams?:
    | string
    | URLSearchParams
    | Record<string, string | number | boolean | string[] | number[] | boolean[]>
    | [string, string | number | boolean | string[] | number[] | boolean[]][];
}
