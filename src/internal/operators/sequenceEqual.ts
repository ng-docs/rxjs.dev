import { Observable } from '../Observable';

import { OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Compares all values of two observables in sequence using an optional comparator function
 * and returns an observable of a single boolean value representing whether or not the two sequences
 * are equal.
 *
 * 使用可选的比较器函数按顺序比较两个可观察对象的所有值，并返回表示两个序列是否相等的单个布尔值的可观察对象。
 *
 * <span class="informal">Checks to see of all values emitted by both observables are equal, in order.</span>
 *
 * 按顺序检查两个可观察对象发出的所有值是否相等。
 *
 * ![](sequenceEqual.png)
 *
 * `sequenceEqual` subscribes to two observables and buffers incoming values from each observable. Whenever either
 * observable emits a value, the value is buffered and the buffers are shifted and compared from the bottom
 * up; If any value pair doesn't match, the returned observable will emit `false` and complete. If one of the
 * observables completes, the operator will wait for the other observable to complete; If the other
 * observable emits before completing, the returned observable will emit `false` and complete. If one observable never
 * completes or emits after the other completes, the returned observable will never complete.
 *
 * `sequenceEqual` 订阅两个 observable 并缓冲来自每个 observable 的传入值。每当任何一个 observable 发出一个值时，该值都会被缓冲，并且缓冲区会从底部向上移动和比较；如果任何值对不匹配，则返回的 observable 将发出 `false` 并完成。如果其中一个 observable 完成，则操作员将等待另一个 observable 完成；如果其他 observable 在完成之前发出，则返回的 observable 将发出 `false` 并完成。如果一个 observable 从未完成或在另一个完成后发出，则返回的 observable 将永远不会完成。
 *
 * ## Example
 *
 * ## 例子
 *
 * Figure out if the Konami code matches
 *
 * 确定 Konami 代码是否匹配
 *
 * ```ts
 * import { from, fromEvent, map, bufferCount, mergeMap, sequenceEqual } from 'rxjs';
 *
 * const codes = from([
 *   'ArrowUp',
 *   'ArrowUp',
 *   'ArrowDown',
 *   'ArrowDown',
 *   'ArrowLeft',
 *   'ArrowRight',
 *   'ArrowLeft',
 *   'ArrowRight',
 *   'KeyB',
 *   'KeyA',
 *   'Enter', // no start key, clearly.
 * ]);
 *
 * const keys = fromEvent<KeyboardEvent>(document, 'keyup').pipe(map(e => e.code));
 * const matches = keys.pipe(
 *   bufferCount(11, 1),
 *   mergeMap(last11 => from(last11).pipe(sequenceEqual(codes)))
 * );
 * matches.subscribe(matched => console.log('Successful cheat at Contra? ', matched));
 * ```
 * @see {@link combineLatest}
 * @see {@link zip}
 * @see {@link withLatestFrom}
 * @param {Observable} compareTo The observable sequence to compare the source sequence to.
 *
 * 与源序列进行比较的可观察序列。
 *
 * @param {function} [comparator] An optional function to compare each value pair
 * @return A function that returns an Observable that emits a single boolean
 * value representing whether or not the values emitted by the source
 * Observable and provided Observable were equal in sequence.
 *
 * 一个返回 Observable 的函数，该函数发出一个布尔值，表示源 Observable 发出的值和提供的 Observable 发出的值是否按顺序相等。
 *
 */
export function sequenceEqual<T>(
  compareTo: Observable<T>,
  comparator: (a: T, b: T) => boolean = (a, b) => a === b
): OperatorFunction<T, boolean> {
  return operate((source, subscriber) => {
    // The state for the source observable
    const aState = createState<T>();
    // The state for the compareTo observable;
    const bState = createState<T>();

    /**
     * A utility to emit and complete
     *
     * 发出和完成的实用程序
     *
     */
    const emit = (isEqual: boolean) => {
      subscriber.next(isEqual);
      subscriber.complete();
    };

    /**
     * Creates a subscriber that subscribes to one of the sources, and compares its collected
     * state -- `selfState` -- to the other source's collected state -- `otherState`. This
     * is used for both streams.
     *
     * 创建订阅其中一个源的订阅者，并将其收集状态 - `selfState` - 与另一个源的收集状态 - `otherState` 。这用于两个流。
     *
     */
    const createSubscriber = (selfState: SequenceState<T>, otherState: SequenceState<T>) => {
      const sequenceEqualSubscriber = new OperatorSubscriber(
        subscriber,
        (a: T) => {
          const { buffer, complete } = otherState;
          if (buffer.length === 0) {
            // If there's no values in the other buffer
            // and the other stream is complete, we know
            // this isn't a match, because we got one more value.
            // Otherwise, we push onto our buffer, so when the other
            // stream emits, it can pull this value off our buffer and check it
            // at the appropriate time.
            complete ? emit(false) : selfState.buffer.push(a);
          } else {
            // If the other stream *does* have values in it's buffer,
            // pull the oldest one off so we can compare it to what we
            // just got. If it wasn't a match, emit `false` and complete.
            !comparator(a, buffer.shift()!) && emit(false);
          }
        },
        () => {
          // Or observable completed
          selfState.complete = true;
          const { complete, buffer } = otherState;
          // If the other observable is also complete, and there's
          // still stuff left in their buffer, it doesn't match, if their
          // buffer is empty, then it does match. This is because we can't
          // possibly get more values here anymore.
          complete && emit(buffer.length === 0);
          // Be sure to clean up our stream as soon as possible if we can.
          sequenceEqualSubscriber?.unsubscribe();
        }
      );

      return sequenceEqualSubscriber;
    };

    // Subscribe to each source.
    source.subscribe(createSubscriber(aState, bState));
    compareTo.subscribe(createSubscriber(bState, aState));
  });
}

/**
 * A simple structure for the data used to test each sequence
 *
 * 用于测试每个序列的数据的简单结构
 *
 */
interface SequenceState<T> {
  /**
   * A temporary store for arrived values before they are checked
   *
   * 在检查到达值之前的临时存储
   *
   */
  buffer: T[];
  /**
   * Whether or not the sequence source has completed.
   *
   * 序列源是否已完成。
   *
   */
  complete: boolean;
}

/**
 * Creates a simple structure that is used to represent
 * data used to test each sequence.
 *
 * 创建一个简单的结构，用于表示用于测试每个序列的数据。
 *
 */
function createState<T>(): SequenceState<T> {
  return {
    buffer: [],
    complete: false,
  };
}
