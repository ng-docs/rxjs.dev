import { Subject } from '../Subject';
import { Observable } from '../Observable';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { OperatorFunction, UnaryFunction, ObservedValueOf, ObservableInput } from '../types';
import { isFunction } from '../util/isFunction';
import { connect } from './connect';

/**
 * An operator that creates a {@link ConnectableObservable}, that when connected,
 * with the `connect` method, will use the provided subject to multicast the values
 * from the source to all consumers.
 *
 * 一个创建 {@link ConnectableObservable} 的操作符，当它通过 `connect` 方法进行连接时，将使用所提供的主体（Subject）将这些值从源多播到所有消费者。
 *
 * @param subject The subject to multicast through.
 *
 * 多播时使用的主体。
 *
 * @return A function that returns a {@link ConnectableObservable}
 *
 * 返回 {@link ConnectableObservable} 的函数
 *
 * @deprecated Will be removed in v8. To create a connectable observable, use {@link connectable}.
 * If you're using {@link refCount} after `multicast`, use the {@link share} operator instead.
 * `multicast(subject), refCount()` is equivalent to
 * `share({ connector: () => subject, resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })`.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 将在 v8 中删除。要创建可连接的 observable，请使用 {@link connectable}。如果你要在 `multicast` 之后使用 {@link refCount}，请改用 {@link share} 操作符。`multicast(subject), refCount()` 等价于 `share({ connector: () => subject, resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })`。详细信息： <https://rxjs.dev/deprecations/multicasting>
 *
 */
export function multicast<T>(subject: Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;

/**
 * Because this is deprecated in favor of the {@link connect} operator, and was otherwise poorly documented,
 * rather than duplicate the effort of documenting the same behavior, please see documentation for the
 * {@link connect} operator.
 *
 * 由于已弃用 {@link connect} 操作符，并且其文档不佳，这里不再对同一个行为进行文档化，请参阅 {@link connect} 操作符的文档。
 *
 * @param subject The subject used to multicast.
 *
 * 用于多播的主体。
 *
 * @param selector A setup function to setup the multicast
 *
 * 建立多播的 setup 函数
 *
 * @return A function that returns an observable that mirrors the observable returned by the selector.
 *
 * 返回一个可观察者的函数，该可观察者是选择器返回的可观察者的镜像。
 *
 * @deprecated Will be removed in v8. Use the {@link connect} operator instead.
 * `multicast(subject, selector)` is equivalent to
 * `connect(selector, { connector: () => subject })`.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 将在 v8 中删除。请改用 {@link connect} 操作符。`multicast(subject, selector)` 相当于 `connect(selector, { connector: () => subject })`。详细信息： <https://rxjs.dev/deprecations/multicasting>
 *
 */
export function multicast<T, O extends ObservableInput<any>>(
  subject: Subject<T>,
  selector: (shared: Observable<T>) => O
): OperatorFunction<T, ObservedValueOf<O>>;

/**
 * An operator that creates a {@link ConnectableObservable}, that when connected,
 * with the `connect` method, will use the provided subject to multicast the values
 * from the source to all consumers.
 *
 * 一个创建 {@link ConnectableObservable} 的操作符，当使用 `connect` 方法进行连接时，将使用所提供的主体（Subject）将值从源多播到所有消费者。
 *
 * @param subjectFactory A factory that will be called to create the subject. Passing a function here
 * will cause the underlying subject to be "reset" on error, completion, or refCounted unsubscription of
 * the source.
 *
 * 将用来创建主体的工厂。在此处传递函数将导致其底层主体在出错、完成或 refCounted 退订源时“重置”。
 *
 * @return A function that returns a {@link ConnectableObservable}
 *
 * 返回 {@link ConnectableObservable} 的函数
 *
 * @deprecated Will be removed in v8. To create a connectable observable, use {@link connectable}.
 * If you're using {@link refCount} after `multicast`, use the {@link share} operator instead.
 * `multicast(() => new BehaviorSubject('test')), refCount()` is equivalent to
 * `share({ connector: () => new BehaviorSubject('test') })`.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 将在 v8 中删除。要创建可连接的 observable，请使用 {@link connectable}。如果你在 `multicast` 之后使用 {@link refCount}，请改用 {@link share} 操作符。`multicast(() => new BehaviorSubject('test')), refCount()` 等价于 `share({ connector: () => new BehaviorSubject('test') })`。详细信息： <https://rxjs.dev/deprecations/multicasting>
 *
 */
export function multicast<T>(subjectFactory: () => Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;

/**
 * Because this is deprecated in favor of the {@link connect} operator, and was otherwise poorly documented,
 * rather than duplicate the effort of documenting the same behavior, please see documentation for the
 * {@link connect} operator.
 *
 * 由于已弃用 {@link connect} 操作符，并且其文档不佳，这里不再对同一个行为进行文档化，请参阅 {@link connect} 操作符的文档。
 *
 * @param subjectFactory A factory that creates the subject used to multicast.
 *
 * 用来创建供多播用的主体的工厂。
 *
 * @param selector A function to setup the multicast and select the output.
 *
 * 用于建立多播并选择输出的函数。
 *
 * @return A function that returns an observable that mirrors the observable returned by the selector.
 *
 * 返回一个可观察者的函数，该函数是选择器返回的可观察者的镜像。
 *
 * @deprecated Will be removed in v8. Use the {@link connect} operator instead.
 * `multicast(subjectFactory, selector)` is equivalent to
 * `connect(selector, { connector: subjectFactory })`.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 将在 v8 中删除。请改用 {@link connect} 操作符。`multicast(subjectFactory, selector)` 等价于 `connect(selector, { connector: subjectFactory })`。详细信息： <https://rxjs.dev/deprecations/multicasting>
 *
 */
export function multicast<T, O extends ObservableInput<any>>(
  subjectFactory: () => Subject<T>,
  selector: (shared: Observable<T>) => O
): OperatorFunction<T, ObservedValueOf<O>>;

/**
 * @deprecated Will be removed in v8. Use the {@link connectable} observable, the {@link connect} operator or the
 * {@link share} operator instead. See the overloads below for equivalent replacement examples of this operator's
 * behaviors.
 * Details: <https://rxjs.dev/deprecations/multicasting>
 *
 * 将在 v8 中删除。请改用 {@link connectable} observable、{@link connect} 操作符或 {@link share} 操作符。有关此操作符行为的等效替换示例，请参见其它重载形式。详细信息： <https://rxjs.dev/deprecations/multicasting>
 *
 */
export function multicast<T, R>(
  subjectOrSubjectFactory: Subject<T> | (() => Subject<T>),
  selector?: (source: Observable<T>) => Observable<R>
): OperatorFunction<T, R> {
  const subjectFactory = isFunction(subjectOrSubjectFactory) ? subjectOrSubjectFactory : () => subjectOrSubjectFactory;

  if (isFunction(selector)) {
    // If a selector function is provided, then we're a "normal" operator that isn't
    // going to return a ConnectableObservable. We can use `connect` to do what we
    // need to do.
    return connect(selector, {
      connector: subjectFactory,
    });
  }

  return (source: Observable<T>) => new ConnectableObservable<any>(source, subjectFactory);
}
