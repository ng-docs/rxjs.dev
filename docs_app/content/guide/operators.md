# RxJS Operators

# RxJS 运算符

RxJS is mostly useful for its _operators_, even though the Observable is the foundation. Operators are the essential pieces that allow complex asynchronous code to be easily composed in a declarative manner.

尽管 Observable 是基础，但 RxJS 对它的 _ 操作符 _ 最有用。运算符是允许以声明方式轻松组合复杂异步代码的基本部分。

## What are operators?

## 什么是运算符？

Operators are **functions**. There are two kinds of operators:

运算符是**函数**。有两种运算符：

**Pipeable Operators** are the kind that can be piped to Observables using the syntax `observableInstance.pipe(operator())`. These include, [`filter(...)`](/api/operators/filter), and [`mergeMap(...)`](/api/operators/mergeMap). When called, they do not _change_ the existing Observable instance. Instead, they return a _new_ Observable, whose subscription logic is based on the first Observable.

可管道**操作符**是可以使用语法 `observableInstance.pipe(operator())` 管道传输到 Observables 的类型。其中包括[`filter(...)`](/api/operators/filter)和[`mergeMap(...)`](/api/operators/mergeMap)。调用时，它们不会 _ 更改 _ 现有的 Observable 实例。相反，它们返回一个 _ 新 _ 的 Observable，其订阅逻辑基于第一个 Observable。

<span class="informal">A Pipeable Operator is a function that takes an Observable as its input and returns another Observable. It is a pure operation: the previous Observable stays unmodified.</span>

Pipeable Operator 是一个将 Observable 作为其输入并返回另一个 Observable 的函数。这是一个纯粹的操作：之前的 Observable 保持不变。

A Pipeable Operator is essentially a pure function which takes one Observable as input and generates another Observable as output. Subscribing to the output Observable will also subscribe to the input Observable.

Pipeable Operator 本质上是一个纯函数，它将一个 Observable 作为输入并生成另一个 Observable 作为输出。订阅输出 Observable 也会订阅输入 Observable。

**Creation Operators** are the other kind of operator, which can be called as standalone functions to create a new Observable. For example: `of(1, 2, 3)` creates an observable that will emit 1, 2, and 3, one right after another. Creation operators will be discussed in more detail in a later section.

**Creation Operators**是另一种运算符，可以作为独立函数调用以创建新的 Observable。例如： `of(1, 2, 3)` 创建一个 observable，它将一个接一个地发出 1、2 和 3。创建运算符将在后面的部分中更详细地讨论。

For example, the operator called [`map`](/api/operators/map) is analogous to the Array method of the same name. Just as `[1, 2, 3].map(x => x * x)` will yield `[1, 4, 9]`, the Observable created like this:

例如，名为[`map`](/api/operators/map)的运算符类似于同名的 Array 方法。正如 `[1, 2, 3].map(x => x * x)` 将产生 `[1, 4, 9]`，Observable 创建如下：

```ts
import { of, map } from 'rxjs';

of(1, 2, 3)
  .pipe(map((x) => x * x))
  .subscribe((v) => console.log(`value: ${v}`));

// Logs:
// value: 1
// value: 4
// value: 9
```

will emit `1`, `4`, `9`. Another useful operator is [`first`](/api/operators/first):

将发出 `1` , `4` , `9`。另一个有用的运算符是[`first`](/api/operators/first) ：

```ts
import { of, first } from 'rxjs';

of(1, 2, 3)
  .pipe(first())
  .subscribe((v) => console.log(`value: ${v}`));

// Logs:
// value: 1
```

Note that `map` logically must be constructed on the fly, since it must be given the mapping function to. By contrast, `first` could be a constant, but is nonetheless constructed on the fly. As a general practice, all operators are constructed, whether they need arguments or not.

请注意，`map` 必须在逻辑上动态构建，因为它必须被赋予映射函数。相比之下，`first` 可能是一个常数，但仍然是动态构建的。作为一般实践，所有运算符都是构造的，无论它们是否需要参数。

## Piping

## 管道

Pipeable operators are functions, so they _could_ be used like ordinary functions: `op()(obs)` — but in practice, there tend to be many of them convolved together, and quickly become unreadable: `op4()(op3()(op2()(op1()(obs))))`. For that reason, Observables have a method called `.pipe()` that accomplishes the same thing while being much easier to read:

可管道运算符是函数，因此它们 _ 可以 _ 像普通函数一样使用： `op()(obs)` — 但实际上，它们中的许多往往会卷积在一起，很快就会变得不可读： `op4()(op3()(op2()(op1()(obs))))`。出于这个原因，Observables 有一个名为 `.pipe()` 的方法，它完成了同样的事情，同时更容易阅读：

```ts
obs.pipe(op1(), op2(), op3(), op4());
```

As a stylistic matter, `op()(obs)` is never used, even if there is only one operator; `obs.pipe(op())` is universally preferred.

作为一种文体问题，即使只有一个运算符，也从不使用 `op()(obs)` ； `obs.pipe(op())` 是普遍首选的。

## Creation Operators

## 创建运算符

**What are creation operators?** Distinct from pipeable operators, creation operators are functions that can be used to create an Observable with some common predefined behavior or by joining other Observables.

**什么是创建运算符？**与可管道操作符不同，创建操作符是可用于创建具有一些常见预定义行为或加入其他 Observable 的 Observable 的函数。

A typical example of a creation operator would be the `interval` function. It takes a number (not an Observable) as input argument, and produces an Observable as output:

创建运算符的典型示例是 `interval` 函数。它将一个数字（不是 Observable）作为输入参数，并产生一个 Observable 作为输出：

```ts
import { interval } from 'rxjs';

const observable = interval(1000 /* number of milliseconds */);
```

See the list of all static creation operators [here](#creation-operators-list).

在[此处](#creation-operators-list)查看所有静态创建运算符的列表。

## Higher-order Observables

## 高阶 Observables

Observables most commonly emit ordinary values like strings and numbers, but surprisingly often, it is necessary to handle Observables _of_ Observables, so-called higher-order Observables. For example, imagine you had an Observable emitting strings that were the URLs of files you wanted to see. The code might look like this:

Observables 最常发出普通值，如字符串和数字，但令人惊讶的是，经常需要处理 Observables\_ 的\_Observables，即所谓的高阶 Observables。例如，假设你有一个 Observable 发射字符串，这些字符串是你想要查看的文件的 URL。代码可能如下所示：

```ts
const fileObservable = urlObservable.pipe(map((url) => http.get(url)));
```

`http.get()` returns an Observable (of string or string arrays probably) for each individual URL. Now you have an Observable _of_ Observables, a higher-order Observable.

`http.get()` ) 为每个单独的 URL 返回一个 Observable（可能是字符串或字符串数组）。现在你有了一个 Observable\_ 的\_Observable，一个高阶的 Observable。

But how do you work with a higher-order Observable? Typically, by _flattening_: by (somehow) converting a higher-order Observable into an ordinary Observable. For example:

但是你如何使用更高阶的 Observable 呢？通常，通过 _ 扁平化 _：通过（以某种方式）将高阶 Observable 转换为普通 Observable。例如：

```ts
const fileObservable = urlObservable.pipe(
  map((url) => http.get(url)),
  concatAll()
);
```

The [`concatAll()`](/api/operators/concatAll) operator subscribes to each "inner" Observable that comes out of the "outer" Observable, and copies all the emitted values until that Observable completes, and goes on to the next one. All of the values are in that way concatenated. Other useful flattening operators (called [_join operators_](#join-operators)) are

[`concatAll()`](/api/operators/concatAll)操作符订阅从“外部” Observable 出来的每个“内部” Observable，并复制所有发出的值，直到该 Observable 完成，然后继续下一个。所有值都以这种方式连接。其他有用的展平运算符（称为[_ 连接运算符 _](#join-operators)）是

- [`mergeAll()`](/api/operators/mergeAll) — subscribes to each inner Observable as it arrives, then emits each value as it arrives

  [`mergeAll()`](/api/operators/mergeAll) — 在每个内部 Observable 到达时订阅它，然后在它到达时发出每个值

- [`switchAll()`](/api/operators/switchAll) — subscribes to the first inner Observable when it arrives, and emits each value as it arrives, but when the next inner Observable arrives, unsubscribes to the previous one, and subscribes to the new one.

  [`switchAll()`](/api/operators/switchAll) — 在第一个内部 Observable 到达时订阅它，并在它到达时发出每个值，但是当下一个内部 Observable 到达时，取消订阅前一个，并订阅新的。

- [`exhaustAll()`](/api/operators/exhaustAll) — subscribes to the first inner Observable when it arrives, and emits each value as it arrives, discarding all newly arriving inner Observables until that first one completes, then waits for the next inner Observable.

  [`exhaustAll()`](/api/operators/exhaustAll) — 在第一个内部 Observable 到达时订阅它，并在它到达时发出每个值，丢弃所有新到达的内部 Observable 直到第一个完成，然后等待下一个内部 Observable。

Just as many array libraries combine [`map()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) and [`flat()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat) (or `flatten()`) into a single [`flatMap()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap), there are mapping equivalents of all the RxJS flattening operators [`concatMap()`](/api/operators/concatMap)
, [`mergeMap()`](/api/operators/mergeMap), [`switchMap()`](/api/operators/switchMap), and [`exhaustMap()`](/api/operators/exhaustMap).

正如许多数组库将[`map()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)和[`flat()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat)（或 `flatten()`）组合成一个[`flatMap()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap)一样，所有 RxJS 展平运算符[`concatMap()`](/api/operators/concatMap)、[`mergeMap()`](/api/operators/mergeMap)、[`switchMap()`](/api/operators/switchMap)和[`
exhaustMap()`](/api/operators/exhaustMap)都有映射等价物[`exhaustMap()`](/api/operators/exhaustMap)。

## Marble diagrams

## 大理石图

To explain how operators work, textual descriptions are often not enough. Many operators are related to time, they may for instance delay, sample, throttle, or debounce value emissions in different ways. Diagrams are often a better tool for that. _Marble Diagrams_ are visual representations of how operators work, and include the input Observable(s), the operator and its parameters, and the output Observable.

要解释运算符的工作原理，文字描述通常是不够的。许多算子都与时间有关，他们可能以不同的方式延迟、采样、节流或去抖动值发射。图表通常是更好的工具。_ 大理石图 _ 是算子如何工作的可视化表示，包括输入 Observable(s)、算子及其参数以及输出 Observable。

<span class="informal">In a marble diagram, time flows to the right, and the diagram describes how values ("marbles") are emitted on the Observable execution.</span>

<span class="informal">在弹珠图中，时间向右流动，该图描述了值（“弹珠”）是如何在 Observable 执行时发出的。</span>

Below you can see the anatomy of a marble diagram.

你可以在下面看到大理石图的解剖结构。

<img src="assets/images/guide/marble-diagram-anatomy.svg">

Throughout this documentation site, we extensively use marble diagrams to explain how operators work. They may be really useful in other contexts too, like on a whiteboard or even in our unit tests (as ASCII diagrams).

在整个文档站点中，我们广泛使用大理石图来解释操作员的工作方式。它们在其他环境中也可能非常有用，比如在白板上，甚至在我们的单元测试中（如 ASCII 图表）。

## Categories of operators

## 运营商的类别

There are operators for different purposes, and they may be categorized as: creation, transformation, filtering, joining, multicasting, error handling, utility, etc. In the following list you will find all the operators organized in categories.

有用于不同目的的运算符，它们可以分类为：创建、转换、过滤、加入、多播、错误处理、实用程序等。在以下列表中，你将找到按类别组织的所有运算符。

For a complete overview, see the [references page](/api).

如需完整概述，请参阅[参考资料页面](/api)。

### <a id="creation-operators-list"></a>Creation Operators

### 创建运算符

- [`ajax`](/api/ajax/ajax)
- [`bindCallback`](/api/index/function/bindCallback)
- [`bindNodeCallback`](/api/index/function/bindNodeCallback)
- [`defer`](/api/index/function/defer)
- [`empty`](/api/index/function/empty)
- [`from`](/api/index/function/from)
- [`fromEvent`](/api/index/function/fromEvent)
- [`fromEventPattern`](/api/index/function/fromEventPattern)
- [`generate`](/api/index/function/generate)
- [`interval`](/api/index/function/interval)
- [`of`](/api/index/function/of)
- [`range`](/api/index/function/range)
- [`throwError`](/api/index/function/throwError)
- [`timer`](/api/index/function/timer)
- [`iif`](/api/index/function/iif)

### <a id="join-creation-operators"></a>Join Creation Operators

### 加入创建运算符

These are Observable creation operators that also have join functionality -- emitting values of multiple source Observables.

这些是 Observable 创建运算符，它们也具有连接功能——发出多个源 Observable 的值。

- [`combineLatest`](/api/index/function/combineLatest)
- [`concat`](/api/index/function/concat)
- [`forkJoin`](/api/index/function/forkJoin)
- [`merge`](/api/index/function/merge)
- [`partition`](/api/index/function/partition)
- [`race`](/api/index/function/race)
- [`zip`](/api/index/function/zip)

### Transformation Operators

### 转换运算符

- [`buffer`](/api/operators/buffer)
- [`bufferCount`](/api/operators/bufferCount)
- [`bufferTime`](/api/operators/bufferTime)
- [`bufferToggle`](/api/operators/bufferToggle)
- [`bufferWhen`](/api/operators/bufferWhen)
- [`concatMap`](/api/operators/concatMap)
- [`concatMapTo`](/api/operators/concatMapTo)
- [`exhaust`](/api/operators/exhaust)
- [`exhaustMap`](/api/operators/exhaustMap)
- [`expand`](/api/operators/expand)
- [`groupBy`](/api/operators/groupBy)
- [`map`](/api/operators/map)
- [`mapTo`](/api/operators/mapTo)
- [`mergeMap`](/api/operators/mergeMap)
- [`mergeMapTo`](/api/operators/mergeMapTo)
- [`mergeScan`](/api/operators/mergeScan)
- [`pairwise`](/api/operators/pairwise)
- [`partition`](/api/operators/partition)
- [`pluck`](/api/operators/pluck)
- [`scan`](/api/operators/scan)
- [`switchScan`](/api/operators/switchScan)
- [`switchMap`](/api/operators/switchMap)
- [`switchMapTo`](/api/operators/switchMapTo)
- [`window`](/api/operators/window)
- [`windowCount`](/api/operators/windowCount)
- [`windowTime`](/api/operators/windowTime)
- [`windowToggle`](/api/operators/windowToggle)
- [`windowWhen`](/api/operators/windowWhen)

### Filtering Operators

### 过滤运算符

- [`audit`](/api/operators/audit)
- [`auditTime`](/api/operators/auditTime)
- [`debounce`](/api/operators/debounce)
- [`debounceTime`](/api/operators/debounceTime)
- [`distinct`](/api/operators/distinct)
- [`distinctUntilChanged`](/api/operators/distinctUntilChanged)
- [`distinctUntilKeyChanged`](/api/operators/distinctUntilKeyChanged)
- [`elementAt`](/api/operators/elementAt)
- [`filter`](/api/operators/filter)
- [`first`](/api/operators/first)
- [`ignoreElements`](/api/operators/ignoreElements)
- [`last`](/api/operators/last)
- [`sample`](/api/operators/sample)
- [`sampleTime`](/api/operators/sampleTime)
- [`single`](/api/operators/single)
- [`skip`](/api/operators/skip)
- [`skipLast`](/api/operators/skipLast)
- [`skipUntil`](/api/operators/skipUntil)
- [`skipWhile`](/api/operators/skipWhile)
- [`take`](/api/operators/take)
- [`takeLast`](/api/operators/takeLast)
- [`takeUntil`](/api/operators/takeUntil)
- [`takeWhile`](/api/operators/takeWhile)
- [`throttle`](/api/operators/throttle)
- [`throttleTime`](/api/operators/throttleTime)

### <a id="join-operators"></a>Join Operators

### 加入运营商

Also see the [Join Creation Operators](#join-creation-operators) section above.

另请参阅上面的[连接创建运算符](#join-creation-operators)部分。

- [`combineLatestAll`](/api/operators/combineLatestAll)
- [`concatAll`](/api/operators/concatAll)
- [`exhaustAll`](/api/operators/exhaustAll)
- [`mergeAll`](/api/operators/mergeAll)
- [`switchAll`](/api/operators/switchAll)
- [`startWith`](/api/operators/startWith)
- [`withLatestFrom`](/api/operators/withLatestFrom)

### Multicasting Operators

### 多播运算符

- [`multicast`](/api/operators/multicast)
- [`publish`](/api/operators/publish)
- [`publishBehavior`](/api/operators/publishBehavior)
- [`publishLast`](/api/operators/publishLast)
- [`publishReplay`](/api/operators/publishReplay)
- [`share`](/api/operators/share)

### Error Handling Operators

### 错误处理运算符

- [`catchError`](/api/operators/catchError)
- [`retry`](/api/operators/retry)
- [`retryWhen`](/api/operators/retryWhen)

### Utility Operators

### 公用事业运营商

- [`tap`](/api/operators/tap)
- [`delay`](/api/operators/delay)
- [`delayWhen`](/api/operators/delayWhen)
- [`dematerialize`](/api/operators/dematerialize)
- [`materialize`](/api/operators/materialize)
- [`observeOn`](/api/operators/observeOn)
- [`subscribeOn`](/api/operators/subscribeOn)
- [`timeInterval`](/api/operators/timeInterval)
- [`timestamp`](/api/operators/timestamp)
- [`timeout`](/api/operators/timeout)
- [`timeoutWith`](/api/operators/timeoutWith)
- [`toArray`](/api/operators/toArray)

### Conditional and Boolean Operators

### 条件和布尔运算符

- [`defaultIfEmpty`](/api/operators/defaultIfEmpty)
- [`every`](/api/operators/every)
- [`find`](/api/operators/find)
- [`findIndex`](/api/operators/findIndex)
- [`isEmpty`](/api/operators/isEmpty)

### Mathematical and Aggregate Operators

### 数学和聚合运算符

- [`count`](/api/operators/count)
- [`max`](/api/operators/max)
- [`min`](/api/operators/min)
- [`reduce`](/api/operators/reduce)

## Creating custom operators

## 创建自定义运算符

### Use the `pipe()` function to make new operators

### 使用 `pipe()` 函数创建新的运算符

If there is a commonly used sequence of operators in your code, use the `pipe()` function to extract the sequence into a new operator. Even if a sequence is not that common, breaking it out into a single operator can improve readability.

如果代码中有常用的运算符序列，请使用 `pipe()` 函数将序列提取到新的运算符中。即使序列不是那么常见，将其分解为单个运算符也可以提高可读性。

For example, you could make a function that discarded odd values and doubled even values like this:

例如，你可以创建一个丢弃奇数值并将偶数值翻倍的函数，如下所示：

```ts
import { pipe, filter, map } from 'rxjs';

function discardOddDoubleEven() {
  return pipe(
    filter((v) => !(v % 2)),
    map((v) => v + v)
  );
}
```

(The `pipe()` function is analogous to, but not the same thing as, the `.pipe()` method on an Observable.)

（`pipe()` 函数类似于 Observable 上的 `.pipe()` 方法，但并不相同。）

### Creating new operators from scratch

### 从头开始创建新的运算符

It is more complicated, but if you have to write an operator that cannot be made from a combination of existing operators (a rare occurrance), you can write an operator from scratch using the Observable constructor, like this:

它更复杂，但如果你必须编写一个不能由现有运算符组合而成的运算符（很少发生），你可以使用 Observable 构造函数从头开始编写一个运算符，如下所示：

```ts
import { Observable, of } from 'rxjs';

function delay<T>(delayInMillis: number) {
  return (observable: Observable<T>) =>
    new Observable<T>((subscriber) => {
      // this function will be called each time this
      // Observable is subscribed to.
      const allTimerIDs = new Set();
      let hasCompleted = false;
      const subscription = observable.subscribe({
        next(value) {
          // Start a timer to delay the next value
          // from being pushed.
          const timerID = setTimeout(() => {
            subscriber.next(value);
            // after we push the value, we need to clean up the timer timerID
            allTimerIDs.delete(timerID);
            // If the source has completed, and there are no more timers running,
            // we can complete the resulting observable.
            if (hasCompleted && allTimerIDs.size === 0) {
              subscriber.complete();
            }
          }, delayInMillis);

          allTimerIDs.add(timerID);
        },
        error(err) {
          // We need to make sure we're propagating our errors through.
          subscriber.error(err);
        },
        complete() {
          hasCompleted = true;
          // If we still have timers running, we don't want to complete yet.
          if (allTimerIDs.size === 0) {
            subscriber.complete();
          }
        },
      });

      // Return the teardown logic. This will be invoked when
      // the result errors, completes, or is unsubscribed.
      return () => {
        subscription.unsubscribe();
        // Clean up our timers.
        for (const timerID of allTimerIDs) {
          clearTimeout(timerID);
        }
      };
    });
}

// Try it out!
of(1, 2, 3).pipe(delay(1000)).subscribe(console.log);
```

Note that you must

请注意，你必须

1. implement all three Observer functions, `next()`, `error()`, and `complete()` when subscribing to the input Observable.

   在订阅输入 Observable 时实现所有三个 Observer 函数，`next()`，`error()` 和 `complete()`。

2. implement a "teardown" function that cleans up when the Observable completes (in this case by unsubscribing and clearing any pending timeouts).

   实现一个“拆卸”功能，在 Observable 完成时进行清理（在这种情况下，通过取消订阅和清除任何挂起的超时）。

3. return that teardown function from the function passed to the Observable constructor.

   从传递给 Observable 构造函数的函数中返回该拆解函数。

Of course, this is only an example; the [`delay()`](/api/operators/delay) operator already exists.

当然，这只是一个例子； [`delay()`](/api/operators/delay)运算符已经存在。

