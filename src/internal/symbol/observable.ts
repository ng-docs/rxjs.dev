/**
 * Symbol.observable or a string "@@observable". Used for interop
 *
 * Symbol.observable 或字符串“@@observable”。用于互操作
 *
 */
export const observable: string | symbol = (() => (typeof Symbol === 'function' && Symbol.observable) || '@@observable')();
