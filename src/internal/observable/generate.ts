import { Observable } from '../Observable';
import { identity } from '../util/identity';
import { ObservableInput, SchedulerLike } from '../types';
import { isScheduler } from '../util/isScheduler';
import { defer } from './defer';
import { scheduleIterable } from '../scheduled/scheduleIterable';

type ConditionFunc<S> = (state: S) => boolean;
type IterateFunc<S> = (state: S) => S;
type ResultFunc<S, T> = (state: S) => T;

export interface GenerateBaseOptions<S> {
  /**
   * Initial state.
   *
   * 初始状态。
   *
   */
  initialState: S;
  /**
   * Condition function that accepts state and returns boolean.
   * When it returns false, the generator stops.
   * If not specified, a generator never stops.
   *
   * 接受状态并返回布尔值的条件函数。当它返回 false 时，生成器停止。如果未指定，则生成器永远不会停止。
   *
   */
  condition?: ConditionFunc<S>;
  /**
   * Iterate function that accepts state and returns new state.
   *
   * 接受状态并返回新状态的迭代函数。
   *
   */
  iterate: IterateFunc<S>;
  /**
   * SchedulerLike to use for generation process.
   * By default, a generator starts immediately.
   *
   * 调度器喜欢用于生成过程。默认情况下，生成器会立即启动。
   *
   */
  scheduler?: SchedulerLike;
}

export interface GenerateOptions<T, S> extends GenerateBaseOptions<S> {
  /**
   * Result selection function that accepts state and returns a value to emit.
   *
   * 接受状态并返回要发出的值的结果选择函数。
   *
   */
  resultSelector: ResultFunc<S, T>;
}

/**
 * Generates an observable sequence by running a state-driven loop
 * producing the sequence's elements, using the specified scheduler
 * to send out observer messages.
 *
 * 通过运行一个状态驱动的循环来生成一个可观察的序列，该循环产生序列的元素，使用指定的调度程序发送观察者消息。
 *
 * ![](generate.png)
 *
 * ## Examples
 *
 * ## 例子
 *
 * Produces sequence of numbers
 *
 * 产生数字序列
 *
 * ```ts
 * import { generate } from 'rxjs';
 *
 * const result = generate(0, x => x < 3, x => x + 1, x => x);
 *
 * result.subscribe(x => console.log(x));
 *
 * // Logs:
 * // 0
 * // 1
 * // 2
 * ```
 *
 * Use `asapScheduler`
 *
 * 使用 `asapScheduler`
 *
 * ```ts
 * import { generate, asapScheduler } from 'rxjs';
 *
 * const result = generate(1, x => x < 5, x => x * 2, x => x + 1, asapScheduler);
 *
 * result.subscribe(x => console.log(x));
 *
 * // Logs:
 * // 2
 * // 3
 * // 5
 * ```
 * @see {@link from}
 * @see {@link Observable}
 * @param {S} initialState Initial state.
 *
 * 初始状态。
 *
 * @param {function (state: S): boolean} condition Condition to terminate generation (upon returning false).
 *
 * 终止生成的条件（返回 false 时）。
 *
 * @param {function (state: S): S} iterate Iteration step function.
 *
 * 迭代阶跃函数。
 *
 * @param {function (state: S): T} resultSelector Selector function for results produced in the sequence. (deprecated)
 *
 * 序列中产生的结果的选择器函数。（已弃用）
 *
 * @param {SchedulerLike} [scheduler] A {@link SchedulerLike} on which to run the generator loop. If not provided, defaults to emit immediately.
 *
 * 哪个来运行生成器循环。如果未提供，则默认立即发出。
 *
 * @returns {Observable<T>} The generated sequence.
 *
 * 生成的序列。
 *
 * @deprecated Instead of passing separate arguments, use the options argument. Signatures taking separate arguments will be removed in v8.
 *
 * 不要传递单独的参数，而是使用 options 参数。带有单独参数的签名将在 v8 中被删除。
 *
 */
export function generate<T, S>(
  initialState: S,
  condition: ConditionFunc<S>,
  iterate: IterateFunc<S>,
  resultSelector: ResultFunc<S, T>,
  scheduler?: SchedulerLike
): Observable<T>;

/**
 * Generates an Observable by running a state-driven loop
 * that emits an element on each iteration.
 *
 * 通过运行一个状态驱动的循环来生成一个 Observable，该循环在每次迭代时发出一个元素。
 *
 * <span class="informal">Use it instead of nexting values in a for loop.</span>
*
 * <span class="informal">使用它代替 for 循环中的下一个值。</span>
 *
 * ![](generate.png)
 *
 * `generate` allows you to create a stream of values generated with a loop very similar to
 * a traditional for loop. The first argument of `generate` is a beginning value. The second argument
 * is a function that accepts this value and tests if some condition still holds. If it does,
 * then the loop continues, if not, it stops. The third value is a function which takes the
 * previously defined value and modifies it in some way on each iteration. Note how these three parameters
 * are direct equivalents of three expressions in a traditional for loop: the first expression
 * initializes some state (for example, a numeric index), the second tests if the loop can perform the next
 * iteration (for example, if the index is lower than 10) and the third states how the defined value
 * will be modified on every step (for example, the index will be incremented by one).
 *
 * `generate` 允许你创建一个使用与传统 for 循环非常相似的循环生成的值流。`generate` 的第一个参数是一个起始值。第二个参数是一个接受此值并测试某些条件是否仍然成立的函数。如果是，则循环继续，如果不是，则停止。第三个值是一个函数，它采用先前定义的值并在每次迭代时以某种方式对其进行修改。请注意，这三个参数如何直接等效于传统 for 循环中的三个表达式：第一个表达式初始化某个状态（例如，数字索引），第二个表达式测试循环是否可以执行下一次迭代（例如，如果索引小于 10），第三个说明如何在每一步修改定义的值（例如，索引将增加 1）。
 *
 * Return value of a `generate` operator is an Observable that on each loop iteration
 * emits a value. First of all, the condition function is ran. If it returns true, then the Observable
 * emits the currently stored value (initial value at the first iteration) and finally updates
 * that value with iterate function. If at some point the condition returns false, then the Observable
 * completes at that moment.
 *
 * `generate` 操作符的返回值是一个 Observable，它在每次循环迭代时发出一个值。首先，运行条件函数。如果它返回 true，那么 Observable 会发出当前存储的值（第一次迭代时的初始值），最后使用 iterate 函数更新该值。如果在某个时候条件返回 false，则 Observable 在那一刻完成。
 *
 * Optionally you can pass a fourth parameter to `generate` - a result selector function which allows you
 * to immediately map the value that would normally be emitted by an Observable.
 *
 * 可选地，你可以传递第四个参数来 `generate` - 结果选择器函数，它允许你立即映射通常由 Observable 发出的值。
 *
 * If you find three anonymous functions in `generate` call hard to read, you can provide
 * a single object to the operator instead where the object has the properties: `initialState`,
 * `condition`, `iterate` and `resultSelector`, which should have respective values that you
 * would normally pass to `generate`. `resultSelector` is still optional, but that form
 * of calling `generate` allows you to omit `condition` as well. If you omit it, that means
 * condition always holds, or in other words the resulting Observable will never complete.
 *
 * 如果你在 `generate` 调用中发现三个匿名函数难以阅读，你可以向操作员提供一个对象，而不是该对象具有以下属性： `initialState`、`condition`、`iterate` 和 `resultSelector`，它们应该具有你通常传递给 `generate` 的相应值. `resultSelector` 仍然是可选的，但调用 `generate` 的这种形式也允许你省略 `condition`。如果省略它，则意味着条件始终成立，或者换句话说，生成的 Observable 永远不会完成。
 *
 * Both forms of `generate` can optionally accept a scheduler. In case of a multi-parameter call,
 * scheduler simply comes as a last argument (no matter if there is a `resultSelector`
 * function or not). In case of a single-parameter call, you can provide it as a
 * `scheduler` property on the object passed to the operator. In both cases, a scheduler decides when
 * the next iteration of the loop will happen and therefore when the next value will be emitted
 * by the Observable. For example, to ensure that each value is pushed to the Observer
 * on a separate task in the event loop, you could use the `async` scheduler. Note that
 * by default (when no scheduler is passed) values are simply emitted synchronously.
 *
 * 两种形式的 `generate` 可以选择接受调度程序。在多参数调用的情况下，调度程序只是作为最后一个参数出现（无论是否有 `resultSelector` 函数）。在单参数调用的情况下，你可以将其作为 `scheduler` 属性提供给传递给操作员的对象。在这两种情况下，调度程序决定下一次循环迭代何时发生，因此下一个值何时由 Observable 发出。例如，要确保在事件循环中的单独任务上将每个值推送到观察者，你可以使用 `async` 调度程序。请注意，默认情况下（当没有传递调度程序时）值只是同步发出。
 *
 * ## Examples
 *
 * ## 例子
 *
 * Use with condition and iterate functions
 *
 * 与条件和迭代函数一起使用
 *
 * ```ts
 * import { generate } from 'rxjs';
 *
 * const result = generate(0, x => x < 3, x => x + 1);
 *
 * result.subscribe({
 *   next: value => console.log(value),
 *   complete: () => console.log('Complete!')
 * });
 *
 * // Logs:
 * // 0
 * // 1
 * // 2
 * // 'Complete!'
 * ```
 *
 * Use with condition, iterate and resultSelector functions
 *
 * 与条件、迭代和结果选择函数一起使用
 *
 * ```ts
 * import { generate } from 'rxjs';
 *
 * const result = generate(0, x => x < 3, x => x + 1, x => x * 1000);
 *
 * result.subscribe({
 *   next: value => console.log(value),
 *   complete: () => console.log('Complete!')
 * });
 *
 * // Logs:
 * // 0
 * // 1000
 * // 2000
 * // 'Complete!'
 * ```
 *
 * Use with options object
 *
 * 与选项对象一起使用
 *
 * ```ts
 * import { generate } from 'rxjs';
 *
 * const result = generate({
 *   initialState: 0,
 *   condition(value) { return value < 3; },
 *   iterate(value) { return value + 1; },
 *   resultSelector(value) { return value * 1000; }
 * });
 *
 * result.subscribe({
 *   next: value => console.log(value),
 *   complete: () => console.log('Complete!')
 * });
 *
 * // Logs:
 * // 0
 * // 1000
 * // 2000
 * // 'Complete!'
 * ```
 *
 * Use options object without condition function
 *
 * 使用不带条件函数的选项对象
 *
 * ```ts
 * import { generate } from 'rxjs';
 *
 * const result = generate({
 *   initialState: 0,
 *   iterate(value) { return value + 1; },
 *   resultSelector(value) { return value * 1000; }
 * });
 *
 * result.subscribe({
 *   next: value => console.log(value),
 *   complete: () => console.log('Complete!') // This will never run
 * });
 *
 * // Logs:
 * // 0
 * // 1000
 * // 2000
 * // 3000
 * // ...and never stops.
 * ```
 * @see {@link from}
 * @param {S} initialState Initial state.
 *
 * 初始状态。
 *
 * @param {function (state: S): boolean} condition Condition to terminate generation (upon returning false).
 *
 * 终止生成的条件（返回 false 时）。
 *
 * @param {function (state: S): S} iterate Iteration step function.
 *
 * 迭代阶跃函数。
 *
 * @param {function (state: S): T} [resultSelector] Selector function for results produced in the sequence.
 * @param {Scheduler} [scheduler] A {@link Scheduler} on which to run the generator loop. If not provided, defaults to emitting immediately.
 *
 * 哪个来运行生成器循环。如果未提供，则默认为立即发出。
 *
 * @return {Observable<T>} The generated sequence.
 *
 * 生成的序列。
 *
 * @deprecated Instead of passing separate arguments, use the options argument. Signatures taking separate arguments will be removed in v8.
 *
 * 不要传递单独的参数，而是使用 options 参数。带有单独参数的签名将在 v8 中被删除。
 *
 */
export function generate<S>(
  initialState: S,
  condition: ConditionFunc<S>,
  iterate: IterateFunc<S>,
  scheduler?: SchedulerLike
): Observable<S>;

/**
 * Generates an observable sequence by running a state-driven loop
 * producing the sequence's elements, using the specified scheduler
 * to send out observer messages.
 * The overload accepts options object that might contain initial state, iterate,
 * condition and scheduler.
 *
 * 通过运行一个状态驱动的循环来生成一个可观察的序列，该循环产生序列的元素，使用指定的调度程序发送观察者消息。重载接受可能包含初始状态、迭代、条件和调度程序的选项对象。
 *
 * ![](generate.png)
 *
 * ## Examples
 *
 * ## 例子
 *
 * Use options object with condition function
 *
 * 使用带有条件函数的选项对象
 *
 * ```ts
 * import { generate } from 'rxjs';
 *
 * const result = generate({
 *   initialState: 0,
 *   condition: x => x < 3,
 *   iterate: x => x + 1
 * });
 *
 * result.subscribe({
 *   next: value => console.log(value),
 *   complete: () => console.log('Complete!')
 * });
 *
 * // Logs:
 * // 0
 * // 1
 * // 2
 * // 'Complete!'
 * ```
 * @see {@link from}
 * @see {@link Observable}
 * @param {GenerateBaseOptions<S>} options Object that must contain initialState, iterate and might contain condition and scheduler.
 *
 * 必须包含初始状态、迭代并可能包含条件和调度程序的对象。
 *
 * @returns {Observable<S>} The generated sequence.
 *
 * 生成的序列。
 *
 */
export function generate<S>(options: GenerateBaseOptions<S>): Observable<S>;

/**
 * Generates an observable sequence by running a state-driven loop
 * producing the sequence's elements, using the specified scheduler
 * to send out observer messages.
 * The overload accepts options object that might contain initial state, iterate,
 * condition, result selector and scheduler.
 *
 * 通过运行一个状态驱动的循环来生成一个可观察的序列，该循环产生序列的元素，使用指定的调度程序发送观察者消息。重载接受可能包含初始状态、迭代、条件、结果选择器和调度程序的选项对象。
 *
 * ![](generate.png)
 *
 * ## Examples
 *
 * ## 例子
 *
 * Use options object with condition and iterate function
 *
 * 使用带有条件和迭代功能的选项对象
 *
 * ```ts
 * import { generate } from 'rxjs';
 *
 * const result = generate({
 *   initialState: 0,
 *   condition: x => x < 3,
 *   iterate: x => x + 1,
 *   resultSelector: x => x
 * });
 *
 * result.subscribe({
 *   next: value => console.log(value),
 *   complete: () => console.log('Complete!')
 * });
 *
 * // Logs:
 * // 0
 * // 1
 * // 2
 * // 'Complete!'
 * ```
 * @see {@link from}
 * @see {@link Observable}
 * @param {GenerateOptions<T, S>} options Object that must contain initialState, iterate, resultSelector and might contain condition and scheduler.
 *
 * 必须包含 initialState、iterate、resultSelector 并且可能包含条件和调度程序的对象。
 *
 * @returns {Observable<T>} The generated sequence.
 *
 * 生成的序列。
 *
 */
export function generate<T, S>(options: GenerateOptions<T, S>): Observable<T>;

export function generate<T, S>(
  initialStateOrOptions: S | GenerateOptions<T, S>,
  condition?: ConditionFunc<S>,
  iterate?: IterateFunc<S>,
  resultSelectorOrScheduler?: ResultFunc<S, T> | SchedulerLike,
  scheduler?: SchedulerLike
): Observable<T> {
  let resultSelector: ResultFunc<S, T>;
  let initialState: S;

  // TODO: Remove this as we move away from deprecated signatures
  // and move towards a configuration object argument.
  if (arguments.length === 1) {
    // If we only have one argument, we can assume it is a configuration object.
    // Note that folks not using TypeScript may trip over this.
    ({
      initialState,
      condition,
      iterate,
      resultSelector = identity as ResultFunc<S, T>,
      scheduler,
    } = initialStateOrOptions as GenerateOptions<T, S>);
  } else {
    // Deprecated arguments path. Figure out what the user
    // passed and set it here.
    initialState = initialStateOrOptions as S;
    if (!resultSelectorOrScheduler || isScheduler(resultSelectorOrScheduler)) {
      resultSelector = identity as ResultFunc<S, T>;
      scheduler = resultSelectorOrScheduler as SchedulerLike;
    } else {
      resultSelector = resultSelectorOrScheduler as ResultFunc<S, T>;
    }
  }

  // The actual generator used to "generate" values.
  function* gen() {
    for (let state = initialState; !condition || condition(state); state = iterate!(state)) {
      yield resultSelector(state);
    }
  }

  // We use `defer` because we want to defer the creation of the iterator from the iterable.
  return defer(
    (scheduler
      ? // If a scheduler was provided, use `scheduleIterable` to ensure that iteration/generation
        // happens on the scheduler.
        () => scheduleIterable(gen(), scheduler!)
      : // Otherwise, if there's no scheduler, we can just use the generator function directly in
        // `defer` and executing it will return the generator (which is iterable).
        gen) as () => ObservableInput<T>
  );
}
