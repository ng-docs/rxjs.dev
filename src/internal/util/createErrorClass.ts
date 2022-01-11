/**
 * Used to create Error subclasses until the community moves away from ES5.
 *
 * 用于创建错误子类，直到社区远离 ES5。
 *
 * This is because compiling from TypeScript down to ES5 has issues with subclassing Errors
 * as well as other built-in types: <https://github.com/Microsoft/TypeScript/issues/12123>
 *
 * 这是因为从 TypeScript 编译到 ES5 存在子类化错误以及其他内置类型的问题： [https](https://github.com/Microsoft/TypeScript/issues/12123) ://github.com/Microsoft/TypeScript/issues/12123
 *
 * @param createImpl A factory function to create the actual constructor implementation. The returned
 * function should be a named function that calls `_super` internally.
 *
 * 用于创建实际构造函数实现的工厂函数。返回的函数应该是一个在内部调用 `_super` 的命名函数。
 *
 */
export function createErrorClass<T>(createImpl: (_super: any) => any): T {
  const _super = (instance: any) => {
    Error.call(instance);
    instance.stack = new Error().stack;
  };

  const ctorFunc = createImpl(_super);
  ctorFunc.prototype = Object.create(Error.prototype);
  ctorFunc.prototype.constructor = ctorFunc;
  return ctorFunc;
}
