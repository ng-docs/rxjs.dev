const { isArray } = Array;
const { getPrototypeOf, prototype: objectProto, keys: getKeys } = Object;

/**
 * Used in functions where either a list of arguments, a single array of arguments, or a
 * dictionary of arguments can be returned. Returns an object with an `args` property with
 * the arguments in an array, if it is a dictionary, it will also return the `keys` in another
 * property.
 *
 * 在可以返回参数列表、单个参数数组或参数字典的函数中使用。返回一个带有 `args` 属性的对象，其参数在一个数组中，如果它是一个字典，它还将返回另一个属性中的 `keys` 。
 *
 */
export function argsArgArrayOrObject<T, O extends Record<string, T>>(args: T[] | [O] | [T[]]): { args: T[]; keys: string[] | null } {
  if (args.length === 1) {
    const first = args[0];
    if (isArray(first)) {
      return { args: first, keys: null };
    }
    if (isPOJO(first)) {
      const keys = getKeys(first);
      return {
        args: keys.map((key) => first[key]),
        keys,
      };
    }
  }

  return { args: args as T[], keys: null };
}

function isPOJO(obj: any): obj is object {
  return obj && typeof obj === 'object' && getPrototypeOf(obj) === objectProto;
}
