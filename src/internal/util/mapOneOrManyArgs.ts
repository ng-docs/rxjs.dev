import { OperatorFunction } from "../types";
import { map } from "../operators/map";

const { isArray } = Array;

function callOrApply<T, R>(fn: ((...values: T[]) => R), args: T|T[]): R {
    return isArray(args) ? fn(...args) : fn(args);
}

/**
 * Used in several -- mostly deprecated -- situations where we need to
 * apply a list of arguments or a single argument to a result selector.
 *
 * 在我们需要将参数列表或单个参数应用于结果选择器的几种情况下使用 - 大部分已弃用。
 *
 */
export function mapOneOrManyArgs<T, R>(fn: ((...values: T[]) => R)): OperatorFunction<T|T[], R> {
    return map(args => callOrApply(fn, args))
}
