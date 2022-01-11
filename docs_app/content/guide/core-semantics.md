# RxJS Core Semantics

# RxJS 核心语义

Starting in version 8, all RxJS operators that are provided in the core library MUST meet the following semantics. In the current version, version 7, all operators SHOULD meet the following semantics (as guidelines). If they do not, we need to track the issue on [GitHub](https://github.com/ReactiveX/rxjs/issues).

从版本 8 开始，核心库中提供的所有 RxJS 操作符必须满足以下语义。在当前版本 7 中，所有操作符都应该满足以下语义（作为准则）。如果没有，我们需要在[GitHub 上](https://github.com/ReactiveX/rxjs/issues)跟踪问题。

## Purpose

## 目的

The purpose of these semantics is provide predictable behavior for the users of our library, and to ensure consistent behavior between our many different operators. It should be noted that at the time of this writing, we don't always adhere to these semantic guidelines. This document is to serve as a goalpost for upcoming changes and work as much as it is to help describe the library. This is also a "living document" and is subject to change.

这些语义的目的是为我们库的用户提供可预测的行为，并确保我们的许多不同操作符之间的行为一致。应该注意的是，在撰写本文时，我们并不总是遵守这些语义准则。本文档将作为即将发生的更改的目标，并尽可能地帮助描述库。这也是一份“活文件”，可能会发生变化。

## General Design Guidelines

## 一般设计指南

**Functions such as operators, constructors, and creation functions, should use named parameters in cases where there is more than 1 argument, and arguments after the first are non-obvious.** The primary use case should be streamlined to work without configuration. For example, `fakeFlattenMap(n => of(n))` is fine, but `fakeFlattenMap(n => of(n), 1)` is less readable than `fakeFlattenMap(n => of(n), { maxConcurrent: 1 })`. Other things, like `of(1, 2, 3)` are obvious enough that named parameters don't make
sense.

**操作符、构造函数和创建函数等函数在有多个参数的情况下应使用命名参数，并且第一个参数之后的参数不明显。**应简化主要用例，使其无需配置即可工作。例如，`fakeFlattenMap(n => of(n))` 很好，但 `fakeFlattenMap(n => of(n), 1)` 的可读性不如 `fakeFlattenMap(n => of(n), { maxConcurrent: 1 })`。其他的东西，比如 `of(1, 2, 3)` 很明显，命名参数没有意义。

## Operators

## 运营商

- MUST be a function that returns an [operator function](https://rxjs.dev/api/index/interface/OperatorFunction). That is `(source: Observable<In>) => Observable<Out>`.

  必须是返回[操作符函数的函数](https://rxjs.dev/api/index/interface/OperatorFunction)。那就是 `(source: Observable<In>) => Observable<Out>`。

- The returned operator function MUST be [referentially transparent](https://en.wikipedia.org/wiki/Referential_transparency). That is to say, that if you capture the return value of the operator (e.g. `const double => map(x => x + x)`), you can use that value to operate on any many observables as you like without changing any underlying state in the operator reference. (e.g. `a$.pipe(double)` and `b$.pipe(double)`).

  返回的操作符函数必须是[引用透明](https://en.wikipedia.org/wiki/Referential_transparency)的。也就是说，如果你捕获操作符的返回值（例如 `const double => map(x => x + x)`），你可以使用该值对任意多个 observables 进行任意操作，而无需更改任何底层操作员参考中的状态。（例如 `a$.pipe(double)` 和 `b$.pipe(double)`）。

- The observable returned by the operator function MUST subscribe to the source.

  操作函数返回的 observable 必须订阅源。

- If the operation performed by the operator can tell it not change anything about the output of the source, it MUST return the reference to the source. For example `take(Infinity)` or `skip(0)`.

  如果操作员执行的操作可以告诉它不会改变源输出的任何内容，它必须返回对源的引用。例如 `take(Infinity)` 或 `skip(0)`。

- Operators that accept a "notifier", that is another observable source that is used to trigger some behavior, must accept any type that can be converted to an `Observable` with `from`. For example `takeUntil`.

  接受“通知者”的操作符，即另一个用于触发某些行为的可观察源，必须接受可以转换为 `Observable` 的任何类型 `from`。例如 `takeUntil`。

- Operators that accept "notifiers" (as described above), MUST ONLY recognized next values from the notifier as "notifications". Emitted completions may not be used a source of notification.

  接受“通知器”（如上所述）的操作员必须仅将来自通知器的下一个值识别为“通知”。发出的完成不能用作通知源。

- "Notifiers" provided directly to the operator MUST be subscribed to _before_ the source is subscribed to. "Notifiers" created via factory function provided to the operator SHOULD be subscribed to at the earliest possible moment.

  直接提供给运营商的“通知程序”必须在订阅源 _ 之前 _ 订阅。通过提供给操作员的工厂函数创建的“通知程序”应该尽早订阅。

- The observable returned by the operator function is considered to be the "consumer" of the source. As such, the consumer MUST unsubscribe from the source as soon as it knows it no longer needs values before proceeding to do _any_ action.

  operator 函数返回的 observable 被认为是源的“消费者”。因此，消费者必须在知道不再需要值后立即取消订阅源，然后再继续执行 _ 任何 _ 操作。

- Events that happen after the completion of a source SHOULD happen after the source finalizes. This is to ensure that finalization always happens in a predictable time frame relative to the event.

  在源完成后发生的事件应该在源完成后发生。这是为了确保最终确定始终发生在与事件相关的可预测时间范围内。

- `Error` objects MUST NOT be retained longer than necessary. This is a possible source of memory pressure.

  `Error` 对象的保留时间不得超过必要的时间。这可能是内存压力的来源。

- `Promise` references MUST NOT be retained longer than necessary. This is a possible source of memory pressure.

  `Promise` 引用的保留时间不得超过必要的时间。这可能是内存压力的来源。

- IF they perform a related operation to a creation function, they SHOULD share the creation function's name only with the suffix `With`. (e.g. `concat` and `concatWith`).

  如果他们对创建函数执行相关操作，他们应该只使用后缀 `With` 共享创建函数的名称。（例如 `concat` 和 `concatWith`）。

- SHOULD NOT have "result selectors". This is a secondary argument that provides the ability to "map" values after performing the primary operation of the operator.

  不应该有“结果选择器”。这是一个辅助参数，它提供了在执行操作符的主要操作之后“映射”值的能力。

## Creation Functions

## 创建函数

- Names MUST NOT end in `With`. That is reserved for the operator counter parts of creation functions.

  名称不得以 `With` 结尾。这是为创建功能的操作员计数器部分保留的。

- MAY have "result selectors". This is a secondary argument that provides the ability to "map" values before they're emitted from the resulting observable.

  可能有“结果选择器”。这是第二个参数，它提供了在值从结果 observable 发出之前“映射”值的能力。

- IF the creation function accepts a "result selector", it must not accept "n-arguments" ahead of that result selector. Instead, it should accept an array or possibly an object. (bad: `combineThings(sourceA$, sourceB$, (a, b) => a + b)`, good: `combineThings([sourceA$, sourceB$], (a, b) => a + b)`. In this case, it may be okay to provide the result selector as a second argument, rather than as a named parameter, as the use should be fairly obvious.

  如果创建函数接受“结果选择器”，则它不能在该结果选择器之前接受“n-arguments”。相反，它应该接受一个数组或者可能是一个对象。(坏: `combineThings(sourceA$, sourceB$, (a, b) => a + b)` 好: `combineThings([sourceA$, sourceB$], (a, b) => a + b)`。在这种情况下，将结果选择器作为第二个参数而不是作为命名参数提供可能是可以的，因为使用应该相当明显。

