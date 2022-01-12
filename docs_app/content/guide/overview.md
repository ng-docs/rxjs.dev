# Introduction

# 介绍

RxJS is a library for composing asynchronous and event-based programs by using observable sequences. It provides one core type, the [Observable](./guide/observable), satellite types (Observer, Schedulers, Subjects) and operators inspired by `Array` methods (`map`, `filter`, `reduce`, `every`, etc) to allow handling asynchronous events as collections.

RxJS 是一个使用可观察序列编写异步和基于事件的程序的库。它提供了一种核心类型，即[Observable](./guide/observable) 、卫星类型（Observer、Scheduler、Subjects）和受 `Array` 方法（ `map` 、 `filter` 、 `reduce` 、 `every` 等）启发的运算符，以允许将异步事件作为集合处理。

<span class="informal">Think of RxJS as Lodash for events.</span>

<span class="informal">将 RxJS 视为事件的 Lodash。</span>

ReactiveX combines the [Observer pattern](https://en.wikipedia.org/wiki/Observer_pattern) with the [Iterator pattern](https://en.wikipedia.org/wiki/Iterator_pattern) and [functional programming with collections](http://martinfowler.com/articles/collection-pipeline/#NestedOperatorExpressions) to fill the need for an ideal way of managing sequences of events.

ReactiveX 将[观察者模式](https://en.wikipedia.org/wiki/Observer_pattern)与[迭代器模式](https://en.wikipedia.org/wiki/Iterator_pattern)和[函数式编程与集合](http://martinfowler.com/articles/collection-pipeline/#NestedOperatorExpressions)相结合，以满足对管理事件序列的理想方式的需求。

The essential concepts in RxJS which solve async event management are:

RxJS 中解决异步事件管理的基本概念是：

- **Observable:** represents the idea of an invokable collection of future values or events.

  **Observable：**表示未来值或事件的可调用集合的概念。

- **Observer:** is a collection of callbacks that knows how to listen to values delivered by the Observable.

  **Observer：**是一个回调集合，它知道如何监听 Observable 传递的值。

- **Subscription:** represents the execution of an Observable, is primarily useful for cancelling the execution.

  **Subscription：**表示一个 Observable 的执行，主要用于取消执行。

- **Operators:** are pure functions that enable a functional programming style of dealing with collections with operations like `map`, `filter`, `concat`, `reduce`, etc.

  **运算符：**是纯函数，可以使用 `map` 、 `filter` 、 `concat` 、 `reduce` 等操作来处理集合的函数式编程风格。

- **Subject:** is equivalent to an EventEmitter, and the only way of multicasting a value or event to multiple Observers.

  **Subject:**相当于一个 EventEmitter，也是将一个值或事件多播到多个 Observers 的唯一方式。

- **Schedulers:** are centralized dispatchers to control concurrency, allowing us to coordinate when computation happens on e.g. `setTimeout` or `requestAnimationFrame` or others.

  **调度器：**是控制并发的集中调度器，允许我们在计算发生时进行协调，例如 `setTimeout` 或 `requestAnimationFrame` 或其他。

## First examples

## 第一个例子

Normally you register event listeners.

通常你注册事件监听器。

```ts
document.addEventListener('click', () => console.log('Clicked!'));
```

Using RxJS you create an observable instead.

使用 RxJS 你创建了一个 observable。

```ts
import { fromEvent } from 'rxjs';

fromEvent(document, 'click').subscribe(() => console.log('Clicked!'));
```

### Purity

### 纯度

What makes RxJS powerful is its ability to produce values using pure functions. That means your code is less prone to errors.

RxJS 的强大之处在于它能够使用纯函数生成值。这意味着你的代码不太容易出错。

Normally you would create an impure function, where other pieces of your code can mess up your state.

通常你会创建一个不纯的函数，你的代码的其他部分可能会弄乱你的状态。

```ts
let count = 0;
document.addEventListener('click', () => console.log(`Clicked ${++count} times`));
```

Using RxJS you isolate the state.

使用 RxJS 可以隔离状态。

```ts
import { fromEvent, scan } from 'rxjs';

fromEvent(document, 'click')
  .pipe(scan((count) => count + 1, 0))
  .subscribe((count) => console.log(`Clicked ${count} times`));
```

The **scan** operator works just like **reduce** for arrays. It takes a value which is exposed to a callback. The returned value of the callback will then become the next value exposed the next time the callback runs.

**扫描**运算符的工作方式与数组的**reduce**类似。它接受一个暴露给回调的值。回调的返回值将成为下一次回调运行时暴露的下一个值。

### Flow

### 流动

RxJS has a whole range of operators that helps you control how the events flow through your observables.

RxJS 有一系列的操作符，可以帮助你控制事件如何在你的 observables 中流动。

This is how you would allow at most one click per second, with plain JavaScript:

这是使用纯 JavaScript 最多允许每秒单击一次的方式：

```ts
let count = 0;
let rate = 1000;
let lastClick = Date.now() - rate;
document.addEventListener('click', () => {
  if (Date.now() - lastClick >= rate) {
    console.log(`Clicked ${++count} times`);
    lastClick = Date.now();
  }
});
```

With RxJS:

使用 RxJS：

```ts
import { fromEvent, throttleTime, scan } from 'rxjs';

fromEvent(document, 'click')
  .pipe(
    throttleTime(1000),
    scan((count) => count + 1, 0)
  )
  .subscribe((count) => console.log(`Clicked ${count} times`));
```

Other flow control operators are [**filter**](../api/operators/filter), [**delay**](../api/operators/delay), [**debounceTime**](../api/operators/debounceTime), [**take**](../api/operators/take), [**takeUntil**](../api/operators/takeUntil), [**distinct**](../api/operators/distinct), [**distinctUntilChanged**](../api/operators/distinctUntilChanged) etc.

其他流控制运算符是[**filter**](../api/operators/filter) 、 [**delay**](../api/operators/delay) 、 [**debounceTime**](../api/operators/debounceTime) 、 [**take**](../api/operators/take) 、 [**takeUntil**](../api/operators/takeUntil) 、 [**distinct**](../api/operators/distinct) 、 [**distinctUntilChanged**](../api/operators/distinctUntilChanged)等。

### Values

### 价值观

You can transform the values passed through your observables.

你可以转换通过你的 observables 传递的值。

Here's how you can add the current mouse x position for every click, in plain JavaScript:

以下是使用纯 JavaScript 为每次单击添加当前鼠标 x 位置的方法：

```ts
let count = 0;
const rate = 1000;
let lastClick = Date.now() - rate;
document.addEventListener('click', (event) => {
  if (Date.now() - lastClick >= rate) {
    count += event.clientX;
    console.log(count);
    lastClick = Date.now();
  }
});
```

With RxJS:

使用 RxJS：

```ts
import { fromEvent, throttleTime, map, scan } from 'rxjs';

fromEvent(document, 'click')
  .pipe(
    throttleTime(1000),
    map((event) => event.clientX),
    scan((count, clientX) => count + clientX, 0)
  )
  .subscribe((count) => console.log(count));
```

Other value producing operators are [**pluck**](../api/operators/pluck), [**pairwise**](../api/operators/pairwise), [**sample**](../api/operators/sample) etc.

其他产生价值的运算符是[**pluck**](../api/operators/pluck) 、 [**pairwise**](../api/operators/pairwise) 、 [**sample**](../api/operators/sample)等。

