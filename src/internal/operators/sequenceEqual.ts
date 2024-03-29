import { OperatorFunction, ObservableInput } from '../types';
import { operate } from '../util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/innerFrom';

/**
 * Compares all values of two observables in sequence using an optional comparator function
 * and returns an observable of a single boolean value representing whether or not the two sequences
 * are equal.
 *
 * 使用可选的比较器函数按顺序比较两个 Observable 的所有值，并返回一个表示两个序列是否相等的单布尔值 Observable。
 *
 * <span class="informal">Checks to see of all values emitted by both observables are equal, in order.</span>
 *
 * <span class="informal">按顺序检查两个 Observable 发送的所有值是否相等。</span>
 *
 * ![](sequenceEqual.png)
 *
 * `sequenceEqual` subscribes to source observable and `compareTo` `ObservableInput` (that internally
 * gets converted to an observable) and buffers incoming values from each observable. Whenever either
 * observable emits a value, the value is buffered and the buffers are shifted and compared from the bottom
 * up; If any value pair doesn't match, the returned observable will emit `false` and complete. If one of the
 * observables completes, the operator will wait for the other observable to complete; If the other
 * observable emits before completing, the returned observable will emit `false` and complete. If one observable never
 * completes or emits after the other completes, the returned observable will never complete.
 *
 * `sequenceEqual` 会订阅两个 observable 并缓冲来自每个 observable 的传入值。每当任何一个 observable 发送一个值时，该值都会被缓冲，并且缓冲区会从底部向上移动和比较；如果任何一对值不匹配，则返回的 observable 将发送 `false` 并完成。如果其中一个 observable 完成，则操作符将等待另一个 observable 完成；如果另一个 observable 在完成之前还发送了别的值，则返回的 observable 将发送 `false` 并完成。如果一个 observable 从未完成或在另一个完成后发送，则返回的 observable 将永远不会完成。
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
 * @param compareTo The `ObservableInput` sequence to compare the source sequence to.
 *
 * 要与源序列进行比较的 `ObservableInput` 序列。
 *
 * @param comparator An optional function to compare each value pair.
 *
 * 用于比较每个值对的可选函数。
 *
 * @return A function that returns an Observable that emits a single boolean
 * value representing whether or not the values emitted by the source
 * Observable and provided `ObservableInput` were equal in sequence.
 *
 * 一个返回 Observable 的函数，该 Observable 会发送一个布尔值，表示源 Observable 发送的值和所提供的 Observable 发送的值是否依序相等。
 *
 */
export function sequenceEqual<T>(
  compareTo: ObservableInput<T>,
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
     * 发送和完成的工具函数
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
     * 创建订阅其中一个源的订阅者，并将从它收集到的状态 - `selfState` - 与从另一个源收集到的状态 - `otherState` 进行比较。这用于两个流。
     *
     */
    const createSubscriber = (selfState: SequenceState<T>, otherState: SequenceState<T>) => {
      const sequenceEqualSubscriber = createOperatorSubscriber(
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
            // If the other stream *does* have values in its buffer,
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
    innerFrom(compareTo).subscribe(createSubscriber(bState, aState));
  });
}

/**
 * A simple structure for the data used to test each sequence
 *
 * 用于测试每个序列的简单数据结构
 *
 */
interface SequenceState<T> {
  /**
   * A temporary store for arrived values before they are checked
   *
   * 在开始检查抵达值之前的临时存储
   *
   */
  buffer: T[];
  /**
   * Whether or not the sequence source has completed.
   *
   * 本序列的源是否已完成。
   *
   */
  complete: boolean;
}

/**
 * Creates a simple structure that is used to represent
 * data used to test each sequence.
 *
 * 创建一个简单数据结构，用于表示用于测试每个序列的数据。
 *
 */
function createState<T>(): SequenceState<T> {
  return {
    buffer: [],
    complete: false,
  };
}
