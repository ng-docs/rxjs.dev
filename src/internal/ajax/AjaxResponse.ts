import { AjaxRequest, AjaxResponseType } from './types';
import { getXHRResponse } from './getXHRResponse';

/**
 * A normalized response from an AJAX request. To get the data from the response,
 * you will want to read the `response` property.
 *
 * - DO NOT create instances of this class directly.
 *
 *   不要直接创建此类的实例。
 *
 * - DO NOT subclass this class.
 *
 *   不要子类这个类。
 *
 * It is advised not to hold this object in memory, as it has a reference to
 * the original XHR used to make the request, as well as properties containing
 * request and response data.
 *
 * 建议不要将此对象保存在内存中，因为它引用了用于发出请求的原始 XHR，以及包含请求和响应数据的属性。
 *
 * @see {@link ajax}
 * @see {@link AjaxConfig}
 */
export class AjaxResponse<T> {
  /**
   * The HTTP status code
   *
   * HTTP 状态码
   *
   */
  readonly status: number;

  /**
   * The response data, if any. Note that this will automatically be converted to the proper type
   *
   * 响应数据（如果有）。请注意，这将自动转换为正确的类型
   *
   */
  readonly response: T;

  /**
   * The responseType set on the request. (For example: `""`, `"arraybuffer"`, `"blob"`, `"document"`, `"json"`, or `"text"`)
   *
   * 在请求上设置的 responseType。（例如： `""`、`"arraybuffer"`、`"blob"`、`"document"`、`"json"` 或 `"text"`）
   *
   * @deprecated There isn't much reason to examine this. It's the same responseType set (or defaulted) on the ajax config.
   * If you really need to examine this value, you can check it on the `request` or the `xhr`. Will be removed in v8.
   *
   * 没有太多理由去研究这个。它与 ajax 配置上的相同 responseType 设置（或默认设置）。如果你真的需要检查这个值，你可以在 `request` 或 `xhr` 上检查它。将在 v8 中删除。
   *
   */
  readonly responseType: XMLHttpRequestResponseType;

  /**
   * The total number of bytes loaded so far. To be used with {@link total} while
   * calculating progress. (You will want to set {@link includeDownloadProgress} or
   * {@link includeDownloadProgress})
   *
   * 到目前为止加载的字节总数。在计算进度时与 {@link total} 一起使用。（你需要设置 {@link includeDownloadProgress} 或 {@link includeDownloadProgress}）
   *
   */
  readonly loaded: number;

  /**
   * The total number of bytes to be loaded. To be used with {@link loaded} while
   * calculating progress. (You will want to set {@link includeDownloadProgress} or
   * {@link includeDownloadProgress})
   *
   * 要加载的总字节数。在计算进度时与 {@link loaded} 一起使用。（你需要设置 {@link includeDownloadProgress} 或 {@link includeDownloadProgress}）
   *
   */
  readonly total: number;

  /**
   * A dictionary of the response headers.
   *
   * 响应标头的字典。
   *
   */
  readonly responseHeaders: Record<string, string>;

  /**
   * A normalized response from an AJAX request. To get the data from the response,
   * you will want to read the `response` property.
   *
   * 来自 AJAX 请求的规范化响应。要从响应中获取数据，你需要读取 `response` 属性。
   *
   * - DO NOT create instances of this class directly.
   *
   *   不要直接创建此类的实例。
   *
   * - DO NOT subclass this class.
   *
   *   不要子类这个类。
   *
   * @param originalEvent The original event object from the XHR `onload` event.
   *
   * XHR `onload` 事件中的原始事件对象。
   *
   * @param xhr The `XMLHttpRequest` object used to make the request. This is useful for examining status code, etc.
   *
   * 用于发出请求的 `XMLHttpRequest` 对象。这对于检查状态代码等很有用。
   *
   * @param request The request settings used to make the HTTP request.
   *
   * 用于发出 HTTP 请求的请求设置。
   *
   * @param type The type of the event emitted by the {@link ajax} Observable
   *
   * {@link ajax} Observable 发出的事件类型
   *
   */
  constructor(
    /**
     * The original event object from the raw XHR event.
     */
    public readonly originalEvent: ProgressEvent,
    /**
     * The XMLHttpRequest object used to make the request.
     * NOTE: It is advised not to hold this in memory, as it will retain references to all of it's event handlers
     * and many other things related to the request.
     */
    public readonly xhr: XMLHttpRequest,
    /**
     * The request parameters used to make the HTTP request.
     */
    public readonly request: AjaxRequest,
    /**
     * The event type. This can be used to discern between different events
     * if you're using progress events with {@link includeDownloadProgress} or
     * {@link includeUploadProgress} settings in {@link AjaxConfig}.
     *
     * The event type consists of two parts: the {@link AjaxDirection} and the
     * the event type. Merged with `_`, they form the `type` string. The
     * direction can be an `upload` or a `download` direction, while an event can
     * be `loadstart`, `progress` or `load`.
     *
     * `download_load` is the type of event when download has finished and the
     * response is available.
     */
    public readonly type: AjaxResponseType = 'download_load'
  ) {
    const { status, responseType } = xhr;
    this.status = status ?? 0;
    this.responseType = responseType ?? '';

    // Parse the response headers in advance for the user. There's really
    // not a great way to get all of them. So we need to parse the header string
    // we get back. It comes in a simple enough format:
    //
    // header-name: value here
    // content-type: application/json
    // other-header-here: some, other, values, or, whatever
    const allHeaders = xhr.getAllResponseHeaders();
    this.responseHeaders = allHeaders
      ? // Split the header text into lines
        allHeaders.split('\n').reduce((headers: Record<string, string>, line) => {
          // Split the lines on the first ": " as
          // "key: value". Note that the value could
          // technically have a ": " in it.
          const index = line.indexOf(': ');
          headers[line.slice(0, index)] = line.slice(index + 2);
          return headers;
        }, {})
      : {};

    this.response = getXHRResponse(xhr);
    const { loaded, total } = originalEvent;
    this.loaded = loaded;
    this.total = total;
  }
}
