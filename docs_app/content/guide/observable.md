# Observable

# 可观察者

Observables are lazy Push collections of multiple values. They fill the missing spot in the following table:

Observables 是多个值的惰性 Push 集合。他们填补了下表中的缺失点：

|  | Single | Multiple |
| --- | ------ | -------- |
|  | 单身的 | 多种的 |
| **Pull** | [`Function`](https://developer.mozilla.org/en-US/docs/Glossary/Function) | [`Iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) |
| **拉** | [`Function`](https://developer.mozilla.org/en-US/docs/Glossary/Function) | [`Iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) |
| **Push** | [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) | [`Observable`](/api/index/class/Observable) |
| **推** | [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) | [`Observable`](/api/index/class/Observable) |

**Example.** The following is an Observable that pushes the values `1`, `2`, `3` immediately (synchronously) when subscribed, and the value `4` after one second has passed since the subscribe call, then completes:

**例子。**下面是一个 Observable，它在订阅时立即（同步）推送值 `1` 、 `2` 、 `3` ，并且在 subscribe 调用后一秒后推送值 `4`，然后完成：

```ts
import { Observable } from 'rxjs';

const observable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    subscriber.next(4);
    subscriber.complete();
  }, 1000);
});
```

To invoke the Observable and see these values, we need to *subscribe* to it:

要调用 Observable 并查看这些值，我们需要*订阅*它：

```ts
import { Observable } from 'rxjs';

const observable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    subscriber.next(4);
    subscriber.complete();
  }, 1000);
});

console.log('just before subscribe');
observable.subscribe({
  next(x) { console.log('got value ' + x); },
  error(err) { console.error('something wrong occurred: ' + err); },
  complete() { console.log('done'); }
});
console.log('just after subscribe');
```

Which executes as such on the console:

在控制台上执行如下：

```none
just before subscribe
got value 1
got value 2
got value 3
just after subscribe
got value 4
done
```

## Pull versus Push

## 拉与推

*Pull* and *Push* are two different protocols that describe how a data *Producer* can communicate with a data *Consumer*.

*Pull*和*Push*是两种不同的协议，用于描述数据*Producer*如何与数据*Consumer*通信。

**What is Pull?** In Pull systems, the Consumer determines when it receives data from the data Producer. The Producer itself is unaware of when the data will be delivered to the Consumer.

**什么是拉力？**在拉取系统中，消费者确定何时从数据生产者接收数据。生产者本身不知道数据何时交付给消费者。

Every JavaScript Function is a Pull system. The function is a Producer of data, and the code that calls the function is consuming it by "pulling" out a *single* return value from its call.

每个 JavaScript 函数都是一个拉取系统。该函数是数据的生产者，调用该函数的代码通过从其调用中“拉”出*单个*返回值来使用它。

ES2015 introduced [generator functions and iterators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) (`function*`), another type of Pull system. Code that calls `iterator.next()` is the Consumer, "pulling" out *multiple* values from the iterator (the Producer).

ES2015 引入了[生成器函数和迭代器](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)（ `function*` ），另一种类型的 Pull 系统。调用 `iterator.next()` 的代码是消费者，从迭代器（生产者）“拉”出*多个*值。

|  | Producer | Consumer |
| --- | -------- | -------- |
|  | 制片人 | 消费者 |
| **Pull** | **Passive:** produces data when requested. | **Active:** decides when data is requested. |
| **拉** | **被动：**在请求时产生数据。| **活动：**决定何时请求数据。|
| **Push** | **Active:** produces data at its own pace. | **Passive:** reacts to received data. |
| **推** | **主动：**按照自己的节奏生成数据。| **被动：**对接收到的数据做出反应。|

**What is Push?** In Push systems, the Producer determines when to send data to the Consumer. The Consumer is unaware of when it will receive that data.

**什么是推送？**在推送系统中，生产者决定何时向消费者发送数据。消费者不知道何时会收到该数据。

Promises are the most common type of Push system in JavaScript today. A Promise (the Producer) delivers a resolved value to registered callbacks (the Consumers), but unlike functions, it is the Promise which is in charge of determining precisely when that value is "pushed" to the callbacks.

Promise 是当今 JavaScript 中最常见的推送系统类型。Promise（生产者）向注册的回调（消费者）传递解析值，但与函数不同的是，Promise 负责准确确定该值何时“推送”到回调。

RxJS introduces Observables, a new Push system for JavaScript. An Observable is a Producer of multiple values, "pushing" them to Observers (Consumers).

RxJS 引入了 Observables，一个新的 JavaScript 推送系统。Observable 是多个值的生产者，将它们“推送”给观察者（消费者）。

- A **Function** is a lazily evaluated computation that synchronously returns a single value on invocation.

  **函数**是一种延迟计算的计算，它在调用时同步返回单个值。

- A **generator** is a lazily evaluated computation that synchronously returns zero to (potentially) infinite values on iteration.

  **生成器**是一种延迟计算的计算，它在迭代时同步返回零到（可能）无限值。

- A **Promise** is a computation that may (or may not) eventually return a single value.

  **Promise**是一种可能（或可能不会）最终返回单个值的计算。

- An **Observable** is a lazily evaluated computation that can synchronously or asynchronously return zero to (potentially) infinite values from the time it's invoked onwards.

  **Observable**是一种延迟计算的计算，从它被调用的那一刻起，它可以同步或异步返回零到（可能）无限值。

<span class="informal">For more info about what to use when converting Observables to Promises, please refer to [this guide](/deprecations/to-promise).</span>

<span class="informal">有关将 Observables 转换为 Promise 时使用什么的更多信息，请参阅[本指南](/deprecations/to-promise)。</span>

## Observables as generalizations of functions

## Observables 作为函数的概括

Contrary to popular claims, Observables are not like EventEmitters nor are they like Promises for multiple values. Observables *may act* like EventEmitters in some cases, namely when they are multicasted using RxJS Subjects, but usually they don't act like EventEmitters.

与流行的说法相反，Observables 不像 EventEmitters 也不像 Promises 用于多个值。在某些情况下，Observable 的*行为可能*类似于 EventEmitter，即当它们使用 RxJS 主题进行多播时，但通常它们的行为不像 EventEmitters。

<span class="informal">Observables are like functions with zero arguments, but generalize those to allow multiple values.</span>

Observables 类似于具有零参数的函数，但将它们泛化为允许多个值。

Consider the following:

考虑以下：

```ts
function foo() {
  console.log('Hello');
  return 42;
}

const x = foo.call(); // same as foo()
console.log(x);
const y = foo.call(); // same as foo()
console.log(y);
```

We expect to see as output:

我们希望看到输出：

```none
"Hello"
42
"Hello"
42
```

You can write the same behavior above, but with Observables:

你可以在上面编写相同的行为，但使用 Observables：

```ts
import { Observable } from 'rxjs';

const foo = new Observable(subscriber => {
  console.log('Hello');
  subscriber.next(42);
});

foo.subscribe(x => {
  console.log(x);
});
foo.subscribe(y => {
  console.log(y);
});
```

And the output is the same:

输出是一样的：

```none
"Hello"
42
"Hello"
42
```

This happens because both functions and Observables are lazy computations. If you don't call the function, the `console.log('Hello')` won't happen. Also with Observables, if you don't "call" it (with `subscribe`), the `console.log('Hello')` won't happen. Plus, "calling" or "subscribing" is an isolated operation: two function calls trigger two separate side effects, and two Observable subscribes trigger two separate side effects. As opposed to EventEmitters which share the side effects and have eager
execution regardless of the existence of subscribers, Observables have no shared execution and are lazy.

这是因为函数和 Observable 都是惰性计算。如果你不调用该函数， `console.log('Hello')` 将不会发生。同样对于 Observables，如果你不“调用”它（使用 `subscribe`），`console.log('Hello')` 将不会发生。另外，“调用”或“订阅”是一个孤立的操作：两个函数调用触发两个单独的副作用，两个 Observable 订阅触发两个单独的副作用。与 EventEmitter 共享副作用并且无论订阅者是否存在都急切执行相反，Observables 没有共享执行并且是惰性的。

<span class="informal">Subscribing to an Observable is analogous to calling a Function.</span>

<span class="informal">订阅 Observable 类似于调用函数。</span>

Some people claim that Observables are asynchronous. That is not true. If you surround a function call with logs, like this:

有些人声称 Observables 是异步的。那不是真的。如果你使用日志包围函数调用，如下所示：

```js
console.log('before');
console.log(foo.call());
console.log('after');
```

You will see the output:

你将看到输出：

```none
"before"
"Hello"
42
"after"
```

And this is the same behavior with Observables:

这与 Observables 的行为相同：

```js
console.log('before');
foo.subscribe(x => {
  console.log(x);
});
console.log('after');
```

And the output is:

输出是：

```none
"before"
"Hello"
42
"after"
```

Which proves the subscription of `foo` was entirely synchronous, just like a function.

这证明 `foo` 的订阅是完全同步的，就像一个函数一样。

<span class="informal">Observables are able to deliver values either synchronously or asynchronously.</span>

<span class="informal">Observables 能够同步或异步地传递值。</span>

What is the difference between an Observable and a function? **Observables can "return" multiple values over time**, something which functions cannot. You can't do this:

Observable 和函数有什么区别？ **Observables 可以随着时间的推移“返回”多个值**，而函数不能。你不能这样做：

```js
function foo() {
  console.log('Hello');
  return 42;
  return 100; // dead code. will never happen
}
```

Functions can only return one value. Observables, however, can do this:

函数只能返回一个值。然而，Observables 可以这样做：

```ts
import { Observable } from 'rxjs';

const foo = new Observable(subscriber => {
  console.log('Hello');
  subscriber.next(42);
  subscriber.next(100); // "return" another value
  subscriber.next(200); // "return" yet another
});

console.log('before');
foo.subscribe(x => {
  console.log(x);
});
console.log('after');
```

With synchronous output:

带同步输出：

```none
"before"
"Hello"
42
100
200
"after"
```

But you can also "return" values asynchronously:

但你也可以异步“返回”值：

```ts
import { Observable } from 'rxjs';

const foo = new Observable(subscriber => {
  console.log('Hello');
  subscriber.next(42);
  subscriber.next(100);
  subscriber.next(200);
  setTimeout(() => {
    subscriber.next(300); // happens asynchronously
  }, 1000);
});

console.log('before');
foo.subscribe(x => {
  console.log(x);
});
console.log('after');
```

With output:

带输出：

```none
"before"
"Hello"
42
100
200
"after"
300
```

Conclusion:

结论：

- `func.call()` means "*give me one value synchronously*"

  `func.call()` 意思是“*同步给我一个值*”

- `observable.subscribe()` means "*give me any amount of values, either synchronously or asynchronously*"

  `observable.subscribe()` 的意思是“*给我任意数量的值，无论是同步的还是异步的*”

## Anatomy of an Observable

## Observable 剖析

Observables are **created** using `new Observable` or a creation operator, are **subscribed** to with an Observer, **execute** to deliver `next` / `error` / `complete` notifications to the Observer, and their execution may be **disposed**. These four aspects are all encoded in an Observable instance, but some of these aspects are related to other types, like Observer and Subscription.

Observables 使用 `new Observable` 或**创建**操作符创建，使用 Observer**订阅**，**执行**以向 Observer 传递 `next` / `error` / `complete` 通知，并且它们的执行可能会被**释放**。这四个方面都编码在一个 Observable 实例中，但其中一些方面与其他类型相关，例如 Observer 和 Subscription。

Core Observable concerns:

核心 Observable 关注点：

- **Creating** Observables

  **创建**Observables

- **Subscribing** to Observables

  **订阅**Observables

- **Executing** the Observable

  **执行**Observable

- **Disposing** Observables

  **处理**Observables

### Creating Observables

### 创建 Observables

The `Observable` constructor takes one argument: the `subscribe` function.

`Observable` 构造函数接受一个参数： `subscribe` 函数。

The following example creates an Observable to emit the string `'hi'` every second to a subscriber.

下面的示例创建一个 Observable 以每秒向订阅者发送字符串 `'hi'`。

```ts
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  const id = setInterval(() => {
    subscriber.next('hi')
  }, 1000);
});
```

<span class="informal">Observables can be created with `new Observable`. Most commonly, observables are created using creation functions, like `of`, `from`, `interval`, etc.</span>

可以使用 `new Observable`。最常见的是，可观察对象是使用创建函数创建的，例如 `of`、`from`、`interval` 等。

In the example above, the `subscribe` function is the most important piece to describe the Observable. Let's look at what subscribing means.

在上面的例子中，`subscribe` 函数是描述 Observable 的最重要的部分。让我们看看订阅是什么意思。

### Subscribing to Observables

### 订阅 Observables

The Observable `observable` in the example can be *subscribed* to, like this:

示例中的 Observable `observable` 可以*订阅*，如下所示：

```ts
observable.subscribe(x => console.log(x));
```

It is not a coincidence that `observable.subscribe` and `subscribe` in `new Observable(function subscribe(subscriber) {...})` have the same name. In the library, they are different, but for practical purposes you can consider them conceptually equal.

`observable.subscribe` 和 new Observable(function `subscribe` `new Observable(function subscribe(subscriber) {...})` 中的 subscribe 同名并非巧合。在库中，它们是不同的，但出于实际目的，你可以认为它们在概念上是相同的。

This shows how `subscribe` calls are not shared among multiple Observers of the same Observable. When calling `observable.subscribe` with an Observer, the function `subscribe` in `new Observable(function subscribe(subscriber) {...})` is run for that given subscriber. Each call to `observable.subscribe` triggers its own independent setup for that given subscriber.

这显示了 `subscribe` 调用如何在同一个 Observable 的多个观察者之间不共享。当使用 Observer 调用 `observable.subscribe` 时，new Observable(function `subscribe` `new Observable(function subscribe(subscriber) {...})` 中的函数 subscribe 会针对给定的订阅者运行。对 `observable.subscribe` 的每次调用都会为给定的订阅者触发其自己的独立设置。

<span class="informal">Subscribing to an Observable is like calling a function, providing callbacks where the data will be delivered to.</span>

订阅 Observable 就像调用一个函数，提供数据将被传递到的回调。

This is drastically different to event handler APIs like `addEventListener` / `removeEventListener`. With `observable.subscribe`, the given Observer is not registered as a listener in the Observable. The Observable does not even maintain a list of attached Observers.

这与 `addEventListener` / `removeEventListener` 等事件处理程序 API 截然不同。使用 `observable.subscribe`，给定的 Observer 不会在 Observable 中注册为监听器。Observable 甚至不维护附加的观察者列表。

A `subscribe` call is simply a way to start an "Observable execution" and deliver values or events to an Observer of that execution.

`subscribe` 调用只是一种启动“可观察执行”并将值或事件传递给该执行的观察者的方法。

### Executing Observables

### 执行 Observables

The code inside `new Observable(function subscribe(subscriber) {...})` represents an "Observable execution", a lazy computation that only happens for each Observer that subscribes. The execution produces multiple values over time, either synchronously or asynchronously.

`new Observable(function subscribe(subscriber) {...})` 中的代码表示“Observable 执行”，这是一种惰性计算，只发生在每个订阅的 Observer 上。随着时间的推移，执行会同步或异步地产生多个值。

There are three types of values an Observable Execution can deliver:

Observable Execution 可以传递三种类型的值：

- "Next" notification: sends a value such as a Number, a String, an Object, etc.

  “Next”通知：发送数值、字符串、对象等。

- "Error" notification: sends a JavaScript Error or exception.

  “错误”通知：发送 JavaScript 错误或异常。

- "Complete" notification: does not send a value.

  “完成”通知：不发送值。

"Next" notifications are the most important and most common type: they represent actual data being delivered to a subscriber. "Error" and "Complete" notifications may happen only once during the Observable Execution, and there can only be either one of them.

“下一个”通知是最重要和最常见的类型：它们代表传递给订阅者的实际数据。在 Observable Execution 期间，“错误”和“完成”通知可能只发生一次，并且只能有其中之一。

These constraints are expressed best in the so-called *Observable Grammar* or *Contract*, written as a regular expression:

这些约束在所谓的*Observable Grammar*或*Contract*中表达得最好，写成正则表达式：

```none
next*(error|complete)?
```

<span class="informal">In an Observable Execution, zero to infinite Next notifications may be delivered. If either an Error or Complete notification is delivered, then nothing else can be delivered afterwards.</span>

<span class="informal">在 Observable Execution 中，可能会传递零到无限的 Next 通知。如果发送了错误或完成通知，则之后无法发送任何其他通知。</span>

The following is an example of an Observable execution that delivers three Next notifications, then completes:

下面是一个 Observable 执行的示例，它传递三个 Next 通知，然后完成：

```ts
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});
```

Observables strictly adhere to the Observable Contract, so the following code would not deliver the Next notification `4`:

Observables 严格遵守 Observable Contract，因此以下代码不会传递 Next 通知 `4` ：

```ts
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
  subscriber.next(4); // Is not delivered because it would violate the contract
});
```

It is a good idea to wrap any code in `subscribe` with `try`/`catch` block that will deliver an Error notification if it catches an exception:

使用 `try` / `catch` 块将任何代码包装在 `subscribe` 中是一个好主意，如果它捕获到异常，它将传递错误通知：

```ts
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  try {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  } catch (err) {
    subscriber.error(err); // delivers an error if it caught one
  }
});
```

### Disposing Observable Executions

### 处理 Observable 执行

Because Observable Executions may be infinite, and it's common for an Observer to want to abort execution in finite time, we need an API for canceling an execution. Since each execution is exclusive to one Observer only, once the Observer is done receiving values, it has to have a way to stop the execution, in order to avoid wasting computation power or memory resources.

因为 Observable Executions 可能是无限的，并且 Observer 想要在有限时间内中止执行是很常见的，所以我们需要一个用于取消执行的 API。由于每次执行只针对一个观察者，一旦观察者完成接收值，它必须有办法停止执行，以避免浪费计算能力或内存资源。

When `observable.subscribe` is called, the Observer gets attached to the newly created Observable execution. This call also returns an object, the `Subscription`:

当 `observable.subscribe` 被调用时，Observer 被附加到新创建的 Observable 执行中。此调用还返回一个对象 `Subscription` ：

```ts
const subscription = observable.subscribe(x => console.log(x));
```

The Subscription represents the ongoing execution, and has a minimal API which allows you to cancel that execution. Read more about the [`Subscription` type here](./guide/subscription). With `subscription.unsubscribe()` you can cancel the ongoing execution:

Subscription 代表正在进行的执行，并具有允许你取消该执行的最小 API。[在此处阅读有关 `Subscription` 类型](./guide/subscription)的更多信息。使用 `subscription.unsubscribe()` 你可以取消正在进行的执行：

```ts
import { from } from 'rxjs';

const observable = from([10, 20, 30]);
const subscription = observable.subscribe(x => console.log(x));
// Later:
subscription.unsubscribe();
```

<span class="informal">When you subscribe, you get back a Subscription, which represents the ongoing execution. Just call `unsubscribe()` to cancel the execution.</span>

<span class="informal">当你订阅时，你会得到一个订阅，它代表正在进行的执行。只需调用 `unsubscribe()` 即可取消执行。</span>

Each Observable must define how to dispose resources of that execution when we create the Observable using `create()`. You can do that by returning a custom `unsubscribe` function from within `function subscribe()`.

当我们使用 `create()` 创建 Observable 时，每个 Observable 都必须定义如何处理该执行的资源。你可以通过从 `function subscribe()` 中返回自定义 `unsubscribe` 函数来做到这一点。

For instance, this is how we clear an interval execution set with `setInterval`:

例如，这就是我们使用 `setInterval` 清除间隔执行集的方式：

```js
const observable = new Observable(function subscribe(subscriber) {
  // Keep track of the interval resource
  const intervalId = setInterval(() => {
    subscriber.next('hi');
  }, 1000);

  // Provide a way of canceling and disposing the interval resource
  return function unsubscribe() {
    clearInterval(intervalId);
  };
});
```

Just like `observable.subscribe` resembles `new Observable(function subscribe() {...})`, the `unsubscribe` we return from `subscribe` is conceptually equal to `subscription.unsubscribe`. In fact, if we remove the ReactiveX types surrounding these concepts, we're left with rather straightforward JavaScript.

就像 `observable.subscribe` 类似于 `new Observable(function subscribe() {...})` 一样，我们从 `subscribe` 返回的 `unsubscribe` 在概念上等于 `subscription.unsubscribe`。事实上，如果我们删除围绕这些概念的 ReactiveX 类型，我们就会得到相当简单的 JavaScript。

```js
function subscribe(subscriber) {
  const intervalId = setInterval(() => {
    subscriber.next('hi');
  }, 1000);

  return function unsubscribe() {
    clearInterval(intervalId);
  };
}

const unsubscribe = subscribe({next: (x) => console.log(x)});

// Later:
unsubscribe(); // dispose the resources
```

The reason why we use Rx types like Observable, Observer, and Subscription is to get safety (such as the Observable Contract) and composability with Operators.

我们使用诸如 Observable、Observer 和 Subscription 之类的 Rx 类型的原因是为了获得安全性（例如 Observable Contract）以及与 Operators 的可组合性。

