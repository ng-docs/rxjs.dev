# Subject

# 主题

**What is a Subject?** An RxJS Subject is a special type of Observable that allows values to be multicasted to many Observers. While plain Observables are unicast (each subscribed Observer owns an independent execution of the Observable), Subjects are multicast.

**什么是主题？** RxJS Subject 是一种特殊类型的 Observable，它允许将值多播到多个 Observer。虽然普通的 Observable 是单播的（每个订阅的 Observer 都拥有 Observable 的独立执行），但 Subjects 是多播的。

<span class="informal">A Subject is like an Observable, but can multicast to many Observers. Subjects are like EventEmitters: they maintain a registry of many listeners.</span>

Subject 类似于 Observable，但可以多播到多个 Observer。 Subjects 就像 EventEmitters：它们维护着许多监听器的注册表。

**Every Subject is an Observable.** Given a Subject, you can `subscribe` to it, providing an Observer, which will start receiving values normally. From the perspective of the Observer, it cannot tell whether the Observable execution is coming from a plain unicast Observable or a Subject.

**每个 Subject 都是 Observable。**给定一个 Subject，你可以 `subscribe` 它，提供一个 Observer，它将开始正常接收值。从 Observer 的角度来看，它无法判断 Observable 的执行是来自普通的单播 Observable 还是来自 Subject。

Internally to the Subject, `subscribe` does not invoke a new execution that delivers values. It simply registers the given Observer in a list of Observers, similarly to how `addListener` usually works in other libraries and languages.

在 Subject 内部， `subscribe` 不会调用传递值的新执行。它只是在一个观察者列表中注册给定的观察者，类似于 `addListener` 通常在其他库和语言中的工作方式。

**Every Subject is an Observer.** It is an object with the methods `next(v)`, `error(e)`, and `complete()`. To feed a new value to the Subject, just call `next(theValue)`, and it will be multicasted to the Observers registered to listen to the Subject.

**每个主题都是观察者。**它是一个具有方法 `next(v)` 、 `error(e)` 和 `complete()` 的对象。要为 Subject 提供一个新值，只需调用 `next(theValue)` ，它将被多播到注册监听 Subject 的观察者。

In the example below, we have two Observers attached to a Subject, and we feed some values to the Subject:

在下面的示例中，我们有两个观察者附加到一个主题，我们向主题提供一些值：

```ts
import { Subject } from 'rxjs';

const subject = new Subject<number>();

subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`),
});
subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`),
});

subject.next(1);
subject.next(2);

// Logs:
// observerA: 1
// observerB: 1
// observerA: 2
// observerB: 2
```

Since a Subject is an Observer, this also means you may provide a Subject as the argument to the `subscribe` of any Observable, like the example below shows:

由于 Subject 是 Observer，这也意味着你可以提供 Subject 作为任何 Observable `subscribe` 的参数，如下面的示例所示：

```ts
import { Subject, from } from 'rxjs';

const subject = new Subject<number>();

subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`),
});
subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`),
});

const observable = from([1, 2, 3]);

observable.subscribe(subject); // You can subscribe providing a Subject

// Logs:
// observerA: 1
// observerB: 1
// observerA: 2
// observerB: 2
// observerA: 3
// observerB: 3
```

With the approach above, we essentially just converted a unicast Observable execution to multicast, through the Subject. This demonstrates how Subjects are the only way of making any Observable execution be shared to multiple Observers.

使用上述方法，我们基本上只是通过 Subject 将单播 Observable 执行转换为多播。这展示了 Subjects 是如何使任何 Observable 执行共享给多个 Observers 的唯一方法。

There are also a few specializations of the `Subject` type: `BehaviorSubject`, `ReplaySubject`, and `AsyncSubject`.

`Subject` 类型还有一些特化： `BehaviorSubject` 、 `ReplaySubject` 和 `AsyncSubject` 。

## Multicasted Observables

## 多播 Observables

A "multicasted Observable" passes notifications through a Subject which may have many subscribers, whereas a plain "unicast Observable" only sends notifications to a single Observer.

“多播 Observable”通过可能有许多订阅者的 Subject 传递通知，而普通的“单播 Observable”仅向单个 Observer 发送通知。

<span class="informal">A multicasted Observable uses a Subject under the hood to make multiple Observers see the same Observable execution.</span>

多播的 Observable 在底层使用 Subject 来让多个 Observer 看到相同的 Observable 执行。

Under the hood, this is how the `multicast` operator works: Observers subscribe to an underlying Subject, and the Subject subscribes to the source Observable. The following example is similar to the previous example which used `observable.subscribe(subject)`:

在底层，这就是 `multicast` 操作符的工作方式：观察者订阅底层主题，主题订阅源 Observable。下面的例子类似于前面使用 `observable.subscribe(subject)` 的例子：

```ts
import { from, Subject, multicast } from 'rxjs';

const source = from([1, 2, 3]);
const subject = new Subject();
const multicasted = source.pipe(multicast(subject));

// These are, under the hood, `subject.subscribe({...})`:
multicasted.subscribe({
  next: (v) => console.log(`observerA: ${v}`),
});
multicasted.subscribe({
  next: (v) => console.log(`observerB: ${v}`),
});

// This is, under the hood, `source.subscribe(subject)`:
multicasted.connect();
```

`multicast` returns an Observable that looks like a normal Observable, but works like a Subject when it comes to subscribing. `multicast` returns a `ConnectableObservable`, which is simply an Observable with the `connect()` method.

`multicast` 返回一个看起来像普通 Observable 的 Observable，但在订阅时像 Subject 一样工作。 `multicast` 返回一个 `ConnectableObservable` ，它只是一个带有 `connect()` 方法的 Observable。

The `connect()` method is important to determine exactly when the shared Observable execution will start. Because `connect()` does `source.subscribe(subject)` under the hood, `connect()` returns a Subscription, which you can unsubscribe from in order to cancel the shared Observable execution.

`connect()` 方法对于确定共享的 Observable 执行何时开始非常重要。因为 `connect()` 在后台执行 `source.subscribe(subject)` ，所以 `connect()` 返回一个订阅，你可以取消订阅以取消共享的 Observable 执行。

### Reference counting

### 引用计数

Calling `connect()` manually and handling the Subscription is often cumbersome. Usually, we want to _automatically_ connect when the first Observer arrives, and automatically cancel the shared execution when the last Observer unsubscribes.

手动调用 `connect()` 并处理订阅通常很麻烦。通常，我们希望在第一个 Observer 到达时 _ 自动 _ 连接，并在最后一个 Observer 取消订阅时自动取消共享执行。

Consider the following example where subscriptions occur as outlined by this list:

请考虑以下示例，其中发生了此列表中列出的订阅：

1. First Observer subscribes to the multicasted Observable

   First Observer 订阅多播的 Observable

2. **The multicasted Observable is connected**

   **多播的 Observable 已连接**

3. The `next` value `0` is delivered to the first Observer

   `next` 值 `0` 被传递给第一个观察者

4. Second Observer subscribes to the multicasted Observable

   第二个观察者订阅了多播的 Observable

5. The `next` value `1` is delivered to the first Observer

   `next` 值 `1` 被传递给第一个观察者

6. The `next` value `1` is delivered to the second Observer

   `next` 值 `1` 被传递给第二个观察者

7. First Observer unsubscribes from the multicasted Observable

   First Observer 取消订阅多播的 Observable

8. The `next` value `2` is delivered to the second Observer

   `next` 值 `2` 被传递给第二个观察者

9. Second Observer unsubscribes from the multicasted Observable

   第二个观察者取消订阅多播的 Observable

10. **The connection to the multicasted Observable is unsubscribed**

    **与多播的 Observable 的连接被取消订阅**

To achieve that with explicit calls to `connect()`, we write the following code:

为了通过显式调用 `connect()` 来实现这一点，我们编写了以下代码：

```ts
import { interval, Subject, multicast } from 'rxjs';

const source = interval(500);
const subject = new Subject();
const multicasted = source.pipe(multicast(subject));
let subscription1, subscription2, subscriptionConnect;

subscription1 = multicasted.subscribe({
  next: (v) => console.log(`observerA: ${v}`),
});
// We should call `connect()` here, because the first
// subscriber to `multicasted` is interested in consuming values
subscriptionConnect = multicasted.connect();

setTimeout(() => {
  subscription2 = multicasted.subscribe({
    next: (v) => console.log(`observerB: ${v}`),
  });
}, 600);

setTimeout(() => {
  subscription1.unsubscribe();
}, 1200);

// We should unsubscribe the shared Observable execution here,
// because `multicasted` would have no more subscribers after this
setTimeout(() => {
  subscription2.unsubscribe();
  subscriptionConnect.unsubscribe(); // for the shared Observable execution
}, 2000);
```

If we wish to avoid explicit calls to `connect()`, we can use ConnectableObservable's `refCount()` method (reference counting), which returns an Observable that keeps track of how many subscribers it has. When the number of subscribers increases from `0` to `1`, it will call `connect()` for us, which starts the shared execution. Only when the number of subscribers decreases from `1` to `0` will it be fully unsubscribed, stopping further execution.

如果我们希望避免显式调用 `connect()` ，我们可以使用 ConnectableObservable 的 `refCount()` 方法（引用计数），它返回一个 Observable 来跟踪它有多少订阅者。当订阅者数量从 `0` 增加到 `1` 时，它会为我们调用 `connect()` ，从而开始共享执行。只有当订阅者数量从 `1` 减少到 `0` 时，才会完全取消订阅，停止进一步执行。

<span class="informal">`refCount` makes the multicasted Observable automatically start executing when the first subscriber arrives, and stop executing when the last subscriber leaves.</span>

`refCount` 使多播的 Observable 在第一个订阅者到达时自动开始执行，并在最后一个订阅者离开时停止执行。

Below is an example:

下面是一个例子：

```ts
import { interval, Subject, multicast, refCount } from 'rxjs';

const source = interval(500);
const subject = new Subject();
const refCounted = source.pipe(multicast(subject), refCount());
let subscription1, subscription2;

// This calls `connect()`, because
// it is the first subscriber to `refCounted`
console.log('observerA subscribed');
subscription1 = refCounted.subscribe({
  next: (v) => console.log(`observerA: ${v}`),
});

setTimeout(() => {
  console.log('observerB subscribed');
  subscription2 = refCounted.subscribe({
    next: (v) => console.log(`observerB: ${v}`),
  });
}, 600);

setTimeout(() => {
  console.log('observerA unsubscribed');
  subscription1.unsubscribe();
}, 1200);

// This is when the shared Observable execution will stop, because
// `refCounted` would have no more subscribers after this
setTimeout(() => {
  console.log('observerB unsubscribed');
  subscription2.unsubscribe();
}, 2000);

// Logs
// observerA subscribed
// observerA: 0
// observerB subscribed
// observerA: 1
// observerB: 1
// observerA unsubscribed
// observerB: 2
// observerB unsubscribed
```

The `refCount()` method only exists on ConnectableObservable, and it returns an `Observable`, not another ConnectableObservable.

`refCount()` 方法只存在于 ConnectableObservable 上，它返回一个 `Observable` ，而不是另一个 ConnectableObservable。

## BehaviorSubject

## 行为主体

One of the variants of Subjects is the `BehaviorSubject`, which has a notion of "the current value". It stores the latest value emitted to its consumers, and whenever a new Observer subscribes, it will immediately receive the "current value" from the `BehaviorSubject`.

Subjects 的变体之一是 `BehaviorSubject` ，它具有“当前值”的概念。它存储发送给其消费者的最新值，并且每当有新的观察者订阅时，它将立即从 `BehaviorSubject` 接收“当前值”。

<span class="informal">BehaviorSubjects are useful for representing "values over time". For instance, an event stream of birthdays is a Subject, but the stream of a person's age would be a BehaviorSubject.</span>

BehaviorSubjects 对于表示“随时间变化的值”很有用。例如，生日事件流是一个主题，但一个人的年龄流是一个行为主题。

In the following example, the BehaviorSubject is initialized with the value `0` which the first Observer receives when it subscribes. The second Observer receives the value `2` even though it subscribed after the value `2` was sent.

在下面的示例中， BehaviorSubject 使用第一个观察者在订阅时收到的值 `0` 进行初始化。第二个观察者接收到值 `2` ，即使它是在发送值 `2` 之后订阅的。

```ts
import { BehaviorSubject } from 'rxjs';
const subject = new BehaviorSubject(0); // 0 is the initial value

subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`),
});

subject.next(1);
subject.next(2);

subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`),
});

subject.next(3);

// Logs
// observerA: 0
// observerA: 1
// observerA: 2
// observerB: 2
// observerA: 3
// observerB: 3
```

## ReplaySubject

## 重播主题

A `ReplaySubject` is similar to a `BehaviorSubject` in that it can send old values to new subscribers, but it can also _record_ a part of the Observable execution.

`ReplaySubject` 与 `BehaviorSubject` 类似，它可以将旧值发送给新订阅者，但它也可以\_ 记录\_Observable 执行的一部分。

<span class="informal">A `ReplaySubject` records multiple values from the Observable execution and replays them to new subscribers.</span>

`ReplaySubject` 记录来自 Observable 执行的多个值，并将它们重播给新订阅者。

When creating a `ReplaySubject`, you can specify how many values to replay:

创建 `ReplaySubject` 时，你可以指定要重播的值的数量：

```ts
import { ReplaySubject } from 'rxjs';
const subject = new ReplaySubject(3); // buffer 3 values for new subscribers

subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`),
});

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`),
});

subject.next(5);

// Logs:
// observerA: 1
// observerA: 2
// observerA: 3
// observerA: 4
// observerB: 2
// observerB: 3
// observerB: 4
// observerA: 5
// observerB: 5
```

You can also specify a _window time_ in milliseconds, besides of the buffer size, to determine how old the recorded values can be. In the following example we use a large buffer size of `100`, but a window time parameter of just `500` milliseconds.

除了缓冲区大小之外，你还可以指定一个以毫秒为单位的 _ 窗口时间 _，以确定记录的值可以存在多长时间。在以下示例中，我们使用 `100` 的大缓冲区大小，但窗口时间参数仅为 `500` 毫秒。

<!-- skip-example -->

```ts
import { ReplaySubject } from 'rxjs';
const subject = new ReplaySubject(100, 500 /* windowTime */);

subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`),
});

let i = 1;
setInterval(() => subject.next(i++), 200);

setTimeout(() => {
  subject.subscribe({
    next: (v) => console.log(`observerB: ${v}`),
  });
}, 1000);

// Logs
// observerA: 1
// observerA: 2
// observerA: 3
// observerA: 4
// observerA: 5
// observerB: 3
// observerB: 4
// observerB: 5
// observerA: 6
// observerB: 6
// ...
```

## AsyncSubject

## 异步主题

The AsyncSubject is a variant where only the last value of the Observable execution is sent to its observers, and only when the execution completes.

AsyncSubject 是一种变体，其中仅将 Observable 执行的最后一个值发送给其观察者，并且仅在执行完成时发送。

```js
import { AsyncSubject } from 'rxjs';
const subject = new AsyncSubject();

subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`),
});

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`),
});

subject.next(5);
subject.complete();

// Logs:
// observerA: 5
// observerB: 5
```

The AsyncSubject is similar to the [`last()`](/api/operators/last) operator, in that it waits for the `complete` notification in order to deliver a single value.

AsyncSubject 类似于[`last()`](/api/operators/last)运算符，因为它等待 `complete` 通知以传递单个值。

## Void subject

## 无效主题

Sometimes the emitted value doesn't matter as much as the fact that a value was emitted.

有时，发出的值并不像发出值的事实那么重要。

For instance, the code below signals that one second has passed.

例如，下面的代码表示已经过了一秒钟。

```ts
const subject = new Subject<string>();
setTimeout(() => subject.next('dummy'), 1000);
```

Passing a dummy value this way is clumsy and can confuse users.

以这种方式传递一个虚拟值很笨拙，并且可能会使用户感到困惑。

By declaring a _void subject_, you signal that the value is irrelevant. Only the event itself matters.

通过声明一个 _void subject_ ，你表示该值是不相关的。只有事件本身很重要。

```ts
const subject = new Subject<void>();
setTimeout(() => subject.next(), 1000);
```

A complete example with context is shown below:

带有上下文的完整示例如下所示：

```ts
import { Subject } from 'rxjs';

const subject = new Subject(); // Shorthand for Subject<void>

subject.subscribe({
  next: () => console.log('One second has passed'),
});

setTimeout(() => subject.next(), 1000);
```

<span class="informal">Before version 7, the default type of Subject values was `any`. `Subject<any>` disables type checking of the emitted values, whereas `Subject<void>` prevents accidental access to the emitted value. If you want the old behavior, then replace `Subject` with `Subject<any>`.</span>

在版本 7 之前，Subject 值的默认类型是 `any` 。 `Subject<any>` 禁用发出值的类型检查，而 `Subject<void>` 防止意外访问发出的值。如果你想要旧行为，请将 `Subject` 替换为 `Subject<any>` 。

