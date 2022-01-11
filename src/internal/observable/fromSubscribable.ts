import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscribable } from '../types';

/**
 * Used to convert a subscribable to an observable.
 *
 * 用于将可订阅对象转换为可观察对象。
 *
 * Currently, this is only used within internals.
 *
 * 目前，这仅在内部使用。
 *
 * TODO: Discuss ObservableInput supporting "Subscribable".
 * <https://github.com/ReactiveX/rxjs/issues/5909>
 *
 * TODO：讨论支持“订阅”的 ObservableInput。<https://github.com/ReactiveX/rxjs/issues/5909>
 *
 * @param subscribable A subscribable
 *
 * 可订阅的
 *
 */
export function fromSubscribable<T>(subscribable: Subscribable<T>) {
  return new Observable((subscriber: Subscriber<T>) => subscribable.subscribe(subscriber));
}
