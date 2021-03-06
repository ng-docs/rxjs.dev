import { scheduleObservable } from './scheduleObservable';
import { schedulePromise } from './schedulePromise';
import { scheduleArray } from './scheduleArray';
import { scheduleIterable } from './scheduleIterable';
import { scheduleAsyncIterable } from './scheduleAsyncIterable';
import { isInteropObservable } from '../util/isInteropObservable';
import { isPromise } from '../util/isPromise';
import { isArrayLike } from '../util/isArrayLike';
import { isIterable } from '../util/isIterable';
import { ObservableInput, SchedulerLike } from '../types';
import { Observable } from '../Observable';
import { isAsyncIterable } from '../util/isAsyncIterable';
import { createInvalidObservableTypeError } from '../util/throwUnobservableError';
import { isReadableStreamLike } from '../util/isReadableStreamLike';
import { scheduleReadableStreamLike } from './scheduleReadableStreamLike';

/**
 * Converts from a common {@link ObservableInput} type to an observable where subscription and emissions
 * are scheduled on the provided scheduler.
 *
 * 从常见的 {@link ObservableInput} 类型转换为在所提供的调度器上安排订阅和发出条目的 Observable。
 *
 * @see {@link from}
 * @see {@link of}
 * @param input The observable, array, promise, iterable, etc you would like to schedule
 *
 * 你想要安排的 Observable、数组、Promise、可迭代者等
 *
 * @param scheduler The scheduler to use to schedule the subscription and emissions from
 * the returned observable.
 *
 * 用于从返回的 observable 调度订阅和发出的条目的调度器。
 *
 */
export function scheduled<T>(input: ObservableInput<T>, scheduler: SchedulerLike): Observable<T> {
  if (input != null) {
    if (isInteropObservable(input)) {
      return scheduleObservable(input, scheduler);
    }
    if (isArrayLike(input)) {
      return scheduleArray(input, scheduler);
    }
    if (isPromise(input)) {
      return schedulePromise(input, scheduler);
    }
    if (isAsyncIterable(input)) {
      return scheduleAsyncIterable(input, scheduler);
    }
    if (isIterable(input)) {
      return scheduleIterable(input, scheduler);
    }
    if (isReadableStreamLike(input)) {
      return scheduleReadableStreamLike(input, scheduler);
    }
  }
  throw createInvalidObservableTypeError(input);
}
