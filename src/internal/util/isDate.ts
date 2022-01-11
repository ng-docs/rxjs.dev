/**
 * Checks to see if a value is not only a `Date` object,
 * but a *valid* `Date` object that can be converted to a
 * number. For example, `new Date('blah')` is indeed an
 * `instanceof Date`, however it cannot be converted to a
 * number.
 *
 * 检查一个值是否不仅是 `Date` 对象，而且是可以转换为数字的*有效*`Date` 对象。例如，`new Date('blah')` 确实是一个 `instanceof Date`，但是它不能转换为数字。
 *
 */
export function isValidDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value as any);
}
