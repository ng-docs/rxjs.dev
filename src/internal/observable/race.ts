import { Observable } from '../Observable';
import { innerFrom } from './innerFrom';
import { Subscription } from '../Subscription';
import { ObservableInput, ObservableInputTuple } from '../types';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { OperatorSubscriber } from '../operators/OperatorSubscriber';
import { Subscriber } from '../Subscriber';

export function race<T extends readonly unknown[]>(inputs: [...ObservableInputTuple<T>]): Observable<T[number]>;
export function race<T extends readonly unknown[]>(...inputs: [...ObservableInputTuple<T>]): Observable<T[number]>;

/**
 * Returns an observable that mirrors the first source observable to emit an item.
 *
 * 返回一个 observable，它会镜像第一个发送条目的来源 observable。
 *
 * ![](race.png)
 *
 * `race` returns an observable, that when subscribed to, subscribes to all source observables immediately.
 * As soon as one of the source observables emits a value, the result unsubscribes from the other sources.
 * The resulting observable will forward all notifications, including error and completion, from the "winning"
 * source observable.
 *
 * `race` 会返回一个 observable，当订阅它时，它会立即订阅所有来源 observables。一旦其中一个来源 observables 发送了一个值，它就会退订其他源。其结果 observable 将转发来自“获胜”源 observable 的所有通知，包括错误和完成。
 *
 * If one of the used source observable throws an errors before a first notification
 * the race operator will also throw an error, no matter if another source observable
 * could potentially win the race.
 *
 * 如果一个已使用的源 observable 在第一次通知之前抛出一个错误，那么无论另一个源 observable 是否有可能赢得这场竞速，race 操作符都会抛出一个错误。
 *
 * `race` can be useful for selecting the response from the fastest network connection for
 * HTTP or WebSockets. `race` can also be useful for switching observable context based on user
 * input.
 *
 * `race` 对于从 HTTP 或 WebSockets 的最快网络连接中选取一个响应是很有用的。`race` 在需要根据用户输入切换可观察者上下文时也很有用。
 *
 * ## Example
 *
 * ## 例子
 *
 * Subscribes to the observable that was the first to start emitting.
 *
 * 订阅第一个开始发送的 observable。
 *
 * ```ts
 * import { interval, map, race } from 'rxjs';
 *
 * const obs1 = interval(7000).pipe(map(() => 'slow one'));
 * const obs2 = interval(3000).pipe(map(() => 'fast one'));
 * const obs3 = interval(5000).pipe(map(() => 'medium one'));
 *
 * race(obs1, obs2, obs3)
 *   .subscribe(winner => console.log(winner));
 *
 * // Outputs
 * // a series of 'fast one'
 * ```
 * @param {...Observables} ...observables sources used to race for which Observable emits first.
 *
 * 要竞争谁先发送值的几个源 Observable。
 *
 * @return {Observable} an Observable that mirrors the output of the first Observable to emit an item.
 *
 * 一个 Observable，它镜像了第一个发送条目的 Observable 的输出。
 *
 */
export function race<T>(...sources: (ObservableInput<T> | ObservableInput<T>[])[]): Observable<any> {
  sources = argsOrArgArray(sources);
  // If only one source was passed, just return it. Otherwise return the race.
  return sources.length === 1 ? innerFrom(sources[0] as ObservableInput<T>) : new Observable<T>(raceInit(sources as ObservableInput<T>[]));
}

/**
 * An observable initializer function for both the static version and the
 * operator version of race.
 *
 * 用于静态版本和操作符版本的可观察初始化函数。
 *
 * @param sources The sources to race
 *
 * 要竞速的源
 *
 */
export function raceInit<T>(sources: ObservableInput<T>[]) {
  return (subscriber: Subscriber<T>) => {
    let subscriptions: Subscription[] = [];

    // Subscribe to all of the sources. Note that we are checking `subscriptions` here
    // Is is an array of all actively "racing" subscriptions, and it is `null` after the
    // race has been won. So, if we have racer that synchronously "wins", this loop will
    // stop before it subscribes to any more.
    for (let i = 0; subscriptions && !subscriber.closed && i < sources.length; i++) {
      subscriptions.push(
        innerFrom(sources[i] as ObservableInput<T>).subscribe(
          new OperatorSubscriber(subscriber, (value) => {
            if (subscriptions) {
              // We're still racing, but we won! So unsubscribe
              // all other subscriptions that we have, except this one.
              for (let s = 0; s < subscriptions.length; s++) {
                s !== i && subscriptions[s].unsubscribe();
              }
              subscriptions = null!;
            }
            subscriber.next(value);
          })
        )
      );
    }
  };
}
