import { Operator } from './Operator';
import { SafeSubscriber, Subscriber } from './Subscriber';
import { isSubscription, Subscription } from './Subscription';
import { TeardownLogic, OperatorFunction, Subscribable, Observer } from './types';
import { observable as Symbol_observable } from './symbol/observable';
import { pipeFromArray } from './util/pipe';
import { config } from './config';
import { isFunction } from './util/isFunction';
import { errorContext } from './util/errorContext';

/**
 * A representation of any set of values over any amount of time. This is the most basic building block
 * of RxJS.
 *
 * 在任何时间量内任何一组值的表示。这是 RxJS 最基本的构建块。
 *
 * @class Observable<T>
 */
export class Observable<T> implements Subscribable<T> {
  /**
   * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
   *
   * 内部实现细节，请勿直接使用。将在 v8 中内部化。
   *
   */
  source: Observable<any> | undefined;

  /**
   * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
   *
   * 内部实现细节，请勿直接使用。将在 v8 中内部化。
   *
   */
  operator: Operator<any, T> | undefined;

  /**
   * @constructor
   * @param {Function} subscribe the function that is called when the Observable is
   * initially subscribed to. This function is given a Subscriber, to which new values
   * can be `next`ed, or an `error` method can be called to raise an error, or
   * `complete` can be called to notify of a successful completion.
   *
   * 最初订阅 Observable 时调用的函数。这个函数有一个订阅者，新的值可以被 `next` 编辑，或者可以调用 `error` 方法来引发错误，或者可以调用 `complete` 来通知成功完成。
   *
   */
  constructor(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }

  // HACK: Since TypeScript inherits static properties too, we have to
  // fight against TypeScript here so Subject can have a different static create signature
  /**
   * Creates a new Observable by calling the Observable constructor
   *
   * 通过调用 Observable 构造函数创建一个新的 Observable
   *
   * @owner Observable
   * @method create
   * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
   * @return {Observable} a new observable
   *
   * 一个新的可观察的
   *
   * @nocollapse
   * @deprecated Use `new Observable()` instead. Will be removed in v8.
   *
   * 改用 `new Observable()`。将在 v8 中删除。
   *
   */
  static create: (...args: any[]) => any = <T>(subscribe?: (subscriber: Subscriber<T>) => TeardownLogic) => {
    return new Observable<T>(subscribe);
  };

  /**
   * Creates a new Observable, with this Observable instance as the source, and the passed
   * operator defined as the new observable's operator.
   *
   * 创建一个新的 Observable，以这个 Observable 实例作为源，传递的操作符定义为新的 observable 的操作符。
   *
   * @method lift
   * @param operator the operator defining the operation to take on the observable
   *
   * 定义对可观察对象进行操作的操作员
   *
   * @return a new observable with the Operator applied
   *
   * 应用了 Operator 的新 observable
   *
   * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
   * If you have implemented an operator using `lift`, it is recommended that you create an
   * operator by simply returning `new Observable()` directly. See "Creating new operators from
   * scratch" section here: <https://rxjs.dev/guide/operators>
   *
   * 内部实现细节，请勿直接使用。将在 v8 中内部化。如果你已经使用 `lift` 实现了一个操作符，建议你通过直接返回 `new Observable()` 来创建一个操作符。请参阅此处的“从头开始创建新操作符”部分： <https://rxjs.dev/guide/operators>
   *
   */
  lift<R>(operator?: Operator<T, R>): Observable<R> {
    const observable = new Observable<R>();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  subscribe(observer?: Partial<Observer<T>>): Subscription;
  subscribe(next: (value: T) => void): Subscription;
  /**
   * @deprecated Instead of passing separate callback arguments, use an observer argument. Signatures taking separate callback arguments will be removed in v8. Details: <https://rxjs.dev/deprecations/subscribe-arguments>
   *
   * 不要传递单独的回调参数，而是使用观察者参数。带有单独回调参数的签名将在 v8 中被删除。详细信息： <https://rxjs.dev/deprecations/subscribe-arguments>
   *
   */
  subscribe(next?: ((value: T) => void) | null, error?: ((error: any) => void) | null, complete?: (() => void) | null): Subscription;
  /**
   * Invokes an execution of an Observable and registers Observer handlers for notifications it will emit.
   *
   * 调用 Observable 的执行并为它将发出的通知注册 Observer 处理程序。
   *
   * <span class="informal">Use it when you have all these Observables, but still nothing is happening.</span>
   *
   * <span class="informal">当你拥有所有这些 Observables 时使用它，但仍然没有发生任何事情。</span>
   *
   * `subscribe` is not a regular operator, but a method that calls Observable's internal `subscribe` function. It
   * might be for example a function that you passed to Observable's constructor, but most of the time it is
   * a library implementation, which defines what will be emitted by an Observable, and when it be will emitted. This means
   * that calling `subscribe` is actually the moment when Observable starts its work, not when it is created, as it is often
   * the thought.
   *
   * `subscribe` 不是一个普通的操作符，而是一个调用 Observable 内部 `subscribe` 函数的方法。例如，它可能是你传递给 Observable 构造函数的函数，但大多数时候它是一个库实现，它定义了 Observable 将发出什么以及何时发出。这意味着调用 `subscribe` 实际上是 Observable 开始工作的时刻，而不是它被创建的时刻，因为它通常是这样想的。
   *
   * Apart from starting the execution of an Observable, this method allows you to listen for values
   * that an Observable emits, as well as for when it completes or errors. You can achieve this in two
   * of the following ways.
   *
   * 除了开始执行 Observable 之外，此方法还允许你侦听 Observable 发出的值，以及它何时完成或出错。你可以通过以下两种方式实现此目的。
   *
   * The first way is creating an object that implements {@link Observer} interface. It should have methods
   * defined by that interface, but note that it should be just a regular JavaScript object, which you can create
   * yourself in any way you want (ES6 class, classic function constructor, object literal etc.). In particular, do
   * not attempt to use any RxJS implementation details to create Observers - you don't need them. Remember also
   * that your object does not have to implement all methods. If you find yourself creating a method that doesn't
   * do anything, you can simply omit it. Note however, if the `error` method is not provided and an error happens,
   * it will be thrown asynchronously. Errors thrown asynchronously cannot be caught using `try`/`catch`. Instead,
   * use the {@link onUnhandledError} configuration option or use a runtime handler (like `window.onerror` or
   * `process.on('error)`) to be notified of unhandled errors. Because of this, it's recommended that you provide
   * an `error` method to avoid missing thrown errors.
   *
   * 第一种方法是创建一个实现 {@link Observer} 接口的对象。它应该具有由该接口定义的方法，但请注意，它应该只是一个常规的 JavaScript 对象，你可以以任何你想要的方式创建它（ES6 类、经典函数构造函数、对象字面量等）。特别是，不要尝试使用任何 RxJS 实现细节来创建观察者——你不需要它们。还要记住，你的对象不必实现所有方法。如果你发现自己创建了一个什么都不做的方法，你可以简单地省略它。但是请注意，如果没有提供 `error` 方法并且发生错误，它将被异步抛出。使用 `try` / `catch` 无法捕获异步抛出的错误。相反，使用 {@link onUnhandledError} 配置选项或使用运行时处理程序（如 `window.onerror` 或 `process.on('error)`）来通知未处理的错误。因此，建议你提供 `error` 方法以避免丢失抛出的错误。
   *
   * The second way is to give up on Observer object altogether and simply provide callback functions in place of its methods.
   * This means you can provide three functions as arguments to `subscribe`, where the first function is equivalent
   * of a `next` method, the second of an `error` method and the third of a `complete` method. Just as in case of an Observer,
   * if you do not need to listen for something, you can omit a function by passing `undefined` or `null`,
   * since `subscribe` recognizes these functions by where they were placed in function call. When it comes
   * to the `error` function, as with an Observer, if not provided, errors emitted by an Observable will be thrown asynchronously.
   *
   * 第二种方法是完全放弃 Observer 对象，并简单地提供回调函数来代替其方法。这意味着你可以提供三个函数作为 `subscribe` 的参数，其中第一个函数等效于 `next` 方法，第二个函数等效于 `error` 方法，第三个函数等效于 `complete` 方法。就像观察者的情况一样，如果你不需要监听某些东西，你可以通过传递 `undefined` 或 `null` 来省略一个函数，因为 `subscribe` 通过它们在函数调用中的位置来识别这些函数。当涉及到 `error` 函数时，与 Observer 一样，如果未提供，则 Observable 发出的错误将被异步抛出。
   *
   * You can, however, subscribe with no parameters at all. This may be the case where you're not interested in terminal events
   * and you also handled emissions internally by using operators (e.g. using `tap`).
   *
   * 但是，你可以完全不使用任何参数进行订阅。这可能是你对终端事件不感兴趣并且你还通过使用操作符（例如使用 `tap`）在内部处理排放的情况。
   *
   * Whichever style of calling `subscribe` you use, in both cases it returns a Subscription object.
   * This object allows you to call `unsubscribe` on it, which in turn will stop the work that an Observable does and will clean
   * up all resources that an Observable used. Note that cancelling a subscription will not call `complete` callback
   * provided to `subscribe` function, which is reserved for a regular completion signal that comes from an Observable.
   *
   * 无论你使用哪种调用方式 `subscribe`，在这两种情况下它都会返回一个 Subscription 对象。这个对象允许你在它上面调用 `unsubscribe`，这反过来会停止 Observable 所做的工作并清理 Observable 使用的所有资源。请注意，取消订阅不会调用提供给 `subscribe` 函数的 `complete` 回调，该回调是为来自 Observable 的常规完成信号保留的。
   *
   * Remember that callbacks provided to `subscribe` are not guaranteed to be called asynchronously.
   * It is an Observable itself that decides when these functions will be called. For example {@link of}
   * by default emits all its values synchronously. Always check documentation for how given Observable
   * will behave when subscribed and if its default behavior can be modified with a `scheduler`.
   *
   * 请记住，提供给 `subscribe` 的回调不能保证被异步调用。决定何时调用这些函数的是 Observable 本身。例如 {@link of} 默认同步地发出它的所有值。始终检查文档，了解给定的 Observable 在订阅时的行为方式以及是否可以使用 `scheduler` 修改其默认行为。
   *
   * ## Examples
   *
   * ## 例子
   *
   * Subscribe with an {@link guide/observer Observer}
   *
   * 通过 {@link guide/observer Observer} 订阅
   *
   * ```ts
   * import { of } from 'rxjs';
   *
   * const sumObserver = {
   *   sum: 0,
   *   next(value) {
   *     console.log('Adding: ' + value);
   *     this.sum = this.sum + value;
   *   },
   *   error() {
   *     // We actually could just remove this method,
   *     // since we do not really care about errors right now.
   *   },
   *   complete() {
   *     console.log('Sum equals: ' + this.sum);
   *   }
   * };
   *
   * of(1, 2, 3) // Synchronously emits 1, 2, 3 and then completes.
   *   .subscribe(sumObserver);
   *
   * // Logs:
   * // 'Adding: 1'
   * // 'Adding: 2'
   * // 'Adding: 3'
   * // 'Sum equals: 6'
   * ```
   *
   * Subscribe with functions ({@link deprecations/subscribe-arguments deprecated})
   *
   * 使用函数订阅（{@link deprecations/subscribe-arguments deprecated}）
   *
   * ```ts
   * import { of } from 'rxjs'
   *
   * let sum = 0;
   *
   * of(1, 2, 3).subscribe(
   *   value => {
   *     console.log('Adding: ' + value);
   *     sum = sum + value;
   *   },
   *   undefined,
   *   () => console.log('Sum equals: ' + sum)
   * );
   *
   * // Logs:
   * // 'Adding: 1'
   * // 'Adding: 2'
   * // 'Adding: 3'
   * // 'Sum equals: 6'
   * ```
   *
   * Cancel a subscription
   *
   * 取消订阅
   *
   * ```ts
   * import { interval } from 'rxjs';
   *
   * const subscription = interval(1000).subscribe({
   *   next(num) {
   *     console.log(num)
   *   },
   *   complete() {
   *     // Will not be called, even when cancelling subscription.
   *     console.log('completed!');
   *   }
   * });
   *
   * setTimeout(() => {
   *   subscription.unsubscribe();
   *   console.log('unsubscribed!');
   * }, 2500);
   *
   * // Logs:
   * // 0 after 1s
   * // 1 after 2s
   * // 'unsubscribed!' after 2.5s
   * ```
   * @param {Observer|Function} observerOrNext (optional) Either an observer with methods to be called,
   * or the first of three possible handlers, which is the handler for each value emitted from the subscribed
   * Observable.
   *
   *（可选）具有要调用的方法的观察者，或者三个可能的处理程序中的第一个，它是从订阅的 Observable 发出的每个值的处理程序。
   *
   * @param {Function} error (optional) A handler for a terminal event resulting from an error. If no error handler is provided,
   * the error will be thrown asynchronously as unhandled.
   *
   *（可选）由错误导致的终端事件的处理程序。如果未提供错误处理程序，则错误将作为未处理异步抛出。
   *
   * @param {Function} complete (optional) A handler for a terminal event resulting from successful completion.
   *
   *（可选）成功完成导致的终端事件的处理程序。
   *
   * @return {Subscription} a subscription reference to the registered handlers
   *
   * 对已注册处理程序的订阅引用
   *
   * @method subscribe
   */
  subscribe(
    observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
    error?: ((error: any) => void) | null,
    complete?: (() => void) | null
  ): Subscription {
    const subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);

    errorContext(() => {
      const { operator, source } = this;
      subscriber.add(
        operator
          ? // We're dealing with a subscription in the
            // operator chain to one of our lifted operators.
            operator.call(subscriber, source)
          : source
          ? // If `source` has a value, but `operator` does not, something that
            // had intimate knowledge of our API, like our `Subject`, must have
            // set it. We're going to just call `_subscribe` directly.
            this._subscribe(subscriber)
          : // In all other cases, we're likely wrapping a user-provided initializer
            // function, so we need to catch errors and handle them appropriately.
            this._trySubscribe(subscriber)
      );
    });

    return subscriber;
  }

  /** @internal */
  protected _trySubscribe(sink: Subscriber<T>): TeardownLogic {
    try {
      return this._subscribe(sink);
    } catch (err) {
      // We don't need to return anything in this case,
      // because it's just going to try to `add()` to a subscription
      // above.
      sink.error(err);
    }
  }

  /**
   * Used as a NON-CANCELLABLE means of subscribing to an observable, for use with
   * APIs that expect promises, like `async/await`. You cannot unsubscribe from this.
   *
   * 用作订阅 observable 的不可取消的方式，用于期望承诺的 API，如 `async/await`。你不能取消订阅。
   *
   * **WARNING**: Only use this with observables you *know* will complete. If the source
   * observable does not complete, you will end up with a promise that is hung up, and
   * potentially all of the state of an async function hanging out in memory. To avoid
   * this situation, look into adding something like {@link timeout}, {@link take},
   * {@link takeWhile}, or {@link takeUntil} amongst others.
   *
   * **警告**：仅将其与你*知道*将完成的可观察对象一起使用。如果源 observable 没有完成，你最终会得到一个被挂起的 Promise，并且可能所有异步函数的状态都挂在内存中。为避免这种情况，请考虑添加 {@link timeout}、{@link take}、{@link takeWhile} 或 {@link takeUntil} 等内容。
   *
   * ## Example
   *
   * ## 例子
   *
   * ```ts
   * import { interval, take } from 'rxjs';
   *
   * const source$ = interval(1000).pipe(take(4));
   *
   * async function getTotal() {
   *   let total = 0;
   *
   *   await source$.forEach(value => {
   *     total += value;
   *     console.log('observable -> ' + value);
   *   });
   *
   *   return total;
   * }
   *
   * getTotal().then(
   *   total => console.log('Total: ' + total)
   * );
   *
   * // Expected:
   * // 'observable -> 0'
   * // 'observable -> 1'
   * // 'observable -> 2'
   * // 'observable -> 3'
   * // 'Total: 6'
   * ```
   * @param next a handler for each value emitted by the observable
   *
   * 可观察对象发出的每个值的处理程序
   *
   * @return a promise that either resolves on observable completion or
   *  rejects with the handled error
   *
   * 一个在可观察完成时解决或拒绝处理错误的承诺
   *
   */
  forEach(next: (value: T) => void): Promise<void>;

  /**
   * @param next a handler for each value emitted by the observable
   *
   * 可观察对象发出的每个值的处理程序
   *
   * @param promiseCtor a constructor function used to instantiate the Promise
   *
   * 用于实例化 Promise 的构造函数
   *
   * @return a promise that either resolves on observable completion or
   *  rejects with the handled error
   *
   * 一个在可观察完成时解决或拒绝处理错误的承诺
   *
   * @deprecated Passing a Promise constructor will no longer be available
   * in upcoming versions of RxJS. This is because it adds weight to the library, for very
   * little benefit. If you need this functionality, it is recommended that you either
   * polyfill Promise, or you create an adapter to convert the returned native promise
   * to whatever promise implementation you wanted. Will be removed in v8.
   *
   * 在即将发布的 RxJS 版本中，将不再提供传递 Promise 构造函数。这是因为它增加了库的重量，但收益甚微。如果你需要此功能，建议你使用 polyfill Promise，或者创建一个适配器以将返回的本机 Promise 转换为你想要的任何 Promise 实现。将在 v8 中删除。
   *
   */
  forEach(next: (value: T) => void, promiseCtor: PromiseConstructorLike): Promise<void>;

  forEach(next: (value: T) => void, promiseCtor?: PromiseConstructorLike): Promise<void> {
    promiseCtor = getPromiseCtor(promiseCtor);

    return new promiseCtor<void>((resolve, reject) => {
      const subscriber = new SafeSubscriber<T>({
        next: (value) => {
          try {
            next(value);
          } catch (err) {
            reject(err);
            subscriber.unsubscribe();
          }
        },
        error: reject,
        complete: resolve,
      });
      this.subscribe(subscriber);
    }) as Promise<void>;
  }

  /** @internal */
  protected _subscribe(subscriber: Subscriber<any>): TeardownLogic {
    return this.source?.subscribe(subscriber);
  }

  /**
   * An interop point defined by the es7-observable spec <https://github.com/zenparsing/es-observable>
   *
   * 由 es7-observable 规范定义的互操作点<https://github.com/zenparsing/es-observable>
   *
   * @method Symbol.observable
   * @return {Observable} this instance of the observable
   *
   * 这个 observable 的实例
   *
   */
  [Symbol_observable]() {
    return this;
  }

  /* tslint:disable:max-line-length */
  pipe(): Observable<T>;
  pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
  pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
  pipe<A, B, C>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
  pipe<A, B, C, D>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>
  ): Observable<D>;
  pipe<A, B, C, D, E>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>
  ): Observable<E>;
  pipe<A, B, C, D, E, F>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>
  ): Observable<F>;
  pipe<A, B, C, D, E, F, G>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>
  ): Observable<G>;
  pipe<A, B, C, D, E, F, G, H>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>
  ): Observable<H>;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>
  ): Observable<I>;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>,
    ...operations: OperatorFunction<any, any>[]
  ): Observable<unknown>;
  /* tslint:enable:max-line-length */

  /**
   * Used to stitch together functional operators into a chain.
   *
   * 用于将功能操作符拼接成一个链。
   *
   * @method pipe
   * @return {Observable} the Observable result of all of the operators having
   * been called in the order they were passed in.
   *
   * 所有操作符按传入顺序调用的 Observable 结果。
   *
   * ## Example
   *
   * ## 例子
   *
   * ```ts
   * import { interval, filter, map, scan } from 'rxjs';
   *
   * interval(1000)
   *   .pipe(
   *     filter(x => x % 2 === 0),
   *     map(x => x + x),
   *     scan((acc, x) => acc + x)
   *   )
   *   .subscribe(x => console.log(x));
   * ```
   */
  pipe(...operations: OperatorFunction<any, any>[]): Observable<any> {
    return pipeFromArray(operations)(this);
  }

  /* tslint:disable:max-line-length */
  /**
   * @deprecated Replaced with {@link firstValueFrom} and {@link lastValueFrom}. Will be removed in v8. Details: <https://rxjs.dev/deprecations/to-promise>
   *
   * 替换为 {@link firstValueFrom} 和 {@link lastValueFrom}。将在 v8 中删除。详细信息： <https://rxjs.dev/deprecations/to-promise>
   *
   */
  toPromise(): Promise<T | undefined>;
  /**
   * @deprecated Replaced with {@link firstValueFrom} and {@link lastValueFrom}. Will be removed in v8. Details: <https://rxjs.dev/deprecations/to-promise>
   *
   * 替换为 {@link firstValueFrom} 和 {@link lastValueFrom}。将在 v8 中删除。详细信息： <https://rxjs.dev/deprecations/to-promise>
   *
   */
  toPromise(PromiseCtor: typeof Promise): Promise<T | undefined>;
  /**
   * @deprecated Replaced with {@link firstValueFrom} and {@link lastValueFrom}. Will be removed in v8. Details: <https://rxjs.dev/deprecations/to-promise>
   *
   * 替换为 {@link firstValueFrom} 和 {@link lastValueFrom}。将在 v8 中删除。详细信息： <https://rxjs.dev/deprecations/to-promise>
   *
   */
  toPromise(PromiseCtor: PromiseConstructorLike): Promise<T | undefined>;
  /* tslint:enable:max-line-length */

  /**
   * Subscribe to this Observable and get a Promise resolving on
   * `complete` with the last emission (if any).
   *
   * 订阅这个 Observable 并获得一个 Promise 解决 `complete` 最后一个发射（如果有的话）。
   *
   * **WARNING**: Only use this with observables you *know* will complete. If the source
   * observable does not complete, you will end up with a promise that is hung up, and
   * potentially all of the state of an async function hanging out in memory. To avoid
   * this situation, look into adding something like {@link timeout}, {@link take},
   * {@link takeWhile}, or {@link takeUntil} amongst others.
   *
   * **警告**：仅将其与你*知道*将完成的可观察对象一起使用。如果源 observable 没有完成，你最终会得到一个被挂起的 Promise，并且可能所有异步函数的状态都挂在内存中。为避免这种情况，请考虑添加 {@link timeout}、{@link take}、{@link takeWhile} 或 {@link takeUntil} 等内容。
   *
   * @method toPromise
   * @param [promiseCtor] a constructor function used to instantiate
   * the Promise
   * @return A Promise that resolves with the last value emit, or
   * rejects on an error. If there were no emissions, Promise
   * resolves with undefined.
   *
   * 使用最后一个值发出的 Promise，或拒绝错误。如果没有排放，Promise 以 undefined 解析。
   *
   * @deprecated Replaced with {@link firstValueFrom} and {@link lastValueFrom}. Will be removed in v8. Details: <https://rxjs.dev/deprecations/to-promise>
   *
   * 替换为 {@link firstValueFrom} 和 {@link lastValueFrom}。将在 v8 中删除。详细信息： <https://rxjs.dev/deprecations/to-promise>
   *
   */
  toPromise(promiseCtor?: PromiseConstructorLike): Promise<T | undefined> {
    promiseCtor = getPromiseCtor(promiseCtor);

    return new promiseCtor((resolve, reject) => {
      let value: T | undefined;
      this.subscribe(
        (x: T) => (value = x),
        (err: any) => reject(err),
        () => resolve(value)
      );
    }) as Promise<T | undefined>;
  }
}

/**
 * Decides between a passed promise constructor from consuming code,
 * A default configured promise constructor, and the native promise
 * constructor and returns it. If nothing can be found, it will throw
 * an error.
 *
 * 在来自消费代码的传递的 Promise 构造函数、默认配置的 Promise 构造函数和本机 Promise 构造函数之间做出决定并返回它。如果什么都找不到，它会抛出一个错误。
 *
 * @param promiseCtor The optional promise constructor to passed by consuming code
 *
 * 通过使用代码传递的可选承诺构造函数
 *
 */
function getPromiseCtor(promiseCtor: PromiseConstructorLike | undefined) {
  return promiseCtor ?? config.Promise ?? Promise;
}

function isObserver<T>(value: any): value is Observer<T> {
  return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
}

function isSubscriber<T>(value: any): value is Subscriber<T> {
  return (value && value instanceof Subscriber) || (isObserver(value) && isSubscription(value));
}
