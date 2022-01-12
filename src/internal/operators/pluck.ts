import { map } from './map';
import { OperatorFunction } from '../types';

/* tslint:disable:max-line-length */
export function pluck<T, K1 extends keyof T>(k1: K1): OperatorFunction<T, T[K1]>;
export function pluck<T, K1 extends keyof T, K2 extends keyof T[K1]>(k1: K1, k2: K2): OperatorFunction<T, T[K1][K2]>;
export function pluck<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
  k1: K1,
  k2: K2,
  k3: K3
): OperatorFunction<T, T[K1][K2][K3]>;
export function pluck<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
  k1: K1,
  k2: K2,
  k3: K3,
  k4: K4
): OperatorFunction<T, T[K1][K2][K3][K4]>;
export function pluck<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
  K5 extends keyof T[K1][K2][K3][K4]
>(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5): OperatorFunction<T, T[K1][K2][K3][K4][K5]>;
export function pluck<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
  K5 extends keyof T[K1][K2][K3][K4],
  K6 extends keyof T[K1][K2][K3][K4][K5]
>(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6): OperatorFunction<T, T[K1][K2][K3][K4][K5][K6]>;
export function pluck<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
  K5 extends keyof T[K1][K2][K3][K4],
  K6 extends keyof T[K1][K2][K3][K4][K5]
>(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, ...rest: string[]): OperatorFunction<T, unknown>;
export function pluck<T>(...properties: string[]): OperatorFunction<T, unknown>;
/* tslint:enable:max-line-length */

/**
 * Maps each source value to its specified nested property.
 *
 * 将每个源值映射到其指定的嵌套属性。
 *
 * <span class="informal">Like {@link map}, but meant only for picking one of
 * the nested properties of every emitted value.</span>
 *
 * <span class="informal">与 {@link map} 类似，但仅用于选择每个发出值的嵌套属性之一。</span>
 *
 * ![](pluck.png)
 *
 * Given a list of strings or numbers describing a path to a property, retrieves
 * the value of a specified nested property from all values in the source
 * Observable. If a property can't be resolved, it will return `undefined` for
 * that value.
 *
 * 给定描述属性路径的字符串或数字列表，从源 Observable 中的所有值中检索指定嵌套属性的值。如果无法解析某个属性，它将返回该值的 `undefined` 。
 *
 * ## Example
 *
 * ## 例子
 *
 * Map every click to the tagName of the clicked target element
 *
 * 将每次点击映射到点击的目标元素的 tagName
 *
 * ```ts
 * import { fromEvent, pluck } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const tagNames = clicks.pipe(pluck('target', 'tagName'));
 *
 * tagNames.subscribe(x => console.log(x));
 * ```
 * @see {@link map}
 * @param properties The nested properties to pluck from each source
 * value.
 *
 * 要从每个源值中提取的嵌套属性。
 *
 * @return A function that returns an Observable of property values from the
 * source values.
 *
 * 从源值返回属性值的 Observable 的函数。
 *
 * @deprecated Use {@link map} and optional chaining: `pluck('foo', 'bar')` is `map(x => x?.foo?.bar)`. Will be removed in v8.
 *
 * 使用 {@link map} 和可选链接： `pluck('foo', 'bar')` is `map(x => x?.foo?.bar)` 。将在 v8 中删除。
 *
 */
export function pluck<T, R>(...properties: Array<string | number | symbol>): OperatorFunction<T, R> {
  const length = properties.length;
  if (length === 0) {
    throw new Error('list of properties cannot be empty.');
  }
  return map((x) => {
    let currentProp: any = x;
    for (let i = 0; i < length; i++) {
      const p = currentProp?.[properties[i]];
      if (typeof p !== 'undefined') {
        currentProp = p;
      } else {
        return undefined;
      }
    }
    return currentProp;
  });
}
