# Scheduler

# 调度器

**What is a Scheduler?** A scheduler controls when a subscription starts and when notifications are delivered. It consists of three components.

**什么是调度程序？**调度程序控制订阅何时开始以及何时传递通知。它由三个组件组成。

- **A Scheduler is a data structure.** It knows how to store and queue tasks based on priority or other criteria.

  **调度器是一种数据结构。**它知道如何根据优先级或其他标准存储和排队任务。

- **A Scheduler is an execution context.** It denotes where and when the task is executed (e.g. immediately, or in another callback mechanism such as setTimeout or process.nextTick, or the animation frame).

  **调度程序是一个执行上下文。**它表示任务在何时何地执行（例如立即执行，或在另一个回调机制中，如 setTimeout 或 process.nextTick，或动画帧）。

- **A Scheduler has a (virtual) clock.** It provides a notion of "time" by a getter method `now()` on the scheduler. Tasks being scheduled on a particular scheduler will adhere only to the time denoted by that clock.

  **调度程序有一个（虚拟）时钟。**它通过调度程序上的 getter 方法 `now()` 提供了“时间”的概念。在特定调度程序上调度的任务将仅遵守该时钟指示的时间。

<span class="informal">A Scheduler lets you define in what execution context will an Observable deliver notifications to its Observer.</span>

<span class="informal">调度程序允许你定义 Observable 将在什么执行上下文中向其观察者传递通知。</span>

In the example below, we take the usual simple Observable that emits values `1`, `2`, `3` synchronously, and use the operator `observeOn` to specify the `async` scheduler to use for delivering those values.

在下面的示例中，我们采用通常的简单 Observable 同步发出值 `1`、`2`、`3`，并使用操作符 `observeOn` 指定用于传递这些值的 `async` 调度程序。

<!-- prettier-ignore -->

```ts
import { Observable, observeOn, asyncScheduler } from 'rxjs';

const observable = new Observable((observer) => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
}).pipe(
  observeOn(asyncScheduler)
);

console.log('just before subscribe');
observable.subscribe({
  next(x) {
    console.log('got value ' + x);
  },
  error(err) {
    console.error('something wrong occurred: ' + err);
  },
  complete() {
    console.log('done');
  },
});
console.log('just after subscribe');
```

Which executes with the output:

与输出一起执行：

```none
just before subscribe
just after subscribe
got value 1
got value 2
got value 3
done
```

Notice how the notifications `got value...` were delivered after `just after subscribe`, which is different to the default behavior we have seen so far. This is because `observeOn(asyncScheduler)` introduces a proxy Observer between `new Observable` and the final Observer. Let's rename some identifiers to make that distinction obvious in the example code:

请注意通知是如何 `got value...` 是 `just after subscribe` 传递的，这与我们目前看到的默认行为不同。这是因为 `observeOn(asyncScheduler)` 在 `new Observable` 和最终的 Observer 之间引入了一个代理 Observer。让我们重命名一些标识符，以使示例代码中的区别显而易见：

<!-- prettier-ignore -->

```ts
import { Observable, observeOn, asyncScheduler } from 'rxjs';

const observable = new Observable((proxyObserver) => {
  proxyObserver.next(1);
  proxyObserver.next(2);
  proxyObserver.next(3);
  proxyObserver.complete();
}).pipe(
  observeOn(asyncScheduler)
);

const finalObserver = {
  next(x) {
    console.log('got value ' + x);
  },
  error(err) {
    console.error('something wrong occurred: ' + err);
  },
  complete() {
    console.log('done');
  },
};

console.log('just before subscribe');
observable.subscribe(finalObserver);
console.log('just after subscribe');
```

The `proxyObserver` is created in `observeOn(asyncScheduler)`, and its `next(val)` function is approximately the following:

`proxyObserver` 是在 `observeOn(asyncScheduler)` 中创建的，它的 `next(val)` 函数大致如下：

<!-- prettier-ignore -->

```ts
const proxyObserver = {
  next(val) {
    asyncScheduler.schedule(
      (x) => finalObserver.next(x),
      0 /* delay */,
      val /* will be the x for the function above */
    );
  },

  // ...
};
```

The `async` Scheduler operates with a `setTimeout` or `setInterval`, even if the given `delay` was zero. As usual, in JavaScript, `setTimeout(fn, 0)` is known to run the function `fn` earliest on the next event loop iteration. This explains why `got value 1` is delivered to the `finalObserver` after `just after subscribe` happened.

`async` 调度程序使用 `setTimeout` 或 `setInterval` 运行，即使给定的 `delay` 为零。像往常一样，在 JavaScript 中，已知 `setTimeout(fn, 0)` 在下一次事件循环迭代中最早运行函数 `fn`。这解释了为什么 `just after subscribe` 发生后将 `got value 1` 传递给 `finalObserver`。

The `schedule()` method of a Scheduler takes a `delay` argument, which refers to a quantity of time relative to the Scheduler's own internal clock. A Scheduler's clock need not have any relation to the actual wall-clock time. This is how temporal operators like `delay` operate not on actual time, but on time dictated by the Scheduler's clock. This is specially useful in testing, where a _virtual time Scheduler_ may be used to fake wall-clock time while in reality executing scheduled tasks synchronously.

Scheduler 的 `schedule()` 方法接受一个 `delay` 参数，它指的是相对于 Scheduler 自己的内部时钟的时间量。调度程序的时钟不需要与实际的挂钟时间有任何关系。这就是像 `delay` 这样的时间操作符不是在实际时间上运行的，而是在调度器时钟指定的时间上运行的。这在测试中特别有用，其中可以使用 _ 虚拟时间调度程序 _ 来伪造挂钟时间，而实际上是同步执行计划任务。

## Scheduler Types

## 调度程序类型

The `async` Scheduler is one of the built-in schedulers provided by RxJS. Each of these can be created and returned by using static properties of the `Scheduler` object.

`async` 调度器是 RxJS 提供的内置调度器之一。这些中的每一个都可以通过使用 `Scheduler` 对象的静态属性来创建和返回。

| Scheduler | Purpose |
| --------- | ------- |
| 调度器 | 目的 |
| `null` | By not passing any scheduler, notifications are delivered synchronously and recursively. Use this for constant-time operations or tail recursive operations. |
| `null` | 通过不传递任何调度程序，通知以同步和递归方式传递。将此用于恒定时间操作或尾递归操作。|
| `queueScheduler` | Schedules on a queue in the current event frame (trampoline scheduler). Use this for iteration operations. |
| `queueScheduler` | 在当前事件框架（蹦床调度程序）中的队列上调度。将其用于迭代操作。|
| `asapScheduler` | Schedules on the micro task queue, which is the same queue used for promises. Basically after the current job, but before the next job. Use this for asynchronous conversions. |
| `asapScheduler` | 在微任务队列上调度，这与用于承诺的队列相同。基本上在当前工作之后，但在下一个工作之前。将此用于异步转换。|
| `asyncScheduler` | Schedules work with `setInterval`. Use this for time-based operations. |
| `asyncScheduler` | 时间表与 `setInterval` 一起使用。将此用于基于时间的操作。|
| `animationFrameScheduler` | Schedules task that will happen just before next browser content repaint. Can be used to create smooth browser animations. |
| `animationFrameScheduler` | 安排将在下一次浏览器内容重绘之前发生的任务。可用于创建流畅的浏览器动画。|

## Using Schedulers

## 使用调度程序

You may have already used schedulers in your RxJS code without explicitly stating the type of schedulers to be used. This is because all Observable operators that deal with concurrency have optional schedulers. If you do not provide the scheduler, RxJS will pick a default scheduler by using the principle of least concurrency. This means that the scheduler which introduces the least amount of concurrency that satisfies the needs of the operator is chosen. For example, for operators returning an observable
with a finite and small number of messages, RxJS uses no Scheduler, i.e. `null` or `undefined`. For operators returning a potentially large or infinite number of messages, `queue` Scheduler is used. For operators which use timers, `async` is used.

你可能已经在你的 RxJS 代码中使用了调度器，而没有明确说明要使用的调度器的类型。这是因为所有处理并发的 Observable 操作符都有可选的调度器。如果你不提供调度器，RxJS 会根据最小并发的原则选择一个默认的调度器。这意味着选择引入满足操作员需求的最少并发量的调度程序。例如，对于返回具有有限且少量消息的 observable 的操作符，RxJS 不使用调度程序，即 `null` 或 `undefined`。对于返回可能大量或无限数量的消息的操作员，使用 `queue` 调度程序。对于使用计时器的运算符，使用 `async`。

Because RxJS uses the least concurrency scheduler, you can pick a different scheduler if you want to introduce concurrency for performance purpose. To specify a particular scheduler, you can use those operator methods that take a scheduler, e.g., `from([10, 20, 30], asyncScheduler)`.

因为 RxJS 使用最少的并发调度器，如果你想为了性能目的引入并发，你可以选择一个不同的调度器。要指定特定的调度程序，你可以使用那些采用调度程序的运算符方法，例如 `from([10, 20, 30], asyncScheduler)`。

**Static creation operators usually take a Scheduler as argument.** For instance, `from(array, scheduler)` lets you specify the Scheduler to use when delivering each notification converted from the `array`. It is usually the last argument to the operator. The following static creation operators take a Scheduler argument:

**静态创建操作符通常以 Scheduler 作为参数。**例如，`from(array, scheduler)` 允许你指定在传递从 `array` 转换的每个通知时要使用的调度程序。它通常是运算符的最后一个参数。以下静态创建运算符采用 Scheduler 参数：

- `bindCallback`
- `bindNodeCallback`
- `combineLatest`
- `concat`
- `empty`
- `from`
- `fromPromise`
- `interval`
- `merge`
- `of`
- `range`
- `throw`
- `timer`

**Use `subscribeOn` to schedule in what context will the `subscribe()` call happen.** By default, a `subscribe()` call on an Observable will happen synchronously and immediately. However, you may delay or schedule the actual subscription to happen on a given Scheduler, using the instance operator `subscribeOn(scheduler)`, where `scheduler` is an argument you provide.

**使用 `subscribeOn` 来安排 `subscribe()` 调用将在什么上下文中发生。**默认情况下，对 Observable 的 `subscribe()` 调用将同步并立即发生。但是，你可以使用实例运算符 `subscribeOn(scheduler)` 延迟或安排在给定调度程序上发生的实际订阅，其中 `scheduler` 是你提供的参数。

**Use `observeOn` to schedule in what context will notifications be delivered.** As we saw in the examples above, instance operator `observeOn(scheduler)` introduces a mediator Observer between the source Observable and the destination Observer, where the mediator schedules calls to the destination Observer using your given `scheduler`.

**使用 `observeOn` 安排在什么上下文中发送通知。**正如我们在上面的例子中看到的，实例操作符 `observeOn(scheduler)` 在源 Observable 和目标 Observer 之间引入了一个中介 Observer，中介使用给定的 `scheduler` 器调度对目标 Observer 的调用。

**Instance operators may take a Scheduler as argument.**

**实例运算符可以将调度程序作为参数。**

Time-related operators like `bufferTime`, `debounceTime`, `delay`, `auditTime`, `sampleTime`, `throttleTime`, `timeInterval`, `timeout`, `timeoutWith`, `windowTime` all take a Scheduler as the last argument, and otherwise operate by default on the `asyncScheduler`.

与时间相关的运算符，如 `bufferTime`、`debounceTime`、`delay`、`auditTime`、`sampleTime`、`throttleTime`、`timeInterval`、`timeout`、`timeoutWith`、`windowTime` 都将 Scheduler 作为最后一个参数，否则默认在 `asyncScheduler` 上运行。

Other instance operators that take a Scheduler as argument: `cache`, `combineLatest`, `concat`, `expand`, `merge`, `publishReplay`, `startWith`.

其他以 Scheduler 作为参数的实例操作符： `cache`、`combineLatest`、`concat`、`expand`、`merge`、`publishReplay`、`startWith`。

Notice that both `cache` and `publishReplay` accept a Scheduler because they utilize a ReplaySubject. The constructor of a ReplaySubjects takes an optional Scheduler as the last argument because ReplaySubject may deal with time, which only makes sense in the context of a Scheduler. By default, a ReplaySubject uses the `queue` Scheduler to provide a clock.

请注意，`cache` 和 `publishReplay` 都接受 Scheduler，因为它们使用了 ReplaySubject。ReplaySubjects 的构造函数将可选的 Scheduler 作为最后一个参数，因为 ReplaySubject 可能会处理时间，这仅在 Scheduler 的上下文中才有意义。默认情况下，ReplaySubject 使用 `queue` 调度程序提供时钟。

