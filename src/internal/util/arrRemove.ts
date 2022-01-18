/**
 * Removes an item from an array, mutating it.
 *
 * 从数组中删除一个条目，对其进行变异。
 *
 * @param arr The array to remove the item from
 *
 * 要从中删除条目的数组
 *
 * @param item The item to remove
 *
 * 要删除的条目
 *
 */
export function arrRemove<T>(arr: T[] | undefined | null, item: T) {
  if (arr) {
    const index = arr.indexOf(item);
    0 <= index && arr.splice(index, 1);
  }
}
