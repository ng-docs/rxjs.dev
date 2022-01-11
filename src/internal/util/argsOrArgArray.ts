const { isArray } = Array;

/**
 * Used in operators and functions that accept either a list of arguments, or an array of arguments
 * as a single argument.
 *
 * 用于接受参数列表或参数数组作为单个参数的操作符和函数。
 *
 */
export function argsOrArgArray<T>(args: (T | T[])[]): T[] {
  return args.length === 1 && isArray(args[0]) ? args[0] : (args as T[]);
}
