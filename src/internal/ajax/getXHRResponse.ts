/**
 * Gets what should be in the `response` property of the XHR. However,
 * since we still support the final versions of IE, we need to do a little
 * checking here to make sure that we get the right thing back. Conquentally,
 * we need to do a JSON.parse() in here, which *could* throw if the response
 * isn't valid JSON.
 *
 * 获取 XHR 的 `response` 属性中应包含的内容。但是，由于我们仍然支持 IE 的最终版本，因此我们需要在这里做一些检查，以确保我们得到正确的东西。最后，我们需要在这里执行 JSON.parse()，如果响应不是有效的 JSON，它*可能会*抛出。
 *
 * This is used both in creating an AjaxResponse, and in creating certain errors
 * that we throw, so we can give the user whatever was in the response property.
 *
 * 这既用于创建 AjaxResponse，也用于创建我们抛出的某些错误，因此我们可以为用户提供响应属性中的任何内容。
 *
 * @param xhr The XHR to examine the response of
 *
 * XHR 检查响应
 *
 */
export function getXHRResponse(xhr: XMLHttpRequest) {
  switch (xhr.responseType) {
    case 'json': {
      if ('response' in xhr) {
        return xhr.response;
      } else {
        // IE
        const ieXHR: any = xhr;
        return JSON.parse(ieXHR.responseText);
      }
    }
    case 'document':
      return xhr.responseXML;
    case 'text':
    default: {
      if ('response' in xhr) {
        return xhr.response;
      } else {
        // IE
        const ieXHR: any = xhr;
        return ieXHR.responseText;
      }
    }
  }
}
