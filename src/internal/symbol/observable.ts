/**
 * Symbol.observable or a string "@@observable". Used for interop
 *
 * Symbol.observable 或字符串 “@@observable”。用于互操作
 *
 * @deprecated We will no longer be exporting this symbol in upcoming versions of RxJS.
 * Instead polyfill and use Symbol.observable directly *or* use https://www.npmjs.com/package/symbol-observable
 *
 * 在未来的 RxJS 版本中，我们不会再导出此符号。而是使用腻子脚本，并直接使用 Symbol.observable *或* 使用 https://www.npmjs.com/package/symbol-observable
 *
 */
export const observable: string | symbol = (() => (typeof Symbol === 'function' && Symbol.observable) || '@@observable')();
