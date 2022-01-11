import { Observable } from '../Observable';
import { innerFrom } from '../observable/innerFrom';
import { Subject } from '../Subject';
import { ObservableInput, Observer, OperatorFunction, SubjectLike } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

export interface BasicGroupByOptions<K, T> {
  element?: undefined;
  duration?: (grouped: GroupedObservable<K, T>) => ObservableInput<any>;
  connector?: () => SubjectLike<T>;
}

export interface GroupByOptionsWithElement<K, E, T> {
  element: (value: T) => E;
  duration?: (grouped: GroupedObservable<K, E>) => ObservableInput<any>;
  connector?: () => SubjectLike<E>;
}

export function groupBy<T, K>(key: (value: T) => K, options: BasicGroupByOptions<K, T>): OperatorFunction<T, GroupedObservable<K, T>>;

export function groupBy<T, K, E>(
  key: (value: T) => K,
  options: GroupByOptionsWithElement<K, E, T>
): OperatorFunction<T, GroupedObservable<K, E>>;

export function groupBy<T, K extends T>(
  key: (value: T) => value is K
): OperatorFunction<T, GroupedObservable<true, K> | GroupedObservable<false, Exclude<T, K>>>;

export function groupBy<T, K>(key: (value: T) => K): OperatorFunction<T, GroupedObservable<K, T>>;

/**
 * @deprecated use the options parameter instead.
 *
 * 请改用 options 参数。
 *
 */
export function groupBy<T, K>(
  key: (value: T) => K,
  element: void,
  duration: (grouped: GroupedObservable<K, T>) => Observable<any>
): OperatorFunction<T, GroupedObservable<K, T>>;

/**
 * @deprecated use the options parameter instead.
 *
 * 请改用 options 参数。
 *
 */
export function groupBy<T, K, R>(
  key: (value: T) => K,
  element?: (value: T) => R,
  duration?: (grouped: GroupedObservable<K, R>) => Observable<any>
): OperatorFunction<T, GroupedObservable<K, R>>;

/**
 * Groups the items emitted by an Observable according to a specified criterion,
 * and emits these grouped items as `GroupedObservables`, one
 * {@link GroupedObservable} per group.
 *
 * 根据指定的标准对 Observable 发出的项目进行分组，并将这些分组的项目作为 `GroupedObservables` 发出，每组一个 {@link GroupedObservable}。
 *
 * ![](groupBy.png)
 *
 * When the Observable emits an item, a key is computed for this item with the key function.
 *
 * 当 Observable 发出一个项目时，使用 key 函数为这个项目计算一个键。
 *
 * If a {@link GroupedObservable} for this key exists, this {@link GroupedObservable} emits. Otherwise, a new
 * {@link GroupedObservable} for this key is created and emits.
 *
 * 如果此键的 {@link GroupedObservable} 存在，则此 {@link GroupedObservable} 发出。否则，将为该键创建一个新的 {@link GroupedObservable} 并发出。
 *
 * A {@link GroupedObservable} represents values belonging to the same group represented by a common key. The common
 * key is available as the `key` field of a {@link GroupedObservable} instance.
 *
 * {@link GroupedObservable} 表示属于由公共键表示的同一组的值。公共键可用作 {@link GroupedObservable} 实例的 `key` 字段。
 *
 * The elements emitted by {@link GroupedObservable}s are by default the items emitted by the Observable, or elements
 * returned by the element function.
 *
 * {@link GroupedObservable} 发出的元素默认是 Observable 发出的项目，或者是 element 函数返回的元素。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Group objects by `id` and return as array
 *
 * 按 `id` 对对象进行分组并以数组形式返回
 *
 * ```ts
 * import { of, groupBy, mergeMap, reduce } from 'rxjs';
 *
 * of(
 *   { id: 1, name: 'JavaScript' },
 *   { id: 2, name: 'Parcel' },
 *   { id: 2, name: 'webpack' },
 *   { id: 1, name: 'TypeScript' },
 *   { id: 3, name: 'TSLint' }
 * ).pipe(
 *   groupBy(p => p.id),
 *   mergeMap(group$ => group$.pipe(reduce((acc, cur) => [...acc, cur], [])))
 * )
 * .subscribe(p => console.log(p));
 *
 * // displays:
 * // [{ id: 1, name: 'JavaScript' }, { id: 1, name: 'TypeScript'}]
 * // [{ id: 2, name: 'Parcel' }, { id: 2, name: 'webpack'}]
 * // [{ id: 3, name: 'TSLint' }]
 * ```
 *
 * Pivot data on the `id` field
 *
 * 在 `id` 字段上透视数据
 *
 * ```ts
 * import { of, groupBy, mergeMap, reduce, map } from 'rxjs';
 *
 * of(
 *   { id: 1, name: 'JavaScript' },
 *   { id: 2, name: 'Parcel' },
 *   { id: 2, name: 'webpack' },
 *   { id: 1, name: 'TypeScript' },
 *   { id: 3, name: 'TSLint' }
 * ).pipe(
 *   groupBy(p => p.id, { element: p => p.name }),
 *   mergeMap(group$ => group$.pipe(reduce((acc, cur) => [...acc, cur], [`${ group$.key }`]))),
 *   map(arr => ({ id: parseInt(arr[0], 10), values: arr.slice(1) }))
 * )
 * .subscribe(p => console.log(p));
 *
 * // displays:
 * // { id: 1, values: [ 'JavaScript', 'TypeScript' ] }
 * // { id: 2, values: [ 'Parcel', 'webpack' ] }
 * // { id: 3, values: [ 'TSLint' ] }
 * ```
 * @param key A function that extracts the key
 * for each item.
 *
 * 为每个项目提取密钥的函数。
 *
 * @param element A function that extracts the
 * return element for each item.
 *
 * 提取每个项目的返回元素的函数。
 *
 * @param duration
 * A function that returns an Observable to determine how long each group should
 * exist.
 *
 * 一个返回 Observable 以确定每个组应该存在多长时间的函数。
 *
 * @param connector Factory function to create an
 * intermediate Subject through which grouped elements are emitted.
 *
 * 工厂函数创建一个中间主题，通过该主题发出分组元素。
 *
 * @return A function that returns an Observable that emits GroupedObservables,
 * each of which corresponds to a unique key value and each of which emits
 * those items from the source Observable that share that key value.
 *
 * 一个函数，它返回一个发出 GroupedObservables 的 Observable，每个都对应一个唯一的键值，每个都从源 Observable 发出共享该键值的那些项目。
 *
 * @deprecated Use the options parameter instead.
 *
 * 请改用 options 参数。
 *
 */
export function groupBy<T, K, R>(
  key: (value: T) => K,
  element?: (value: T) => R,
  duration?: (grouped: GroupedObservable<K, R>) => Observable<any>,
  connector?: () => Subject<R>
): OperatorFunction<T, GroupedObservable<K, R>>;

// Impl
export function groupBy<T, K, R>(
  keySelector: (value: T) => K,
  elementOrOptions?: ((value: any) => any) | void | BasicGroupByOptions<K, T> | GroupByOptionsWithElement<K, R, T>,
  duration?: (grouped: GroupedObservable<any, any>) => ObservableInput<any>,
  connector?: () => SubjectLike<any>
): OperatorFunction<T, GroupedObservable<K, R>> {
  return operate((source, subscriber) => {
    let element: ((value: any) => any) | void;
    if (!elementOrOptions || typeof elementOrOptions === 'function') {
      element = elementOrOptions;
    } else {
      ({ duration, element, connector } = elementOrOptions);
    }

    // A lookup for the groups that we have so far.
    const groups = new Map<K, SubjectLike<any>>();

    // Used for notifying all groups and the subscriber in the same way.
    const notify = (cb: (group: Observer<any>) => void) => {
      groups.forEach(cb);
      cb(subscriber);
    };

    // Used to handle errors from the source, AND errors that occur during the
    // next call from the source.
    const handleError = (err: any) => notify((consumer) => consumer.error(err));

    // Capturing a reference to this, because we need a handle to it
    // in `createGroupedObservable` below. This is what we use to
    // subscribe to our source observable. This sometimes needs to be unsubscribed
    // out-of-band with our `subscriber` which is the downstream subscriber, or destination,
    // in cases where a user unsubscribes from the main resulting subscription, but
    // still has groups from this subscription subscribed and would expect values from it
    // Consider:  `source.pipe(groupBy(fn), take(2))`.
    const groupBySourceSubscriber = new GroupBySubscriber(
      subscriber,
      (value: T) => {
        // Because we have to notify all groups of any errors that occur in here,
        // we have to add our own try/catch to ensure that those errors are propagated.
        // OperatorSubscriber will only send the error to the main subscriber.
        try {
          const key = keySelector(value);

          let group = groups.get(key);
          if (!group) {
            // Create our group subject
            groups.set(key, (group = connector ? connector() : new Subject<any>()));

            // Emit the grouped observable. Note that we can't do a simple `asObservable()` here,
            // because the grouped observable has special semantics around reference counting
            // to ensure we don't sever our connection to the source prematurely.
            const grouped = createGroupedObservable(key, group);
            subscriber.next(grouped);

            if (duration) {
              const durationSubscriber = new OperatorSubscriber(
                // Providing the group here ensures that it is disposed of -- via `unsubscribe` --
                // wnen the duration subscription is torn down. That is important, because then
                // if someone holds a handle to the grouped observable and tries to subscribe to it
                // after the connection to the source has been severed, they will get an
                // `ObjectUnsubscribedError` and know they can't possibly get any notifications.
                group as any,
                () => {
                  // Our duration notified! We can complete the group.
                  // The group will be removed from the map in the teardown phase.
                  group!.complete();
                  durationSubscriber?.unsubscribe();
                },
                // Completions are also sent to the group, but just the group.
                undefined,
                // Errors on the duration subscriber are sent to the group
                // but only the group. They are not sent to the main subscription.
                undefined,
                // Teardown: Remove this group from our map.
                () => groups.delete(key)
              );

              // Start our duration notifier.
              groupBySourceSubscriber.add(innerFrom(duration(grouped)).subscribe(durationSubscriber));
            }
          }

          // Send the value to our group.
          group.next(element ? element(value) : value);
        } catch (err) {
          handleError(err);
        }
      },
      // Source completes.
      () => notify((consumer) => consumer.complete()),
      // Error from the source.
      handleError,
      // Free up memory.
      // When the source subscription is _finally_ torn down, release the subjects and keys
      // in our groups Map, they may be quite large and we don't want to keep them around if we
      // don't have to.
      () => groups.clear()
    );

    // Subscribe to the source
    source.subscribe(groupBySourceSubscriber);

    /**
     * Creates the actual grouped observable returned.
     *
     * 创建返回的实际分组的 observable。
     *
     * @param key The key of the group
     *
     * 小组的钥匙
     *
     * @param groupSubject The subject that fuels the group
     *
     * 推动小组的主题
     *
     */
    function createGroupedObservable(key: K, groupSubject: SubjectLike<any>) {
      const result: any = new Observable<T>((groupSubscriber) => {
        groupBySourceSubscriber.activeGroups++;
        const innerSub = groupSubject.subscribe(groupSubscriber);
        return () => {
          innerSub.unsubscribe();
          // We can kill the subscription to our source if we now have no more
          // active groups subscribed, and a teardown was already attempted on
          // the source.
          --groupBySourceSubscriber.activeGroups === 0 &&
            groupBySourceSubscriber.teardownAttempted &&
            groupBySourceSubscriber.unsubscribe();
        };
      });
      result.key = key;
      return result;
    }
  });
}

/**
 * This was created because groupBy is a bit unique, in that emitted groups that have
 * subscriptions have to keep the subscription to the source alive until they
 * are torn down.
 *
 * 创建它是因为 groupBy 有点独特，因为具有订阅的发出组必须保持对源的订阅处于活动状态，直到它们被拆除。
 *
 */
class GroupBySubscriber<T> extends OperatorSubscriber<T> {
  /**
   * The number of actively subscribed groups
   *
   * 积极订阅的群组数
   *
   */
  activeGroups = 0;
  /**
   * Whether or not teardown was attempted on this subscription.
   *
   * 是否尝试对此订阅进行拆卸。
   *
   */
  teardownAttempted = false;

  unsubscribe() {
    this.teardownAttempted = true;
    // We only kill our subscription to the source if we have
    // no active groups. As stated above, consider this scenario:
    // source$.pipe(groupBy(fn), take(2)).
    this.activeGroups === 0 && super.unsubscribe();
  }
}

/**
 * An observable of values that is the emitted by the result of a {@link groupBy} operator,
 * contains a `key` property for the grouping.
 *
 * 由 {@link groupBy} 运算符的结果发出的可观察值包含分组的 `key` 属性。
 *
 */
export interface GroupedObservable<K, T> extends Observable<T> {
  /**
   * The key value for the grouped notifications.
   *
   * 分组通知的键值。
   *
   */
  readonly key: K;
}
